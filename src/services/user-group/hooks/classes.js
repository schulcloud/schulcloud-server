const { authenticate } = require('@feathersjs/authentication');
const globalHooks = require('../../../hooks');

const { sortByGradeAndOrName, prepareGradeLevelUnset } = require('./helpers/classHooks');

const restrictToCurrentSchool = globalHooks.ifNotLocal(globalHooks.restrictToCurrentSchool);
const restrictToUsersOwnClasses = globalHooks.ifNotLocal(globalHooks.restrictToUsersOwnClasses);


exports.before = {
	all: [authenticate('jwt')],
	find: [
		globalHooks.hasPermission('CLASS_VIEW'),
		restrictToCurrentSchool,
		restrictToUsersOwnClasses,
		sortByGradeAndOrName,
		globalHooks.mapPaginationQuery,
	],
	get: [
		restrictToCurrentSchool,
		restrictToUsersOwnClasses,
	],
	create: [
		globalHooks.hasPermission('CLASS_CREATE'),
		restrictToCurrentSchool,
	],
	update: [
		globalHooks.hasPermission('CLASS_EDIT'),
		restrictToCurrentSchool,
		prepareGradeLevelUnset,
	],
	patch: [
		globalHooks.hasPermission('CLASS_EDIT'),
		restrictToCurrentSchool,
		globalHooks.permitGroupOperation,
		prepareGradeLevelUnset,
	],
	remove: [globalHooks.hasPermission('CLASS_REMOVE'), restrictToCurrentSchool, globalHooks.permitGroupOperation],
};


const saveSuccessor = async (context) => {
	if (context.data.predecessor) {
		await context.app.service('classes').patch(context.data.predecessor, { successor: context.result._id });
	}
	return context;
};

exports.after = {
	all: [],
	find: [],
	get: [
		globalHooks.ifNotLocal(
			globalHooks.denyIfNotCurrentSchool({
				errorMessage: 'Die angefragte Gruppe gehört nicht zur eigenen Schule!',
			}),
		)],
	create: [
		saveSuccessor,
	],
	update: [],
	patch: [],
	remove: [],
};