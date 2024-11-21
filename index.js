const { Transform } = require("node:stream");
const { BSON } = require("bson");

class BSONTransformStream extends Transform {
  constructor() {
    super({
      readableObjectMode: true,
      writableObjectMode: false,
    });
    this.remaining = Buffer.alloc(0);
  }

  _transform(chunk, encoding, callback) {
    try {
      const buffer = Buffer.concat([this.remaining, chunk]);

      let offset = 0;
      while (true) {
        if (buffer.length - offset < 4) {
          break; // Not enough data for the size header
        }

        const docSize = buffer.readInt32LE(offset);
        if (buffer.length - offset < docSize) {
          break; // Not enough data for the full document
        }

        const docBuf = buffer.subarray(offset, offset + docSize);
        const obj = BSON.deserialize(docBuf);

        this.push(obj);
        offset += docSize;
      }

      this.remaining = buffer.subarray(offset);
      callback();
    } catch (err) {
      callback(err);
    }
  }

  _flush(callback) {
    if (this.remaining.length > 0) {
      callback(new Error("Incomplete BSON document received."));
    } else {
      callback();
    }
  }
}

module.exports = BSONTransformStream;
