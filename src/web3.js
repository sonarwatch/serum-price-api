const { Connection } = require('@solana/web3.js');

module.exports = function (app) {
  const rpcEndpoints = ['https://api.mainnet-beta.solana.com', 'https://solana-api.projectserum.com'];
  const connections = [];
  rpcEndpoints.forEach((rpcEndpoint) => {
    connections.push(new Connection(rpcEndpoint, 'confirmed'));
  });
  app.set('connections', connections);
};
