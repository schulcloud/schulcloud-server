const service = require('feathers-mongoose');
const {
	courseModel,
	courseGroupModel,
	gradeModel,
} = require('./model');
const hooks = require('./hooks');
const courseGroupsHooks = require('./hooks/courseGroups');
const courseCopyService = require('./services/course-copy-service');
const courseScopelistService = require('./services/courseScopeLists');
const ClassSuccessorService = require('./services/classSuccessor');
const { setup: coursePermissionService } = require('./services/coursePermission');
const { setup: courseMembersService } = require('./services/courseMembers');
const classSuccessorHooks = require('./hooks/classSuccessor');
const { classesService, classesHooks } = require('./services/classes');
const { classModelService, classModelHooks } = require('./services/classModelService');

// eslint-disable-next-line func-names
module.exports = function () {
	const app = this;

	app.configure(courseCopyService);

	/* Course model */
	app.use('/courses', service({
		Model: courseModel,
		paginate: {
			default: 25,
			max: 100,
		},
		lean: { virtuals: true },
	}));
	const courseService = app.service('/courses');
	courseService.hooks(hooks);

	/* CourseGroup model */
	app.use('/courseGroups', service({
		Model: courseGroupModel,
		paginate: {
			default: 25,
			max: 100,
		},
		lean: true,
	}));
	const courseGroupService = app.service('/courseGroups');
	courseGroupService.hooks(courseGroupsHooks);

	/* Class model */
	app.use('/classModel', classModelService);
	app.service('/classModel').hooks(classModelHooks);

	app.use('/classes', classesService);
	app.service('/classes').hooks(classesHooks);

	/* Grade model */
	app.use('/grades', service({
		Model: gradeModel,
		paginate: {
			default: 25,
			max: 100,
		},
		lean: true,
	}));
	const gradeService = app.service('/grades');
	gradeService.hooks(hooks);

	app.use('/classes/successor', new ClassSuccessorService(app));
	const classSuccessorService = app.service('/classes/successor');
	classSuccessorService.hooks(classSuccessorHooks);

	app.configure(courseScopelistService);
	app.configure(coursePermissionService);
	app.configure(courseMembersService);
};
