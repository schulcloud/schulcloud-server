const rp = require('request-promise-native');
const url = require('url');
const moment = require('moment');
const { JWE, JWK, JWS } = require('jose');
const uuid = require('uuid/v4');
const commons = require('@schul-cloud/commons');
const accountModel = require('../../../account/model');

const Config = new commons.Configuration();
Config.init();

const ENTITY_SOURCE = 'tsp'; // used as source attribute in created users and classes
const SOURCE_ID_ATTRIBUTE = 'tspUid'; // name of the uid attribute within sourceOptions

const ENCRYPTION_KEY = Config.get('TSP_API_ENCRYPTION_KEY');
const SIGNATURE_KEY = Config.get('TSP_API_SIGNATURE_KEY');
const BASE_URL = Config.get('TSP_API_BASE_URL');
const CLIENT_ID = Config.get('TSP_API_CLIENT_ID');
const CLIENT_SECRET = Config.get('TSP_API_CLIENT_SECRET');
const TOKEN_ISS = process.env.SC_DOMAIN || 'schulcloud-thueringen.de';
const TOKEN_SUB = process.env.HOST || 'https://schulcloud-thueringen.de';

const ENCRYPTION_OPTIONS = { alg: 'dir', enc: 'A128CBC-HS256' };
const SIGNATURE_OPTIONS = { alg: 'HS512' };

/**
 * Converts a string to a jose-compatible base64url string
 * @param {String} string a string
 * @returns {String} the converted string
 */
const toBase64Url = (string) => Buffer.from(string, 'utf-8')
	.toString('base64')
	.replace(/=/g, '')
	.replace(/\+/g, '-')
	.replace(/\//g, '_');

/**
 * Generates a username for a given user-like object
 * @param {User|TSP-User} user Schul-Cloud user or TSP user object
 * @throws {Error} if user is not a valid user object
 */
const getUsername = (user) => {
	let username = '';
	if (user.sourceOptions) {
		// user is a Schul-Cloud user or behaves like it
		username = `${ENTITY_SOURCE}/${user.sourceOptions[SOURCE_ID_ATTRIBUTE]}`;
	} else if (user.authUID) {
		// user is a TSP user (e.g. during authentication)
		username = `${ENTITY_SOURCE}/${user.authUID}`;
	} else {
		throw new Error('Invalid user object.', user);
	}
	return username.toLowerCase();
};

/**
 * Generate an email address for a given user-like object
 * @param {User|TSP-User} user Schul-Cloud user or TSP user object
 */
const getEmail = (user) => `${getUsername(user)}@schul-cloud.org`;

/**
 * Registers a user and creates an account
 * @param {Object} userOptions options to be provided to the user service
 * @param {Array<String>} roles the user's roles
 * @param {System} systemId the user's login system
 * @returns {User} the user object
 * @async
 */
const createUserAndAccount = async (app, userOptions, roles, systemId) => {
	const username = getUsername(userOptions);
	const email = getEmail(userOptions);
	const { pin } = await app.service('registrationPins').create({
		email,
		verified: true,
		silent: true,
	});
	const user = await app.service('users').create({
		...userOptions,
		pin,
		email,
		roles,
	});
	await accountModel.create({
		userId: user._id,
		username,
		systemId,
		activated: true,
	});
	return user;
};

/**
 * Finds and returns the school identified by the given identifier
 * @async
 * @param {string} tspIdentifier TSP school identifier
 * @returns {School|null} the school or null if it doesn't exist
 */
const findSchool = async (tspIdentifier) => {
	const schools = await this.app.service('schools').find({
		query: {
			source: ENTITY_SOURCE,
			'sourceOptions.schoolIdentifier': tspIdentifier,
			$limit: 1,
		},
		paginate: false,
	});
	if (Array.isArray(schools)) {
		return schools[0];
	}
	return null;
};

const getEncryptionKey = () => JWK.asKey({
	kty: 'oct', k: ENCRYPTION_KEY, alg: ENCRYPTION_OPTIONS.enc, use: 'enc',
});
const encryptToken = (payload) => JWE.encrypt(payload, getEncryptionKey(), ENCRYPTION_OPTIONS);
const decryptToken = (payload) => {
	const decryptedPayload = JWE.decrypt(payload, getEncryptionKey(), ENCRYPTION_OPTIONS);
	return JSON.parse(decryptedPayload.toString());
};

const getSignKey = () => JWK.asKey({
	kty: 'oct', k: toBase64Url(SIGNATURE_KEY), alg: SIGNATURE_OPTIONS.alg, use: 'sig',
});
const signToken = (token) => JWS.sign(token, getSignKey(), SIGNATURE_OPTIONS);
const verifyToken = (token) => JWS.verify(token, getSignKey(), SIGNATURE_OPTIONS);

/**
 * TSP API wrapper
 * @class TspApi
 */
class TspApi {
	/**
	 * Creates an instance of TspApi
	 */
	constructor() {
		this.lastToken = null;
		this.lastTokenExpires = TspApi.formatDate(Date.now());
	}

	static formatDate(d) {
		return Math.floor(d / 1000);
	}

	/**
	 * Returns a JWT to be used with the TSP API. Generated tokens will be cached until
	 * one second before their expiry and re-used if needed to improve performance.
	 * @param {Integer} lifetime the token's max age in milliseconds. Default: 30000
	 * @returns {String} JWT in compact format
	 */
	getJwt(lifetime = 30000) {
		const issueDate = TspApi.formatDate(Date.now());
		if (issueDate < this.lastTokenExpires - 1000) {
			return this.lastToken;
		}
		this.lastTokenExpires = issueDate + lifetime;
		const payload = JSON.stringify({
			apiClientSecret: CLIENT_SECRET,
			iss: TOKEN_ISS,
			aud: BASE_URL,
			sub: TOKEN_SUB,
			exp: issueDate + lifetime,
			iat: issueDate,
			jti: uuid(),
		});
		const jwt = signToken(encryptToken(payload));
		this.lastToken = jwt;
		return jwt;
	}

	/**
	 * Returns request headers needed to communicate with the TSP API
	 * @returns {Object} headers
	 */
	getHeaders() {
		return {
			Authorization: `AUTH-JWT apiClientId=${CLIENT_ID},jwt=${this.getJwt()}`,
		};
	}

	/**
	 * Requests and returns a TSP resource.
	 * Results are parsed and returned as Objects/Arrays.
	 * @param {String} path resource path
	 * @param {Date} [lastChange=new Date(0)] request changes afer this date only
	 * @returns {Object|Array} the requested resource
	 */
	async request(path, lastChange = new Date(0)) {
		const lastChangeDate = moment(lastChange).format('YYYY-MM-DD HH:mm:ss.SSS');

		const requestUrl = url.resolve(BASE_URL, path);
		const response = await rp(requestUrl, {
			headers: this.getHeaders(),
			qs: {
				dtLetzteAenderung: lastChangeDate,
			},
		});
		return JSON.parse(response);
	}
}

module.exports = {
	ENTITY_SOURCE,
	SOURCE_ID_ATTRIBUTE,
	TspApi,
	config: {
		FEATURE_ENABLED: Config.get('FEATURE_TSP_ENABLED'),
		BASE_URL,
	},
	getUsername,
	getEmail,
	createUserAndAccount,
	findSchool,
	encryptToken,
	decryptToken,
	signToken,
	verifyToken,
};
