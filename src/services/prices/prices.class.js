const { PublicKey } = require('@solana/web3.js');
const { Market } = require('@project-serum/serum');
const { Service } = require('feathers-memory');

const logger = require('../../logger');
const sleep = require('../../utils/sleep');
const MARKETS = require('../../utils/MARKETS');

exports.Prices = class Prices extends Service {
  setup(app) {
    this.connection = app.get('connection');
  }

  async updateAll() {
    for (let i = 0; i < MARKETS.length; i += 1) {
      const baseMarket = MARKETS[i];
      const marketAddress = new PublicKey(baseMarket.baseMarketId);
      const programId = new PublicKey(baseMarket.programId);
      try {
        const market = await Market.load(this.connection, marketAddress, {}, programId);
        const bids = await market.loadBids(this.connection);
        const asks = await market.loadAsks(this.connection);

        const firstAsk = await asks.items(false).next();
        const firstBid = await bids.items(true).next();
        const midPrice = (firstBid.value.price + firstAsk.value.price) / 2;

        const price = {
          id: baseMarket.tokenMint,
          adrress: baseMarket.tokenMint,
          price: midPrice,
        };
        await this.create(price);
      } catch (error) {
        logger.error('[PRICES_updateAll]', `[${marketAddress.toString()}]`, error);
      }
      await sleep(500);
    }
  }
};
