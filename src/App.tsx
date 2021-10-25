import fileDownload from "js-file-download";
import { PNG } from "pngjs/browser";
import { useState } from "react";
import { readDataAsLastBitsOfBytes } from "./read";
import { writeDataAsLastBitsToBuffer } from "./write";
import { int32ToUint8Array, uint8ArrayToInt32 } from "./converters";

export const App = () => {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | undefined>();
  const [filePath, setFilePath] = useState();

  return (
    <div>
      <div>
        <input
          type="file"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) {
              return;
            }

            const fr = new FileReader();
            fr.onload = (ev) => {
              setFilePath(ev.target.result);
            };
            fr.readAsDataURL(file);

            setFile(file);
          }}
        />
        <img src={filePath} alt={"Image"} />
      </div>
      <div>
        <input
          type="text"
          onChange={(e) => setText(e.target.value)}
          value={text}
        />
        <button onClick={() => encode(text, file)}>Encode</button>
        <button onClick={() => decode(file)}>Decode</button>
      </div>
    </div>
  );
};

// Picture-conversation protocol identifier
const identifier = "PC-PI";
const encodedIdentifier = new TextEncoder().encode(identifier);
const bitsInByte = 8;
const capacityInBytesLength = 4;

const decode = async (file?: File) => {
  if (!file) {
    return;
  }

  const buf = await file.arrayBuffer();
  const png = PNG.sync.read(new Buffer(buf));

  const data = readData(png.data);
  console.log(`decode: ${data.length}`);
  console.log(`decode data: ${data.data}`);
};

const encode = async (text: string, file?: File) => {
  if (!file) {
    return;
  }

  const encoder = new TextEncoder();
  const encodedText = encoder.encode(text);
  const buf = await file.arrayBuffer();
  const png = PNG.sync.read(new Buffer(buf));
  console.log(png);

  const maxPossibleBits = png.height * png.width * 3;

  if (encodedText.length * bitsInByte > maxPossibleBits) {
    alert(`Max symbol count: ${(maxPossibleBits / 8) | 0}`);
    return;
  }

  writeData(png.data, encodedText);

  fileDownload(PNG.sync.write(png), `test.png`);

  // const fileReader = new FileReader();
  // fileReader.onloadend = function (event) {
  //   const a = new PNG({ filterType: 4 }).parse(event.target.result!);
  //   console.log(a);
  //
  //   a.pack().
  // };
  // fileReader.readAsArrayBuffer(file);
  // console.log(file.stream());
  // file
  //   .stream()
  //   .pipe(new PNG())
  //   .on("parsed", function () {
  //     console.log(this.data);
  //   });
};

const writeData = (buffer: Buffer, data: Uint8Array) => {
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

const readData = (buffer: Buffer) => {
  const id = readDataAsLastBitsOfBytes(buffer, 0, encodedIdentifier.length);
  const textDecoder = new TextDecoder();

  if (textDecoder.decode(id) !== identifier) {
    throw new Error("Invalid protocol structure");
  }

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

  return { length: length, data: textDecoder.decode(data) };
};
