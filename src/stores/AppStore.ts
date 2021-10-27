import {
  action,
  computed,
  makeObservable,
  observable,
  reaction,
  runInAction,
} from "mobx";
import { getMaxDataBytesCount, readData, writeData } from "../protocol";
import fileDownload from "js-file-download";
import { RefObject } from "react";

export class AppStore {
  private encoder = new TextEncoder();
  private disposers: Array<() => void> = [];
  private readonly canvasRef: RefObject<HTMLCanvasElement>;

  public text = "";
  public file?: File = undefined;
  public imageData?: ImageData = undefined;

  public get currentBytesCount() {
    return this.encoder.encode(this.text).length;
  }

  public get maxDataBytesCount() {
    if (!this.imageData) {
      return 0;
    }

    return getMaxDataBytesCount(this.imageData.data);
  }

  private get canvas() {
    if (!this.canvasRef.current) {
      throw new Error("Canvas should exist");
    }

    return this.canvasRef.current;
  }

  private get canvasContext() {
    const context = this.canvas.getContext("2d");

    if (!context) {
      throw new Error("Canvas context should exist");
    }

    context.globalCompositeOperation = "copy";

    return context;
  }

  constructor(canvasRef: RefObject<HTMLCanvasElement>) {
    this.canvasRef = canvasRef;
    makeObservable<AppStore, "decode">(this, {
      text: observable,
      file: observable,
      imageData: observable,
      maxDataBytesCount: computed,
      currentBytesCount: computed,
      setFile: action,
      setText: action,
      decode: action,
    });

    this.disposers.push(reaction(() => this.imageData, this.decode));
  }

  public setText = (value: string) => {
    this.text = value;
  };

  public setFile = async (value: FileList | null) => {
    const file = value?.[0];

    this.file = file;

    if (file) {
      const filePath = await getFilePath(file);
      const { naturalWidth, naturalHeight } =
        await getHeightAndWidthFromDataUrl(filePath);

      this.canvas.width = naturalWidth;
      this.canvas.height = naturalHeight;
      this.canvasContext.drawImage(await createImageBitmap(file), 0, 0);
      this.imageData = this.canvasContext.getImageData(
        0,
        0,
        naturalWidth,
        naturalHeight,
      );
    }
  };

  private decode = async (image?: ImageData) => {
    if (!image) {
      return;
    }

    const result = readData(image.data);

    if ("isNotPCP" in result) {
      return;
    }

    runInAction(() => {
      this.text = result.data;
    });
  };

  public encode = async () => {
    if (!this.file || !this.imageData) {
      return;
    }

    const encoder = new TextEncoder();
    const encodedText = encoder.encode(this.text);
    const maxDataBytesCount = getMaxDataBytesCount(this.imageData.data);

    if (encodedText.length > maxDataBytesCount) {
      alert(`Too much symbols`);
      return;
    }

    writeData(this.imageData.data, encodedText);

    console.log("expected data:");
    console.log(this.imageData.data);
    this.canvasContext.putImageData(this.imageData, 0, 0);
    console.log("actual data:");
    console.log(
      this.canvasContext.getImageData(
        0,
        0,
        this.canvas.width,
        this.canvas.height,
      ).data,
    );

    this.canvas.toBlob(
      (blob) => {
        if (blob) {
          fileDownload(blob, this.file!.name);
        }
      },
      "image/png",
      1,
    );
  };

  public dispose = () => {
    for (const d of this.disposers) {
      d();
    }
  };
}

const getFilePath = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();

    fr.onload = (e) => {
      resolve(e.target?.result as string);
    };

    fr.onerror = (e) => {
      reject(e.target?.error);
    };

    fr.readAsDataURL(file);
  });
};

const getHeightAndWidthFromDataUrl = (
  dataURL: string,
): Promise<{ naturalHeight: number; naturalWidth: number }> => {
  const img = new Image();
  return new Promise<{ naturalHeight: number; naturalWidth: number }>(
    (resolve) => {
      img.onload = () => {
        resolve({
          naturalHeight: img.naturalHeight,
          naturalWidth: img.naturalWidth,
        });
      };

      img.src = dataURL;
    },
  ).finally(() => img.remove());
};
