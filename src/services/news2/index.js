const setupNewsRepo = require('./repo');
const setupNewsUc = require('./uc/news.uc');
const setupNewsService = require('./service');
const setupNewsFacade = require('./news.facade');

module.exports = (app) => {
	setupNewsRepo(app);
	const uc = setupNewsUc.configure(app);
	setupNewsFacade(app, uc);
	setupNewsService(app, uc);
};
