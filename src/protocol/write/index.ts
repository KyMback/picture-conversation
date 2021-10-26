const bitsInByte = 8;

/**
 * Writes data into the buffer as last bit in each byte
 * @param {Uint8Array} buffer - target buffer
 * @param {number} afterNDataBytes - number of skipped data bytes in buffer
 * @param {Uint8Array} data - data to write
 */
export const writeDataAsLastBitsToBuffer = (
  buffer: Uint8Array,
  afterNDataBytes: number,
  data: Uint8Array,
) => {
  if (data.length * bitsInByte > buffer.length - ((afterNDataBytes / 8) | 0)) {
    throw new Error(
      `Not enough space in buffer, required space: ${data.length * bitsInByte}`,
    );
  }

  for (let i = 0; i < data.length; i++) {
    const byte = data[i];

    for (let j = 0; j < bitsInByte; j++) {
      const curValue = buffer[(afterNDataBytes + i) * bitsInByte + j];
      buffer[(afterNDataBytes + i) * bitsInByte + j] =
        ((curValue >> 1) << 1) |
        (((2 ** (bitsInByte - 1 - j)) & byte) >>> (bitsInByte - 1 - j));
    }
  }
};
