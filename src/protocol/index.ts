import { int32ToUint8Array, uint8ArrayToInt32 } from "./converters";
import { writeDataAsLastBitsToBuffer } from "./write";
import { readDataAsLastBitsOfBytes } from "./read";

// Picture-conversation protocol identifier
const identifier = "PC-PI";
const encodedIdentifier = new TextEncoder().encode(identifier);
const capacityInBytesLength = 4;

export const writeData = (buffer: Uint8Array, data: Uint8Array) => {
  const dataLengthInBytes = int32ToUint8Array(data.length);

  writeDataAsLastBitsToBuffer(buffer, 0, encodedIdentifier);
  writeDataAsLastBitsToBuffer(
    buffer,
    encodedIdentifier.length,
    dataLengthInBytes,
  );
  writeDataAsLastBitsToBuffer(
    buffer,
    encodedIdentifier.length + dataLengthInBytes.length,
    data,
  );
};

export const readData = (buffer: Uint8Array) => {
  if (isPCPBuffer(buffer)) {
    throw new Error("Invalid protocol structure");
  }

  const textDecoder = new TextDecoder();

  const encodedLength = readDataAsLastBitsOfBytes(
    buffer,
    encodedIdentifier.length,
    capacityInBytesLength,
  );
  const length = uint8ArrayToInt32(encodedLength);
  const data = readDataAsLastBitsOfBytes(
    buffer,
    encodedIdentifier.length + encodedLength.length,
    length,
  );

  return { data: textDecoder.decode(data) };
};

export const getMaxDataBytesCount = (buffer: Uint8Array) => {
  return (
    ((buffer.byteLength / 8) | 0) -
    capacityInBytesLength -
    encodedIdentifier.length
  );
};

export const isPCPBuffer = (buffer: Uint8Array) => {
  const id = readDataAsLastBitsOfBytes(buffer, 0, encodedIdentifier.length);
  return new TextDecoder().decode(id) !== identifier;
};
