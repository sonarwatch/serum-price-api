const { Market } = require('@project-serum/serum');
const logger = require('../../logger');
const throwIfNull = require('../../utils/throwIfNull');

const USDC_DECIMALS = 6;

module.exports = async function fetchSerumDEX(connection, serumV3Market, programId, decimals) {
  try {
    const { owner, data } = throwIfNull(
      await connection.getAccountInfo(serumV3Market),
      'Market not found',
    );
    if (!owner.equals(programId)) { throw new Error(`Address not owned by program: ${owner.toBase58()}`); }
    const decoded = Market.getLayout(programId).decode(data);
    if (
      !decoded.accountFlags.initialized
      || !decoded.accountFlags.market
      || !decoded.ownAddress.equals(serumV3Market)
    ) {
      throw new Error('Invalid market');
    }

    const market = new Market(decoded, decimals, USDC_DECIMALS, {}, programId);
    const bids = await market.loadBids(connection);
    const asks = await market.loadAsks(connection);
    const firstAsk = await asks.items(false).next();
    const firstBid = await bids.items(true).next();
    if (!firstBid.value || !firstAsk.value) return 0;
    const midPrice = (firstBid.value.price + firstAsk.value.price) / 2;
    return midPrice;
  } catch (error) {
    logger.error(error);
  }
  return null;
};
