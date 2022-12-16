/// <reference lib="dom" />
import { DwebPlugin } from "./dweb-plugin.ts";
import { OpenScanner } from "./scanner.ts"
import { Navigation, App } from "./app.ts"
import { NativeHandle } from "../common/nativeHandle.ts";
import { getCallNative } from "../gateway/network.ts";

export class DWebMessager extends DwebPlugin {
  constructor() {
    super();
  }
}

export class DwebClipboard extends DwebPlugin {
  constructor() {
    super();
  }

  // 读取剪贴板内容
  readClipboardContent(): Promise<string> {
    return getCallNative(NativeHandle.ReadClipboardContent);
  }

  // 写入剪切板
  writeClipboardContent(content: string): Promise<void> {
    return getCallNative(NativeHandle.WriteClipboardContent, content);
  }
}

/**
 * 服务端的用户如果想给全部的dweb-plugin发送广播，需要在evalJs调用dwebPlugin.dispatch
 * 单独给某个webComponent发送消息则使用 组件名称.dispatch，
 * 单元测试需要使用模拟函数覆盖到两者所有组件
 */
if (!customElements.get("dweb-messager")) {
  customElements.define("dweb-messager", DWebMessager);
}

if (!customElements.get("dweb-clipboard")) {
  customElements.define("dweb-clipboard", DwebClipboard);
}


export { OpenScanner, Navigation, App }
