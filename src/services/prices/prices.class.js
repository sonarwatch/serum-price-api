const { PublicKey } = require('@solana/web3.js');
const { Market } = require('@project-serum/serum');
const { Service } = require('feathers-memory');

const logger = require('../../logger');
const sleep = require('../../utils/sleep');
const markets = require('../../utils/markets.json');
const stableCoins = require('../../utils/stableCoins.json');

exports.Prices = class Prices extends Service {
  setup(app) {
    this.connection = app.get('connection');
  }

  async addStableCoins() {
    try {
      for (let i = 0; i < stableCoins.length; i += 1) {
        const stableCoin = stableCoins[i];
        const price = {
          id: stableCoin.tokenMint,
          mint: stableCoin.tokenMint,
          symbol: stableCoin.symbol,
          price: stableCoin.price,
          market: stableCoin.marketId,
        };
        await this.create(price);
      }
    } catch (error) {
      logger.error('[addStableCoins]', error);
    }
  }

  async updateAll() {
    await this.addStableCoins();
    for (let i = 0; i < markets.length; i += 1) {
      const baseMarketObj = markets[i];
      const marketAddress = new PublicKey(baseMarketObj.marketId);
      const programId = new PublicKey(baseMarketObj.programId);
      try {
        const market = await Market.load(this.connection, marketAddress, {}, programId);
        const bids = await market.loadBids(this.connection);
        const asks = await market.loadAsks(this.connection);

        const firstAsk = await asks.items(false).next();
        const firstBid = await bids.items(true).next();
        const midPrice = (firstBid.value.price + firstAsk.value.price) / 2;

        const price = {
          id: baseMarketObj.tokenMint,
          mint: baseMarketObj.tokenMint,
          symbol: baseMarketObj.symbol,
          price: midPrice,
          market: baseMarketObj.marketId,
        };
        await this.create(price);
      } catch (error) {
        logger.error('[PRICES_updateAll]', `[${marketAddress.toString()}]`, error);
      }
      await sleep(500);
    }
  }
};
