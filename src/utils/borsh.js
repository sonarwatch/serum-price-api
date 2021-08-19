/* eslint-disable max-classes-per-file */
const { blob, Layout } = require('buffer-layout');
const { PublicKey } = require('@solana/web3.js');
const BN = require('bn.js');

class BNLayout extends Layout {
  constructor(span, signed, property) {
    super(span, property);
    this.blob = blob(span);
    this.signed = signed;
  }

  decode(b, offset = 0) {
    const num = new BN(this.blob.decode(b, offset), 10, 'le');
    if (this.signed) {
      return num.fromTwos(this.span * 8).clone();
    }
    return num;
  }

  encode(src, b, offset = 0) {
    if (this.signed) {
      // eslint-disable-next-line no-param-reassign
      src = src.toTwos(this.span * 8);
    }
    return this.blob.encode(
      src.toArrayLike(Buffer, 'le', this.span),
      b,
      offset,
    );
  }
}

module.exports.u64 = function (property) {
  return new BNLayout(8, false, property);
};

module.exports.i64 = function (property) {
  return new BNLayout(8, true, property);
};

module.exports.u128 = function (property) {
  return new BNLayout(16, false, property);
};

module.exports.u256 = function (property) {
  return new BNLayout(32, false, property);
};

module.exports.i128 = function (property) {
  return new BNLayout(16, true, property);
};

class WrappedLayout extends Layout {
  constructor(
    layout,
    decoder,
    encoder,
    property,
  ) {
    super(layout.span, property);
    this.layout = layout;
    this.decoder = decoder;
    this.encoder = encoder;
  }

  decode(b, offset) {
    return this.decoder(this.layout.decode(b, offset));
  }

  encode(src, b, offset) {
    return this.layout.encode(this.encoder(src), b, offset);
  }

  getSpan(b, offset) {
    return this.layout.getSpan(b, offset);
  }
}

module.exports.publicKey = function (property) {
  return new WrappedLayout(
    blob(32),
    (b) => new PublicKey(b),
    (key) => key.toBuffer(),
    property,
  );
};
