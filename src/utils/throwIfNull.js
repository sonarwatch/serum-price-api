module.exports = function throwIfNull(value, message = 'account not found') {
  if (value === null) {
    throw new Error(message);
  }
  return value;
};
