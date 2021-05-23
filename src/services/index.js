const prices = require('./prices/prices.service.js');
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(prices);
};
