/// <reference lib="dom" />
import { DwebPlugin } from "./dweb-plugin.ts";
export { EPermissions, Permissions } from "./permissions.ts";
export { OpenScanner } from "./scanner.ts";
export { Navigation, App, ImpactStyle, NotificationType } from "./app.ts";
export { DwebCamera, CameraDirection, CameraResultType, CameraSource } from "./camera.ts";

export class DWebMessager extends DwebPlugin {
  constructor() {
    super();
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

