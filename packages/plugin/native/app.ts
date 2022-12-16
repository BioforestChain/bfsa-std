import { NativeHandle } from "../common/nativeHandle.ts";
import { NativeUI } from "../common/nativeHandle.ts";
import { getCallNative } from "../gateway/network.ts";
import { DwebPlugin } from "./dweb-plugin.ts";

// app控制方法
export class App extends DwebPlugin {
  constructor() {
    super();
  }

  /**
   * 退出app
   * @returns 
   */
  async exitApp() {
    return await getCallNative(NativeHandle.ExitApp);
  }
  /**
   * 监听app点击返回（android only）
   * @param backButtonListener 
   */
  listenBackButton(backButtonListener: BackButtonListener) {
    this.addListener(NativeHandle.ListenBackButton, backButtonListener)
  }
}

export interface BackButtonListenerEvent {
  /**
   * Indicates whether the browser can go back in history.
   * False when the history stack is on the first entry.
   *
   * @since 1.0.0
   */
  canGoBack: boolean;
}
export type BackButtonListener = (event: BackButtonListenerEvent) => void;


// 系统导航栏
export class Navigation extends DwebPlugin {
  constructor() {
    super();
  }
  /**隐藏系统导航栏 默认值false隐藏 */
  setNavigationBarVisible(isHide = false) {
    return getCallNative(NativeUI.SetNavigationBarVisible, isHide);
  }
  /**获取系统导航栏颜色 */
  getNavigationBarVisible() {
    return getCallNative(NativeUI.GetNavigationBarVisible);
  }
  /**
   * 设置导航栏颜色
   * @param color 设置颜色
   * @param darkIcons 是否更期望使用深色效果
   * @param isNavigationBarContrastEnforced 在系统背景高度透明的时候导航栏是否应该增强对比度，android仅支持：API 29+
   * @returns Promise<true>
   */
  setNavigationBarColor(
    colorHex: string,
    darkIcons = false,
    isNavigationBarContrastEnforced = true
  ) {
    return getCallNative(NativeUI.SetNavigationBarColor, {
      colorHex,
      darkIcons,
      isNavigationBarContrastEnforced,
    });
  }
  /** 获取系统导航栏是否覆盖内容*/
  getNavigationBarOverlay() {
    return getCallNative(NativeUI.GetNavigationBarOverlay);
  }
  /**设置系统导航栏是否覆盖内容,默认值false为不覆盖 */
  setNavigationBarOverlay(isOverlay = false) {
    return getCallNative(NativeUI.SetNavigationBarOverlay, isOverlay);
  }
}

if (!customElements.get("dweb-navigation")) {
  customElements.define("dweb-navigation", Navigation);
}
