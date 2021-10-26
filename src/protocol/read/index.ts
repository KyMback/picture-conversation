const bitsInByte = 8;

export const readDataAsLastBitsOfBytes = (
  bytes: Uint8Array,
  afterNDataBytes: number,
  length: number,
) => {
  if (bytes.length - afterNDataBytes * bitsInByte < length * bitsInByte) {
    throw new Error("Incorrect number of bytes");
  }

  const r = [];

  for (let i = 0; i < length; i++) {
    r.push(readByte(bytes, (afterNDataBytes + i) * bitsInByte));
  }

  return new Uint8Array(r);
};

const readByte = (buffer: Uint8Array, from: number) => {
  let value = 0;
  for (let i = 0; i < bitsInByte; i++) {
    value |=
      (buffer[from + i] << (bitsInByte - 1 - i)) & (2 ** (bitsInByte - 1 - i));
  }

  return value;
};
