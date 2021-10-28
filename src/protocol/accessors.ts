import {
  alfaChannelIndex,
  bitsInByte,
  bytesInPixel,
  dataBytesInPixel,
  validAlfaChannelValue,
} from "./constants";

export function* getDataChunk(
  buffer: Uint8ClampedArray,
): Generator<Uint8Array, void, number | undefined> {
  const dataByte = getDataByte(buffer);

  let requiredLength = yield new Uint8Array([]);
  const result: Array<number> = [];

  while (true) {
    if (result.length === requiredLength) {
      const nextLength = yield new Uint8Array(result);

      if (nextLength) {
        requiredLength = nextLength;
        result.length = 0;
      } else {
        break;
      }
    }

    const next = dataByte.next();
    if (next.done) {
      throw new Error("Invalid length");
    }

    result.push(next.value);
  }
}

function* getDataByte(buffer: Uint8ClampedArray) {
  let retrievedBits = 0;
  let value = 0;

  for (const [byte] of getByteWithDataBit(buffer)) {
    value |=
      (byte << (bitsInByte - 1 - retrievedBits)) &
      (2 ** (bitsInByte - 1 - retrievedBits));

    if (++retrievedBits == bitsInByte) {
      yield value;
      value = 0;
      retrievedBits = 0;
    }
  }
}

export function* getByteWithDataBit(buffer: Uint8ClampedArray) {
  for (let i = 0; i < buffer.byteLength; i += bytesInPixel) {
    if (buffer[i + alfaChannelIndex] !== validAlfaChannelValue) {
      continue;
    }

    for (let j = 0; j < dataBytesInPixel; j++) {
      yield [buffer[i + j], i + j] as [byte: number, index: number];
    }
  }
}
