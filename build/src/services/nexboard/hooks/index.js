const { authenticate } = require('@feathersjs/authentication').hooks;
const { disallow } = require('feathers-hooks-common');
const { hasPermission } = require('../../../hooks');
const before = {
    all: [authenticate('jwt')],
    find: [hasPermission('TOOL_VIEW')],
    get: [hasPermission('TOOL_VIEW')],
    create: [hasPermission('TOOL_CREATE')],
    update: [disallow()],
    patch: [disallow()],
    remove: [disallow()],
};
const after = {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
};
module.exports = {
    before,
    after,
};
//# sourceMappingURL=index.js.map