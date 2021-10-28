export const chunksByLength = (
  buffer: Uint8ClampedArray,
  chunkLength: number,
) => {
  const count = Math.ceil(buffer.byteLength / chunkLength);

  return [...new Array(count)].map((_, i) => {
    return buffer.subarray(
      i * chunkLength,
      i === count - 1 ? undefined : chunkLength * (i + 1),
    );
  });
};

export const sum = (list: Array<number>) => {
  return list.reduce((s, c) => s + c, 0);
};
