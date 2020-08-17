/* eslint-disable max-len */
const { newsPermissions } = require('../repo/db/news.schema');

class NewsUc {
	constructor(app) {
		this.newsRepo = app.service('newsRepo');
		// 1 Could be also achieved with mixins!
		/*
			to discuss in editor we have embedded permissions
			fist we implemented a wrapper permission services that can put to every services and setup him self around it
		 	put permission hooks, deselections of permission keys
		 	and full supported permission editing around the services.

			It work well but after some reviews we come to the solution that we can put the request scope
			as method to service class.
			The second we discard the permissionHelper service and create a curry like util stack for permissions.
			Then we can request the data and by the outgoing way we can check the permission with this util.
			If permission is ok (nearly all request) it remove embedded permission key and post the data outside.
			-> One request, One DB request, One Outgoing response
			-> easy generic permission handling
			-> one scope handling for every business operationen

			But btw we should discuss if we set the scope in before hook, in service, in uc, or in repo.
			All points has valid arguments.

			https://github.com/hpi-schul-cloud/schulcloud-editor/blob/develop/src/services/sections/section.service.js#L68
			Line 88
			Line 101
		*/
		this.scopeUc = app.service('scopeUc');
	}

	/**
	 * Decorates a result or result set with handy short-hands for the API-consumer
	 * @static
	 * @param {News|Array<News>|Object} result a news item or collection of news items
	 * @returns {News|Array<News>|Object} decorated result(s)
	 * @memberof NewsService
	 */
	static decorateResults(result) {
		const decorate = (n) => ({
			...n,
			school: n.schoolId,
			schoolId: (n.schoolId || {})._id,
			creator: n.creatorId,
			creatorId: (n.creatorId || {})._id,
			updater: n.updaterId,
			updaterId: (n.updaterId || {})._id,
		});
		if (result instanceof Array) {
			return result.map(decorate);
		}
		if (result.data) { // paginated result set
			const dataIdsFixed = result.data.map(decorate);
			return { ...result, data: dataIdsFixed };
		}
		return decorate(result);
	}

	/**
	 * Decorates a result set with the user's permissions for each news item in the set
	 * @param {Object} result result set
	 * @param {ObjectId} userId the user's id
	 * @returns {Object} decorated result set
	 * @memberof NewsService
	 */
	async decoratePermissions(result, userId) {
		const decorate = async (n) => ({
			...n,
			permissions: await this.scopeUc.getPermissions(userId, {
				target: (n.target || {})._id,
				targetModel: n.targetModel,
				schoolId: n.schoolId,
			}),
		});

		if (result instanceof Array) {
			return Promise.all(result.map(decorate));
		}
		if (result.data) { // paginated result set
			const decoratedData = await Promise.all(result.data.map(decorate));
			return { ...result, data: decoratedData };
		}
		return decorate(result);
	}

	async createNews(news, account) {
		// authorize
		await this.scopeUc.authorize(news, account.userId, newsPermissions.CREATE);
		// uniquness check?
		const newNewsData = {
			...news,
			creatorId: account.userId,
			updaterId: null,
		};
		return this.newsRepo.createNews(newNewsData);
	}

	async readNews(id, account) {
		const news = await this.newsRepo.readNews(id);

		const now = Date.now();
		if (news.displayAt > now) {
			await this.scopeUc.authorize(news, account.userId, newsPermissions.EDIT);
		} else {
			await this.scopeUc.authorize(news, account.userId, newsPermissions.VIEW);
		}

		news.permissions = await this.scopeUc.getPermissions(account.userId, news);
		return NewsUc.decorateResults(news);
	}

	async findNews(searchParams, account) {
		const permission = searchParams.unpublished ? newsPermissions.EDIT : newsPermissions.VIEW;
		const scopeParams = await this.scopeUc.buildScopeParams(searchParams, account, permission);

		return this.newsRepo.searchForNews(searchParams, scopeParams)
			.then(NewsUc.decorateResults)
			.then((result) => this.decoratePermissions(result, account.userId));
	}
}

let isExpose = false;

module.exports = (app) => {
	// can also implemented as (helper) class
	if (isExpose) {
		throw new Error('Can not expose twice.');
	}
	isExpose = true;

	return new NewsUc(app);
};
