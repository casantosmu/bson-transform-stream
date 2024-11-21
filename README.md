# BSON Transform Stream

A Node.js Transform stream for processing BSON data. This stream parses incoming binary BSON data and outputs JavaScript objects.

## Installation

Install the package using npm:

```bash
npm install bson-transform-stream
```

## Usage

```javascript
import fs from "node:fs";
import BSONTransformStream from "bson-transform-stream";

const readStream = fs.createReadStream("data.bson");
const bsonStream = new BSONTransformStream();

readStream.pipe(bsonStream).on("data", (obj) => {
  console.log(obj);
});
```

## API

### `BSONTransformStream`

Extends Node.js `Transform` stream to process BSON data.

#### Constructor

```javascript
new BSONTransformStream();
```

Creates a new instance of `BSONTransformStream`.

#### Events

- **`'data'`**: Emitted for each parsed BSON document as a JavaScript object.

## License

MIT License

## Author

Carlos Santos (<casantosmu@gmail.com>)