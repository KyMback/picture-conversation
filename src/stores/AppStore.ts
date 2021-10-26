import {
  action,
  computed,
  makeObservable,
  observable,
  reaction,
  runInAction,
} from "mobx";
import { PNG } from "pngjs/browser";
import { getMaxDataBytesCount, readData, writeData } from "../protocol";
import fileDownload from "js-file-download";

export class AppStore {
  private encoder = new TextEncoder();
  private disposers: Array<() => void> = [];

  public text = "";
  public file?: File = undefined;
  public png?: PNG = undefined;
  public filePath?: string = undefined;

  public get currentBytesCount() {
    return this.encoder.encode(this.text).length;
  }

  public get maxDataBytesCount() {
    if (!this.png) {
      return 0;
    }

    return getMaxDataBytesCount(this.png.data);
  }

  constructor() {
    makeObservable<AppStore, "setFilePath" | "setPng" | "decode">(this, {
      text: observable,
      file: observable,
      filePath: observable,
      png: observable,
      maxDataBytesCount: computed,
      currentBytesCount: computed,
      setFile: action,
      setText: action,
      setFilePath: action,
      setPng: action,
      decode: action,
    });

    this.disposers.push(reaction(() => this.png, this.decode));
  }

  public setText = (value: string) => {
    this.text = value;
  };

  public setFile = async (value: FileList | null) => {
    const file = value?.[0];

    this.file = file;
    this.setFilePath(file);
    await this.setPng(file);
  };

  private setPng = async (file?: File) => {
    if (!file) {
      this.png = undefined;
      return;
    }

    const buf = await file.arrayBuffer();
    runInAction(() => {
      this.png = PNG.sync.read(new Buffer(buf));
    });
  };

  private setFilePath = (file?: File) => {
    if (!file) {
      this.filePath = undefined;
      return;
    }

    const fr = new FileReader();
    fr.onload = (ev) => {
      runInAction(() => {
        this.filePath = ev.target?.result as string;
      });
    };
    fr.readAsDataURL(file);
  };

  private decode = async (png?: PNG) => {
    if (!png) {
      return;
    }

    const result = readData(png.data);

    if ("isNotPCP" in result) {
      return;
    }

    runInAction(() => {
      this.text = result.data;
    });
  };

  public encode = async () => {
    if (!this.file || !this.png) {
      return;
    }

    const encoder = new TextEncoder();
    const encodedText = encoder.encode(this.text);
    const maxDataBytesCount = getMaxDataBytesCount(this.png.data);

    if (encodedText.length > maxDataBytesCount) {
      alert(`Too much symbols`);
      return;
    }

    writeData(this.png.data, encodedText);

    fileDownload(PNG.sync.write(this.png), this.file.name);
  };

  public dispose = () => {
    for (const d of this.disposers) {
      d();
    }
  };
}
