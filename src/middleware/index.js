const basicAuth = require('./basicAuth');
const rateLimit = require('./rateLimit');

module.exports = function (app) {
  // basic auth
  basicAuth(app);
  // rate limit
  rateLimit(app);

  // root api status
  app.get('/', (req, res) => {
    res.json({
      status: 'OK',
    });
  });

  // robots.txt
  app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.send('User-agent: *\nDisallow: /');
  });
};
