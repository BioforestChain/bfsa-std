import { Color } from "../types/colorType.ts";

export namespace StatusBar {
  export interface IStatusBarNet {
    setStatusBarBackgroundColor(
      colorHex: string
    ): Promise<void>;
    getStatusBarBackgroundColor(): Promise<Color.RGBAHex>;
    getStatusBarVisible(): Promise<boolean>;
    setStatusBarVisible(isVer: boolean): Promise<boolean>;
    setStatusBarHidden(): Promise<boolean>;
    getStatusBarOverlay(): Promise<boolean>;
    setStatusBarOverlay(isOver: boolean): Promise<boolean>;
    getStatusBarIsDark(): Promise<StatusBarStyle>;
    setStatusBarStyle(barStyle: StatusBarStyle): Promise<void>;
  }

  // default:	默认的样式（IOS 为白底黑字、Android 为黑底白字、Desktop-dev同Android）
  // light-content:	黑底白字
  // dark-content:	白底黑字（需要 Android API>=23）
  export enum StatusBarStyle {
    DEFAULT = "default",
    LIGHT_CONTENT = "light-content",
    DARK_CONTENT = "dark-content",
  }

  export enum StatusBarIosStyle {
    DEFAULT = "default",
    LIGHT_CONTENT = "lightContent",
    DARK_CONTENT = "default",
  }

  export enum StatusBarAndroidStyle {
    DEFAULT = 0,
    LIGHT_CONTENT = -1,
    DARK_CONTENT = 1,
  }

  // 用于类型安全
  export interface DwebStatusBar {
    overlay?: string | boolean;
    hidden?: string | boolean;
    "bar-style"?: StatusBarStyle;
    "background-color"?: Color.RGBAHex;
  }
}
