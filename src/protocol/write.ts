import { getByteWithDataBit } from "./accessors";

const bitsInByte = 8;

/**
 * Writes data into the buffer as last bit in each byte
 * @param {Uint8ClampedArray} buffer - target buffer
 * @param {Uint8Array} data - data to write
 */
export const writeDataAsLastBitsToBuffer = (
  buffer: Uint8ClampedArray,
  data: Uint8Array,
) => {
  const byteWithDataBit = getByteWithDataBit(buffer);

  for (const dataByte of data) {
    for (let i = 0; i < bitsInByte; i++) {
      const next = byteWithDataBit.next();
      if (next.done) {
        return;
      }

      const [byte, index] = next.value;

      buffer[index] =
        ((byte >> 1) << 1) |
        (((2 ** (bitsInByte - 1 - i)) & dataByte) >>> (bitsInByte - 1 - i));
    }
  }
};
