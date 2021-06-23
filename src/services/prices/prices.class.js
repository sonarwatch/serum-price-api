const { PublicKey } = require('@solana/web3.js');
const { Market } = require('@project-serum/serum');
const { Service } = require('feathers-memory');

const logger = require('../../logger');
const sleep = require('../../utils/sleep');
const markets = require('../../utils/markets.json');
const stableCoins = require('../../utils/stableCoins.json');
const throwIfNull = require('../../utils/throwIfNull');

const USDC_DECIMALS = 6;

exports.Prices = class Prices extends Service {
  setup(app) {
    this.connections = app.get('connections');
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
          serumV3Usdc: stableCoin.serumV3Usdc,
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
      const connection = this.connections[i % this.connections.length];
      const baseMarketObj = markets[i];
      const marketAddress = new PublicKey(baseMarketObj.serumV3Usdc);
      const programId = new PublicKey(baseMarketObj.programId);
      try {
        const { owner, data } = throwIfNull(
          await connection.getAccountInfo(marketAddress),
          'Market not found',
        );
        if (!owner.equals(programId)) {
          throw new Error(`Address not owned by program: ${owner.toBase58()}`);
        }
        const decoded = Market.getLayout(programId).decode(data);
        if (
          !decoded.accountFlags.initialized
          || !decoded.accountFlags.market
          || !decoded.ownAddress.equals(marketAddress)
        ) {
          throw new Error('Invalid market');
        }
        const market = new Market(decoded, baseMarketObj.decimals, USDC_DECIMALS, {}, programId);
        const bids = await market.loadBids(connection);
        const asks = await market.loadAsks(connection);

        const firstAsk = await asks.items(false).next();
        const firstBid = await bids.items(true).next();
        if (!firstAsk.value || !firstBid.value) continue;

        const midPrice = (firstBid.value.price + firstAsk.value.price) / 2;
        const price = {
          id: baseMarketObj.tokenMint,
          mint: baseMarketObj.tokenMint,
          symbol: baseMarketObj.symbol,
          price: midPrice,
          serumV3Usdc: baseMarketObj.serumV3Usdc,
        };
        await this.create(price);
      } catch (error) {
        logger.error(`[PRICES_updateAll][${baseMarketObj.serumV3Usdc}]`, error);
      }
      await sleep(2000);
    }
  }
};
