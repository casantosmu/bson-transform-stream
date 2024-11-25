const path = require("node:path");
const fs = require("node:fs");
const os = require("node:os");
const crypto = require("node:crypto");
const { Writable } = require("node:stream");
const { pipeline } = require("node:stream/promises");
const test = require("node:test");
const assert = require("node:assert");
const { ObjectId, BSON } = require("bson");

const BSONTransformStream = require("../index");

const WriteStreamBSON = () => {
  const filePath = path.join(os.tmpdir(), `docs-${Date.now()}.bson`);
  const stream = fs.createWriteStream(filePath);

  return {
    filePath,
    async write(obj) {
      await new Promise((resolve, reject) => {
        const bson = BSON.serialize(obj);

        stream.write(bson, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    },
    async end() {
      await new Promise((resolve) => {
        stream.end(resolve);
      });
    },
  };
};

const randomDocs = () => {
  const randomStr = (length) => {
    return crypto.randomBytes(length).toString("hex");
  };

  const docs = [];
  for (let i = 0; i < 100000; i++) {
    const doc = {
      _id: new ObjectId(),
      name: randomStr(10),
      value: Math.random(),
      createdAt: new Date(),
      data: crypto.randomBytes(50),
      nested: {
        field1: randomStr(5),
        field2: Math.floor(Math.random() * 1000),
        field3: [1, 2, 3, 4, 5],
      },
    };

    docs.push(doc);
  }

  return docs;
};

test("Processes BSON correctly", async () => {
  const bsonStream = WriteStreamBSON();

  const docs = randomDocs();
  for (const doc of docs) {
    await bsonStream.write(doc);
  }

  await bsonStream.end();

  const result = [];
  await pipeline(
    fs.createReadStream(bsonStream.filePath),
    new BSONTransformStream({ promoteBuffers: true }),
    new Writable({
      objectMode: true,
      write(obj, encoding, callback) {
        result.push(obj);
        callback();
      },
    })
  );

  assert.deepStrictEqual(result, docs);
});
