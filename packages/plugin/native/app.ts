import { NativeHandle } from "../common/nativeHandle.ts";
import { NativeUI } from "../common/nativeHandle.ts";
import { getCallNative } from "../gateway/network.ts";
import { DwebPlugin } from "./dweb-plugin.ts";

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

export interface IShareOption {
  title?: string;
  text?: string;
  url?: string;
  files?: string[];
  dialogTitle?: string;
  imageData?: string;
}

export interface ImpactOptions {
  /**
   * Impact Feedback Style
   *
   * The mass of the objects in the collision simulated by a [UIImpactFeedbackGenerator](https://developer.apple.com/documentation/uikit/uiimpactfeedbackstyle) object.
   *
   * @default ImpactStyle.Heavy
   * @since 1.0.0
   */
  style: ImpactStyle;
}

export enum ImpactStyle {
  /**
   * A collision between large, heavy user interface elements
   *
   * @since 1.0.0
   */
  Heavy = 'HEAVY',

  /**
   * A collision between moderately sized user interface elements
   *
   * @since 1.0.0
   */
  Medium = 'MEDIUM',

  /**
   * A collision between small, light user interface elements
   *
   * @since 1.0.0
   */
  Light = 'LIGHT',
}

export interface NotificationOptions {
  /**
   * Notification Feedback Type
   *
   * The type of notification feedback generated by a [UINotificationFeedbackGenerator](https://developer.apple.com/documentation/uikit/uinotificationfeedbacktype) object.
   *
   * @default NotificationType.SUCCESS
   * @since 1.0.0
   */
  type: NotificationType;
}

export enum NotificationType {
  /**
   * A notification feedback type indicating that a task has completed successfully
   *
   * @since 1.0.0
   */
  Success = 'SUCCESS',

  /**
   * A notification feedback type indicating that a task has produced a warning
   *
   * @since 1.0.0
   */
  Warning = 'WARNING',

  /**
   * A notification feedback type indicating that a task has failed
   *
   * @since 1.0.0
   */
  Error = 'ERROR',
}

export interface VibratePresetOption {
  type: VibratePresetType
}

// 预设的五种振动类型
export enum VibratePresetType {
  CLICK = "CLICK",
  DOUBLE_CLICK = "DOUBLE_CLICK",
  HEAVY_CLICK = "HEAVY_CLICK",
  TICK = "TICK",
  DISABLED= "DISABLED"
}

export type durationOption = {duration: number} | number[]

// app控制方法
export class App extends DwebPlugin {
  constructor() {
    super();
  }

  /**
   * 退出app
   * @returns 
   */
  async exitApp(): Promise<void> {
    await this.onRequest(NativeHandle.ExitApp);
  }
  /**
   * 监听app点击返回（android only）
   * @param backButtonListener 
   */
  listenBackButton(backButtonListener: BackButtonListener) {
    this.addListener(NativeHandle.ListenBackButton, backButtonListener)
  }

  // 读取剪贴板内容
  async readClipboardContent(): Promise<IReadResult> {
    const result = await this.onRequest(NativeHandle.ReadClipboardContent);
    console.log("readClipboardContent: ", result);
    const readResult = JSON.parse(result as string) as IReadResult;
    return readResult;
  }

  // 写入剪切板
  async writeClipboardContent(writeOption: IWriteOption): Promise<boolean> {
    // return await getCallNative(NativeHandle.WriteClipboardContent, writeOption);
    const result = await this.onRequest(NativeHandle.WriteClipboardContent, JSON.stringify(writeOption));
    return result === "true"
  }

  // 获取网络状态
  async getNetworkStatus(): Promise<string> {
    return await this.onRequest(NativeHandle.GetNetworkStatus, "") as string;
  }

  // 触碰物体
  async hapticsImpact(option: ImpactOptions): Promise<void> {
    await this.onRequest(NativeHandle.HapticsImpact, JSON.stringify(option));
    return;
  }

  // 振动通知
  async hapticsNotification(option: NotificationOptions): Promise<void> {
    await this.onRequest(NativeHandle.HapticsNotification, JSON.stringify(option));
    return;
  }

  // 反馈振动
  async hapticsVibrate(option: durationOption): Promise<void> {
    await this.onRequest(NativeHandle.HapticsVibrate, JSON.stringify(option));
    return;
  }

  // 反馈振动预设
  async hapticsVibratePreset(option: VibratePresetOption): Promise<void> {
    await this.onRequest(NativeHandle.HapticsVibratePreset, option.type);
    return
  }

  // 提示
  async showToast(
    text: string,
    duration: string = "short",
    position: string = "bottom"
  ) {
    const param = {
      text,
      duration,
      position,
    };

    return await this.onRequest(NativeHandle.ShowToast, JSON.stringify(param));
  }

  async systemShare(shareOption: IShareOption) {
    return await this.onRequest(NativeHandle.SystemShare, JSON.stringify(shareOption));
  }
}

export interface BackButtonListenerEvent {
  // 如果 触发了返回值 这个是个true
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

if (!customElements.get("dweb-app")) {
  customElements.define("dweb-app", App);
}
