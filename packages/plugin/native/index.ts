/// <reference lib="dom" />
import { DwebPlugin } from "./dweb-plugin.ts";
import { NativeHandle } from "../common/nativeHandle.ts";
import { getCallNative } from "../gateway/network.ts";
export { EPermissions, Permissions } from "./permissions.ts"
export { OpenScanner } from "./scanner.ts"
export { Navigation, App } from "./app.ts"

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
  async readClipboardContent(): Promise<string> {
    return await getCallNative(NativeHandle.ReadClipboardContent);
  }

  // 写入剪切板
  async writeClipboardContent(content: string): Promise<void> {
    return await getCallNative(NativeHandle.WriteClipboardContent, content);
  }
}

export class DwebNetwork extends DwebPlugin {
  constructor() {
    super()
  }

  // 获取网络状态
  async getNetworkStatus(): Promise<string> {
    return await getCallNative(NativeHandle.GetNetworkStatus)
  }
}

export class DwebHaptics extends DwebPlugin {
  constructor() {
    super()
  }

  // 触碰轻质量物体
  async hapticsImpactLight(): Promise<void> {
    return await getCallNative(NativeHandle.HapticsImpactLight);
  }

  // 警告分隔的振动通知
  async hapticsNotificationWarning(): Promise<void> {
    return await getCallNative(NativeHandle.HapticsNotificationWarning);
  }

  // 反馈振动
  async hapticsVibrate(duration: string): Promise<void> {
    return await getCallNative(NativeHandle.HapticsVibrate, duration)
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

if (!customElements.get("dweb-network")) {
  customElements.define("dweb-network", DwebNetwork);
}

if (!customElements.get("dweb-haptics")) {
  customElements.define("dweb-haptics", DwebHaptics)
}


