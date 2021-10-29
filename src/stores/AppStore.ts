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
import { getFileAsDataUrl, getImageDataFromDataUrl } from "utils/files";

export class AppStore {
  private supportedTargetImageMimeType = "image/png";
  private encoder = new TextEncoder();
  private disposers: Array<() => void> = [];
  private readonly canvasRef: RefObject<HTMLCanvasElement>;

  public text = "";
  public file?: File = undefined;
  public imageData?: ImageData = undefined;
  public maxDataBytesCount = 0;

  public get currentBytesCount() {
    return this.encoder.encode(this.text).length;
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
    makeObservable<AppStore, "decode" | "computeMaxBytesCount">(this, {
      text: observable,
      file: observable,
      imageData: observable,
      maxDataBytesCount: observable,
      currentBytesCount: computed,
      setFile: action,
      setText: action,
      decode: action,
      computeMaxBytesCount: action,
    });

    this.disposers.push(reaction(() => this.imageData, this.decode));
    // Because can't use async function in compute properties
    this.disposers.push(
      reaction(() => this.imageData, this.computeMaxBytesCount),
    );
  }

  public setText = (value: string) => {
    this.text = value;
  };

  public setFile = async (value: Array<File>) => {
    const file = value[0];

    this.file = file;

    if (file) {
      const filePath = await getFileAsDataUrl(file);
      const { naturalWidth, naturalHeight } = await getImageDataFromDataUrl(
        filePath,
      );

      this.canvas.width = naturalWidth;
      this.canvas.height = naturalHeight;
      // TODO: think about compatibility see https://caniuse.com/?search=createImageBitmap
      const imageBitmap = await createImageBitmap(file);
      this.canvasContext.drawImage(imageBitmap, 0, 0);
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

    if (this.currentBytesCount > this.maxDataBytesCount) {
      return;
    }

    writeData(this.imageData.data, this.encoder.encode(this.text));

    this.canvasContext.putImageData(this.imageData, 0, 0);

    const fileName = this.file.name;
    const newFileName = fileName.substr(0, fileName.lastIndexOf(".")) + ".png";

    this.canvas.toBlob((blob) => {
      if (blob) {
        fileDownload(blob, newFileName, this.supportedTargetImageMimeType);
      }
    }, this.supportedTargetImageMimeType);
  };

  private computeMaxBytesCount = async (imageData?: ImageData) => {
    if (!imageData) {
      this.maxDataBytesCount = 0;
      return;
    }

    const m = await getMaxDataBytesCount(imageData.data);

    runInAction(() => {
      this.maxDataBytesCount = m;
    });
  };

  public dispose = () => {
    for (const d of this.disposers) {
      d();
    }
  };
}
