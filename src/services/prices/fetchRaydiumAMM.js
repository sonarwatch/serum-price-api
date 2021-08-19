const { OpenOrders } = require('@project-serum/serum');
const BigNumber = require('bignumber.js');
const { AMM_INFO_LAYOUT_V4, ACCOUNT_LAYOUT } = require('../../utils/raydium/layouts');
const sleep = require('../../utils/sleep');

module.exports = async function fetchRaydiumAMM(connection, ammId) {
  const ammInfoRes = await connection.getAccountInfo(ammId);
  await sleep();
  const ammInfo = AMM_INFO_LAYOUT_V4.decode(ammInfoRes.data);
  const { serumProgramId } = ammInfo;
  const publicKeys = [
    ammInfo.poolCoinTokenAccount,
    ammInfo.poolPcTokenAccount,
    ammInfo.ammOpenOrders,
  ];
  const [
    poolCoinTokenAccountRes,
    poolPcTokenAccountRes,
    ammOpenOrdersRes,
  ] = await connection.getMultipleAccountsInfo(publicKeys);
  const poolCoinTokenAccount = ACCOUNT_LAYOUT.decode(poolCoinTokenAccountRes.data);
  const poolPcTokenAccount = ACCOUNT_LAYOUT.decode(poolPcTokenAccountRes.data);
  const coinAmountWei = new BigNumber(poolCoinTokenAccount.amount.toString());
  const pcAmountWei = new BigNumber(poolPcTokenAccount.amount.toString());

  const ammOpenOrders = OpenOrders.getLayout(serumProgramId).decode(ammOpenOrdersRes.data);
  const { baseTokenTotal, quoteTokenTotal } = ammOpenOrders;
  coinAmountWei.plus(new BigNumber(baseTokenTotal.toString()));
  pcAmountWei.plus(new BigNumber(quoteTokenTotal.toString()));

  const {
    needTakePnlCoin, needTakePnlPc, coinDecimals, pcDecimals,
  } = ammInfo;
  coinAmountWei.minus(new BigNumber(needTakePnlCoin.toString()));
  pcAmountWei.minus(new BigNumber(needTakePnlPc.toString()));

  const coinAmount = coinAmountWei.dividedBy(new BigNumber(10 ** coinDecimals.toString())).toNumber();
  const pcAmount = pcAmountWei.dividedBy(new BigNumber(10 ** pcDecimals.toString())).toNumber();

  const coinPrice = pcAmount / coinAmount;
  return coinPrice;
};
