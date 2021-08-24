const { PublicKey } = require('@solana/web3.js');
const { Service } = require('feathers-memory');

const logger = require('../../logger');
const sleep = require('../../utils/sleep');
const markets = require('../../utils/markets.json');
const stableCoins = require('../../utils/stableCoins.json');
const indexedCoins = require('../../utils/indexedCoins.json');
const fetchRaydiumAMM = require('./fetchRaydiumAMM');
const fetchSerumDEX = require('./fetchSerumDEX');

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

  async addIndexedCoin(price) {
    const indexes = indexedCoins[price.mint];
    if (indexes) {
      for (let i = 0; i < indexes.length; i += 1) {
        const index = indexes[i];
        const indexedPrice = {
          id: index.tokenMint,
          mint: index.tokenMint,
          symbol: index.symbol,
          price: price.price * index.ratio,
          serumV3Usdc: price.serumV3Usdc,
        };
        await this.create(indexedPrice);
      }
    }
  }

  async updateAll() {
    await this.addStableCoins();
    for (let i = 0; i < markets.length; i += 1) {
      const connection = this.connections[i % this.connections.length];
      const baseMarketObj = markets[i];
      let tokenPrice = 0;

      try {
        if (baseMarketObj.raydiumV4AMM) {
          tokenPrice = await fetchRaydiumAMM(connection, new PublicKey(baseMarketObj.raydiumV4AMM));
        } else {
          tokenPrice = await fetchSerumDEX(
            connection,
            new PublicKey(baseMarketObj.serumV3Usdc),
            new PublicKey(baseMarketObj.programId),
            baseMarketObj.decimals,
          );
        }
      } catch (error) {
        logger.error(error);
        continue;
      }

      const price = {
        id: baseMarketObj.tokenMint,
        mint: baseMarketObj.tokenMint,
        symbol: baseMarketObj.symbol,
        price: tokenPrice,
        serumV3Usdc: baseMarketObj.serumV3Usdc,
      };

      await this.create(price);
      await this.addIndexedCoin(price);
      await sleep(2000);
    }
  }
};
