const rateLimit = require('express-rate-limit');

module.exports = function (app) {
  const limiter = rateLimit({
    windowMs: 10 * 1000, // 10 seconds
    max: 10, // limit each IP to 10 requests per windowMs
  });
  app.use(limiter);
};
