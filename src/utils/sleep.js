module.exports = async function (timeToSleep = 100) {
  await new Promise((resolve) => setTimeout(resolve, timeToSleep));
};
