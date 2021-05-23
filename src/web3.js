const { Connection } = require('@solana/web3.js');

module.exports = function (app) {
  const rpcEndpoint = app.get('rpcEndpoint');
  const connection = new Connection(rpcEndpoint, 'confirmed');
  app.set('connection', connection);
};
