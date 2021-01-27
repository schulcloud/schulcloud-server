const { static: staticContent } = require('@feathersjs/express');
const path = require('path');

const PseudonymModel = require('./model');
const { pseudonymRepo } = require('../../components/pseudonym/repo');
const hooks = require('./hooks');

class PseudonymService {
	async find(params) {
		const { userId, toolId } = params.query;
		const userIds = Array.isArray(userId) ? userId : [userId];
		const toolIds = Array.isArray(toolId) ? toolId : [toolId];
		const result = [];
		for (const user of userIds) {
			for (const tool of toolIds) {
				// eslint-disable-next-line no-await-in-loop
				result.push({ pseudonym: await pseudonymRepo.createPseudonym(user, tool), userId: user, toolId: tool });
			}
		}
		return { data: result };
	}

	async create(data, params) {
		if (!Array.isArray(data)) data = [data];
		return data.map(async ({ userId, toolId }) => {
			const pseudonym = await pseudonymRepo.createPseudonym(userId, toolId);
			return pseudonym;
		});
	}

	async get(id, params) {}

	async update(id, data, parmas) {}

	async patch(id, data, params) {}

	async remove(id, params) {
		return pseudonymRepo.deletePseudonymById(id);
	}
}

module.exports = function () {
	const app = this;
	app.use('/pseudonym/api', staticContent(path.join(__dirname, '/docs/openapi.yaml')));
	app.use('/pseudonym', new PseudonymService());

	const pseudonymService = app.service('/pseudonym');
	pseudonymService.hooks(hooks);
};
