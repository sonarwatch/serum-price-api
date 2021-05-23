/* eslint-disable no-console */
/* eslint-disable no-constant-condition */
const sleep = require('./sleep');

module.exports = async function infiniteLoop(app) {
  const pricesService = app.service('/prices');
  while (true) {
    console.time('PricesUpdated');
    await pricesService.updateAll();
    console.timeEnd('PricesUpdated');
    await sleep();
  }
};
