const { disallow, setNow, discard } = require('feathers-hooks-common');

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [disallow('external'), setNow('updatedAt')],
    update: [disallow('external'), setNow('updatedAt')],
    patch: [disallow('external'), setNow('updatedAt')],
    remove: [disallow('external')],
  },

  after: {
    all: [discard('id')],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
};
