import { NativeUI } from "../common/nativeHandle.ts";
import { getCallNative } from "../gateway/network.ts";
import { Color } from "../types/colorType.ts";
import { StatusBar } from "./bfcsStatusBarType.ts";

export class StatusBarNet implements StatusBar.IStatusBarNet {
  async setStatusBarBackgroundColor(colorHex: Color.RGBAHex) {
    await getCallNative(NativeUI.SetStatusBarBackgroundColor, colorHex)
    return;
  }

  async getStatusBarBackgroundColor(): Promise<Color.RGBAHex> {
    const colorHex = await getCallNative(NativeUI.GetStatusBarBackgroundColor);
    return colorHex;
  }

  async getStatusBarVisible(): Promise<boolean> {
    const isVisible = await getCallNative(NativeUI.GetStatusBarVisible);
    return Boolean(isVisible);
  }

  async setStatusBarVisible(isVer: boolean): Promise<boolean> {
    const stringVisible = await getCallNative(
      NativeUI.SetStatusBarVisible,
      isVer
    );
    return Boolean(stringVisible);
  }

  async setStatusBarHidden(): Promise<boolean> {
    const isVisible = await this.getStatusBarVisible();
    if (isVisible) {
      await this.setStatusBarVisible(false);
    }
    return isVisible;
  }

  async getStatusBarOverlay(): Promise<boolean> {
    const stringOverlay = await getCallNative(NativeUI.GetStatusBarOverlay);
    return Boolean(stringOverlay);
  }

  async setStatusBarOverlay(isOverlay: boolean): Promise<boolean> {
    const isOver = await getCallNative(
      NativeUI.SetStatusBarOverlay,
      isOverlay
    );
    return Boolean(isOver);
  }

  /**
   * 是否是深色
   * @returns
   */
  async getStatusBarIsDark(): Promise<StatusBar.StatusBarStyle> {
    const isDarkIcons = await getCallNative(NativeUI.GetStatusBarIsDark);
    let barStyle: StatusBar.StatusBarStyle;
    if (isDarkIcons) {
      barStyle = "dark-content" as StatusBar.StatusBarStyle.DARK_CONTENT;
    } else {
      barStyle = "light-content" as StatusBar.StatusBarStyle.LIGHT_CONTENT;
    }
    return barStyle;
  }

  /**
   * 设置状态栏效果
   * @param barStyle 
   */
  async setStatusBarStyle(barStyle: StatusBar.StatusBarStyle) {
    let statusBarStyle = StatusBar.StatusBarStyle.DEFAULT;

    switch (barStyle) {
      case StatusBar.StatusBarStyle.LIGHT_CONTENT:
        statusBarStyle = StatusBar.StatusBarStyle.LIGHT_CONTENT
        break;
      case StatusBar.StatusBarStyle.DARK_CONTENT:
        statusBarStyle = StatusBar.StatusBarStyle.DARK_CONTENT;
        break;
      default:
        break;
    }

    await getCallNative(NativeUI.SetStatusBarStyle, statusBarStyle)
  }
}
