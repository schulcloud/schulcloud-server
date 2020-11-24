const mongoose = require('mongoose');
const reqlib = require('app-root-path').require;

const errorHandlers = require('./errors');

const { Forbidden } = reqlib('src/errors');

class LdapConfigService {
	setup(app) {
		this.app = app;
	}

	/**
	 * `GET /ldap-config/:systemId`
	 * Returns the ldapConfig of a given system in the same format as accepted
	 * by the other methods of this service.
	 * If the given system is not a LDAP system (i.e. does not have the ldapConfig
	 * attribute) or is not of the type `general` (i.e. a self-service config), the
	 * access is denied.
	 * To access the system data, the authentication information are proxied to the
	 * System service, so that access is only granted to administrators and only to
	 * systems of the own school.
	 * @param {ObjectId} systemId ID of an existing system with LDAP config
	 * @param {Object} params Feathers request params
	 * @returns {Object} ldapConfig attribute of the given system
	 */
	async get(systemId, params) {
		// Proxying the request params here to have the system service hooks check
		// the permissions, filtering sensitive data, etc.
		const system = await this.app.service('systems').get(systemId, params);
		if (!system.ldapConfig || system.ldapConfig.provider !== 'general') {
			throw new Forbidden('The requested system is not configurable with this endpoint');
		}
		return system.ldapConfig;
	}

	/**
	 * `POST /ldap-config`
	 * Creates a new system with the given LDAP config and attaches it to the
	 * caller's school, if the config is validated successfully. The validation
	 * result is returned.
	 * If `validateOnly === true`, changes are not persisted to the systems and
	 * school collection. Otherwise, a new system is created.
	 * After creating the system, if `activate !== false`, it is added as a login
	 * system to the caller's school and the school's ldapSchoolIdentifier attribute
	 * is set to the config's base path.
	 * @param {Object} config an LDAP config (given as JSON in request body)
	 * @param {Object} params Feathers request params
	 * @returns {Object} validation result object
	 * `{ ok: Boolean, errors: [], users: {}, classes: {} }`
	 */
	async create(config, params) {
		return this.verifyAndSaveLdapConfig(config, this.getOptions(params));
	}

	/**
	 * `PATCH /ldap-config/:systemId`
	 * Patches an existing system with the given LDAP config and attaches it to
	 * the caller's school if the config is validated successfully.
	 * If `validateOnly === true`, changes are not persisted to the systems and
	 * school collection. Otherwise, the system is patched.
	 * After patching the system, if `activate !== false`, it is added as a login
	 * system to the caller's school and the school's ldapSchoolIdentifier attribute
	 * is set to the config's base path.
	 * @param {ObjectId} id systemId of system to patch
	 * @param {Object} config LDAP config object
	 * @param {Object} params Feathers request params
	 * @returns validation result object
	 * `{ ok: Boolean, errors: [], users: {}, classes: {} }`
	 */
	async patch(id, config, params) {
		return this.verifyAndSaveLdapConfig(config, {
			...this.getOptions(params),
			systemId: id,
		});
	}

	/**
	 * Retrieves and returns options object to be used for #verifyAndSaveLdapConfig
	 * @param {Object} params feathers request params
	 * @returns {Object} options `{ schoolId: ObjectId, activateSystem: Boolean, saveSystem: Boolean}`
	 */
	getOptions(params) {
		const { verifyOnly, activate } = params.query;

		const saveSystem = verifyOnly !== true && verifyOnly !== 'true';
		const activateSystem = activate !== false && activate !== 'false';

		return {
			schoolId: params.account.schoolId,
			activateSystem,
			saveSystem,
		};
	}

	/**
	 * Actual business logic to validate and save LDAP configs
	 * @param {Object} config config data
	 * @param {Object} options options object
	 * @returns {Object} verification result
	 */
	async verifyAndSaveLdapConfig(config, options) {
		const verificationResult = await this.verifyConfig(config);
		if (verificationResult.ok && options.saveSystem) {
			await this.saveConfig(config, options.schoolId, options.systemId, options.activateSystem);
		}
		return verificationResult;
	}

	/**
	 * Verifies a given config by connecting to the server and retrieving sample
	 * objects. Errors are caught and categorized.
	 * @param {Object} config LDAP config object
	 * @returns {Object} verification result object
	 * `{ ok: Boolean, errors: [], users: {}, classes: {} }`
	 */
	async verifyConfig(config) {
		const ldap = this.app.service('ldap');
		const result = {
			ok: false,
			errors: [],
			users: {},
			classes: {},
		};
		try {
			const users = await ldap.getUsers(config);
			result.users = LdapConfigService.generateUserStats(users);
			if (LdapConfigService.shouldVerifyClasses(config)) {
				const classes = await ldap.getClasses(config);
				result.classes = LdapConfigService.generateClassStats(classes);
			}
			result.ok = true;
		} catch (error) {
			for (const { match, message: messagefn, type } of errorHandlers) {
				if (match(error)) {
					const message = messagefn instanceof Function ? messagefn(error) : messagefn;
					result.errors.push({ message, type });
				}
			}
			if (result.errors.length === 0) {
				// Something unexpected happened, so let's push it to the logs and
				// tell the client that this was not planned
				throw error;
			}
		} finally {
			ldap.disconnect(config);
		}
		return result;
	}

	/**
	 * Saves (and optionally activates) an LDAP config for a given school.
	 * If no systemId is given, a new system will be created and assigned.
	 * @param {Object} config LDAP config object
	 * @param {ObjectId} schoolId id of the school
	 * @param {Object} [systemId] optional id of the system to update
	 * @param {Boolean} [activate=true] optional value for `ldapConfig.active`
	 */
	async saveConfig(config, schoolId, systemId = undefined, activate = true) {
		const systemService = await this.app.service('systems');
		const schoolsService = await this.app.service('schools');

		const school = await schoolsService.get(schoolId);
		const system = LdapConfigService.constructSystem(config, school, activate);

		const session = await mongoose.startSession();
		await session.withTransaction(async () => {
			if (systemId) {
				// update existing system (already assigned to school)
				const thingsToDo = [systemService.patch(systemId, system)];
				if (activate) {
					thingsToDo.push(
						schoolsService.patch(schoolId, {
							ldapSchoolIdentifier: config.rootPath,
						})
					);
				}
				await Promise.all(thingsToDo);
			} else {
				// create a new system and assign it to the school
				const { _id: newSystemId } = await systemService.create(system);
				if (activate) {
					await schoolsService.patch(schoolId, {
						ldapSchoolIdentifier: config.rootPath,
						$addToSet: {
							systems: newSystemId,
						},
					});
				}
			}
		});
		await session.endSession();
	}

	/**
	 * Returns a system collection object based on an abbreviated LDAP config
	 * object and a school object. The school's name will be used for both system
	 * `alias` and `ldapConfig.providerOptions.schoolName`. Provider is always
	 * `general`. Type is always `ldap`.
	 * @static
	 * @param {Object} config LDAP config object
	 * @param {School} school the school at which to activate the system
	 * @param {boolean} [activate=true] optional value for `ldapConfig.active`
	 * @returns {System} system object to be used for creating or updating
	 */
	static constructSystem(config, school, activate = true) {
		return {
			type: 'ldap',
			alias: school.name,
			ldapConfig: {
				...config,
				provider: 'general',
				providerOptions: {
					...config.providerOptions,
					schoolName: school.name,
				},
				active: activate,
			},
		};
	}

	/**
	 * Generates statistics about LDAP verification result for users.
	 * @static
	 * @param {Array} [users=[]] array of users returned from LDAP provider strategy #getUsers
	 * @returns {Object} statistics
	 * `{ total: Number, admin: Number, teacher: Number, student: Number, sample: {} }`
	 */
	static generateUserStats(users = []) {
		const result = {
			total: users.length,
			admin: 0,
			teacher: 0,
			student: 0,
			sample: users.length > 0 ? users[0] : {},
		};
		for (const user of users) {
			if (user.roles.includes('administrator')) result.admin += 1;
			if (user.roles.includes('teacher')) result.teacher += 1;
			if (user.roles.includes('student')) result.student += 1;
		}
		return result;
	}

	/**
	 * Generates statistics about LDAP verification result for classes.
	 * @static
	 * @param {Array} [classes=[]] array of classes returned from LDAP provider strategy #getClasses
	 * @returns {Object} statistics
	 * `{ total: Number, sample: {} }`
	 */
	static generateClassStats(classes = []) {
		return {
			total: classes.length,
			sample: classes.length > 0 ? classes[0] : {},
		};
	}

	/**
	 * Determines whether a given config needs to sync classes.
	 * Specifically, returns `false` if classPathAdditions are undefined or empty
	 * and `true` otherwise
	 * @static
	 * @param {Object} config LDAP config object
	 * @returns {Boolean} true/false
	 */
	static shouldVerifyClasses(config) {
		return (
			config.providerOptions &&
			config.providerOptions.classPathAdditions &&
			config.providerOptions.classPathAdditions !== ''
		);
	}
}

module.exports = LdapConfigService;
