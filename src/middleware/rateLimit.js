const { TooManyRequests } = require('@feathersjs/errors');
const rateLimit = require('express-rate-limit');

module.exports = function (app) {
  const handler = function () {
    throw new TooManyRequests('Too many requests, please try again later.');
  };
  const limiter = rateLimit({
    windowMs: 10 * 1000, // 10 seconds
    max: 10, // limit each IP to 10 requests per windowMs
    handler,
  });
  app.use(limiter);
};
