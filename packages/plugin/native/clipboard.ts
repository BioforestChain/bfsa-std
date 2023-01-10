import { DwebPlugin } from "./dweb-plugin.ts";
import { NativeHandle } from "../common/nativeHandle.ts";
import { getCallNative } from "../gateway/network.ts";

export interface IReadResult {
  value: string;
  type: string;
}
export interface IWriteOption {
  str?: string;
  image?: string;
  url?: string;
  label?: string; // (android only)
}
export class DwebClipboard extends DwebPlugin {
  constructor() {
    super();
  }

  // 读取剪贴板内容
  async readClipboardContent(): Promise<IReadResult> {
    return await getCallNative(NativeHandle.ReadClipboardContent);
  }

  // 写入剪切板
  async writeClipboardContent(writeOption: IWriteOption): Promise<void> {
    return await getCallNative(NativeHandle.WriteClipboardContent, writeOption);
  }
}

if (!customElements.get("dweb-clipboard")) {
  customElements.define("dweb-clipboard", DwebClipboard);
}
