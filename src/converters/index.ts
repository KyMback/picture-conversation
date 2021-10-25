export const int32ToUint8Array = (value: number) => {
  const r = [];
  for (let i = 0; i < 4; i++) {
    r.push((value << (8 * i)) >> (8 * 3));
  }

  return Uint8Array.from(r);
};

export const uint8ArrayToInt32 = (buf: Uint8Array) => {
  if (buf.length !== 4) {
    throw new Error("Int32 should contain 4 bytes");
  }

  let value = 0;
  for (let i = 0; i < 4; i++) {
    value = (value << 8) | buf[i];
  }

  return value;
};
