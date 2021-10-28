import { int32ToUint8Array, uint8ArrayToInt32 } from "./converters";
import { writeDataAsLastBitsToBuffer } from "./write";
import { getByteWithDataBit, getDataChunk } from "./accessors";
import { getIteratorLength } from "utils/iterators";

// Picture-conversation protocol identifier
const identifier = "PC-PI";
const encodedIdentifier = new TextEncoder().encode(identifier);
const capacityInBytesLength = 4;

export const writeData = (buffer: Uint8ClampedArray, data: Uint8Array) => {
  const dataLengthInBytes = int32ToUint8Array(data.length);

  const allData = new Uint8Array(
    encodedIdentifier.byteLength +
      dataLengthInBytes.byteLength +
      data.byteLength,
  );

  allData.set(encodedIdentifier);
  allData.set(dataLengthInBytes, encodedIdentifier.byteLength);
  allData.set(
    data,
    encodedIdentifier.byteLength + dataLengthInBytes.byteLength,
  );

  writeDataAsLastBitsToBuffer(buffer, allData);
};

export const readData = (
  buffer: Uint8ClampedArray,
):
  | {
      data: string;
    }
  | { isNotPCP: true } => {
  const chunk = getDataChunk(buffer);
  const textDecoder = new TextDecoder();

  chunk.next();
  const nextIdBytes = chunk.next(encodedIdentifier.length);
  if (
    nextIdBytes.done ||
    new TextDecoder().decode(nextIdBytes.value) !== identifier
  ) {
    return { isNotPCP: true };
  }

  const lengthBytes = chunk.next(capacityInBytesLength);
  if (lengthBytes.done) {
    return { isNotPCP: true };
  }

  const data = chunk.next(uint8ArrayToInt32(lengthBytes.value));
  if (data.done) {
    return { isNotPCP: true };
  }

  return { data: textDecoder.decode(data.value) };
};

export const getMaxDataBytesCount = (buffer: Uint8ClampedArray) => {
  const maxBits = getIteratorLength(getByteWithDataBit(buffer));
  return ((maxBits / 8) | 0) - capacityInBytesLength - encodedIdentifier.length;
};
