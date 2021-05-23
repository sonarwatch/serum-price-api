const basicAuthMiddleware = require('express-basic-auth');

module.exports = function (app) {
  const basicAuth = app.get('basicAuth');
  if (basicAuth && basicAuth !== 'false' && basicAuth !== 'FALSE') {
    const username = app.get('basicAuthUser');
    const password = app.get('basicAuthPassword');
    const users = {};
    users[username] = password;
    app.use(basicAuthMiddleware({
      users,
    }));
  }
};
