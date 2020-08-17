const disallow = require('../../common/disallow.hook');

// For inter-component calls
class NewsBcFacade {
	constructor(uc) {
		this.uc = uc;
	}

	setup(app) {
		// asdas
	}
}

module.exports = function setupNewsFacade(app, uc) {
	app.use('/newsBcFacade', new NewsBcFacade(uc));
	app.service('newsBcFacade').hooks(disallow);
};
