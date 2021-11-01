import { int32ToUint8Array, uint8ArrayToInt32 } from "./converters";
import { writeDataAsLastBitsToBuffer } from "./write";
import { getDataChunk } from "./accessors";
import { chunksByLength, sum } from "utils/math";
import { task } from "../utils/tasks";
import {
  bytesInPixel,
  dataBytesInPixel,
  validAlfaChannelValue,
} from "./constants";
import { major, minor, patch, neq, valid } from "semver";

// Picture-conversation protocol identifier
const identifier = "PC-PI";
const encodedIdentifier = new TextEncoder().encode(identifier);
const capacityInBytesLength = 4;

const currentProtocolVersion = "0.0.1";
const versionInBytes = new Uint8Array([
  major(currentProtocolVersion),
  minor(currentProtocolVersion),
  patch(currentProtocolVersion),
]);

export const writeData = (buffer: Uint8ClampedArray, data: Uint8Array) => {
  const dataLengthInBytes = int32ToUint8Array(data.length);

  const allData = new Uint8Array(
    versionInBytes.byteLength +
      encodedIdentifier.byteLength +
      dataLengthInBytes.byteLength +
      data.byteLength,
  );

  allData.set(encodedIdentifier);
  allData.set(versionInBytes, encodedIdentifier.byteLength);
  allData.set(
    dataLengthInBytes,
    encodedIdentifier.byteLength + versionInBytes.byteLength,
  );
  allData.set(
    data,
    encodedIdentifier.byteLength +
      versionInBytes.byteLength +
      dataLengthInBytes.byteLength,
  );

  writeDataAsLastBitsToBuffer(buffer, allData);
};

export const readData = (
  buffer: Uint8ClampedArray,
):
  | {
      version: string;
      data: string;
    }
  | {
      isNotPCP: true;
    } => {
  const chunk = getDataChunk(buffer);
  const textDecoder = new TextDecoder();

  chunk.next();
  const nextIdBytes = chunk.next(encodedIdentifier.byteLength);
  if (
    nextIdBytes.done ||
    new TextDecoder().decode(nextIdBytes.value) !== identifier
  ) {
    return { isNotPCP: true };
  }

  const versionBytes = chunk.next(versionInBytes.byteLength);

  if (versionBytes.done) {
    return { isNotPCP: true };
  }
  const version = versionBytes.value.join(".");

  // Not supported only current version
  if (!valid(version) || neq(version, currentProtocolVersion)) {
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

  return { version, data: textDecoder.decode(data.value) };
};

export const getMaxDataBytesCount = async (buffer: Uint8ClampedArray) => {
  // Optimal length for non blocking operation
  const chunkLength = 1000000;

  const chunksMaxBits = await Promise.all(
    chunksByLength(buffer, chunkLength).map((chunk) =>
      task(() => {
        return (
          chunk.filter((e, index) => {
            return (
              (index + 1) % bytesInPixel === 0 && e === validAlfaChannelValue
            );
          }).byteLength * dataBytesInPixel
        );
      }),
    ),
  );

  return (
    ((sum(chunksMaxBits) / 8) | 0) -
    capacityInBytesLength -
    encodedIdentifier.length
  );
};
