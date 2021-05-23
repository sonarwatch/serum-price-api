// Initializes the `prices` service on path `/prices`
const { Prices } = require('./prices.class');
const hooks = require('./prices.hooks');

module.exports = function (app) {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/prices', new Prices(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('prices');

  service.hooks(hooks);
};
