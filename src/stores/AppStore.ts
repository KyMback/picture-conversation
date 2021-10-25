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
  public filePath?: string = undefined;

  public get currentBytesCount() {
    return this.encoder.encode(this.text).length;
  }

  constructor() {
    makeObservable<AppStore, "setFilePath">(this, {
      text: observable,
      file: observable,
      filePath: observable,
      currentBytesCount: computed,
      setFile: action,
      setText: action,
      setFilePath: action,
    });

    this.disposers.push(reaction(() => this.file, this.setFilePath));
  }

  public setText = (value: string) => {
    this.text = value;
  };

  public setFile = (value: FileList | null) => {
    const file = value?.[0];
    if (!file) {
      return;
    }

    this.file = file;
  };

  private setFilePath = () => {
    if (!this.file) {
      this.filePath = undefined;
      return;
    }

    const fr = new FileReader();
    fr.onload = (ev) => {
      runInAction(() => {
        this.filePath = ev.target.result;
      });
    };
    fr.readAsDataURL(this.file);
  };

  public decode = async () => {
    if (!this.file) {
      return;
    }

    const buf = await this.file.arrayBuffer();
    const png = PNG.sync.read(new Buffer(buf));

    const data = readData(png.data);
    console.log(`decode data: ${data.data}`);
  };

  public encode = async () => {
    if (!this.file) {
      return;
    }

    const encoder = new TextEncoder();
    const encodedText = encoder.encode(this.text);
    const buf = await this.file.arrayBuffer();
    const png = PNG.sync.read(new Buffer(buf));
    const maxDataBytesCount = getMaxDataBytesCount(png.data);

    if (encodedText.length > maxDataBytesCount) {
      alert(`Too much symbols`);
      return;
    }

    writeData(png.data, encodedText);

    fileDownload(PNG.sync.write(png), this.file.name);
  };

  public dispose = () => {
    for (const d of this.disposers) {
      d();
    }
  };
}
