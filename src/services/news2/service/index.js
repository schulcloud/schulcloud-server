const {
	NewsRestService,
	NewsRestServiceHooks,
} = require('./news.service');

module.exports = function setUpNewsServices(app, uc) {
	app.use('/news2', new NewsRestService(uc));
	app.service('news2').hooks(NewsRestServiceHooks);
};
