// Initializes the `prices` service on path `/prices`
const { Prices } = require('./prices.class');
const hooks = require('./prices.hooks');

module.exports = function (app) {
  const options = {
    paginate: false,
  };

  app.use('/prices', new Prices(options, app));
  const service = app.service('prices');
  service.hooks(hooks);
};
