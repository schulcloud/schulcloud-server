/* eslint-disable max-classes-per-file */
const { static: staticContent } = require('@feathersjs/express');
const path = require('path');

const hooks = require('./hooks');
const merlinHooks = require('./hooks/merlin.hooks');
const antaresHooks = require('./hooks/antares.hooks');
const EduSharingConnector = require('./logic/connector');
const MerlinTokenGenerator = require('./logic/MerlinTokenGenerator');
const AntaresTokenGenerator = require('./logic/AntaresTokenGenerator');

class EduSearch {
	find(data) {
		return EduSharingConnector.FIND(data);
	}

	get(id, params) {
		return EduSharingConnector.GET(id, params);
	}
}

class MerlinToken {
	find(data) {
		return MerlinTokenGenerator.FIND(data);
	}
}

class AntaresToken {
	find(data) {
		return AntaresTokenGenerator.FIND(data);
	}
}

module.exports = (app) => {
	const merlinRoute = 'edu-sharing/merlinToken';
	app.use(merlinRoute, new MerlinToken(), (req, res) => {
		res.send(res.data);
	});
	const merlinService = app.service(merlinRoute);
	merlinService.hooks(merlinHooks);

	const antaresRoute = 'edu-sharing/antaresToken';
	app.use(antaresRoute, new AntaresToken(), (req, res) => {
		res.send(res.data);
	});
	const antaresService = app.service(antaresRoute);
	antaresService.hooks(antaresHooks);

	const eduRoute = '/edu-sharing';
	app.use(`${eduRoute}/api`, staticContent(path.join(__dirname, '/docs/openapi.yaml')));
	app.use(eduRoute, new EduSearch(), (req, res) => {
		res.send(res.data);
	});
	const eduService = app.service(eduRoute);
	eduService.hooks(hooks);
};
