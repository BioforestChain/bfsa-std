import { Icon } from "../icon/bfcsIconType.ts";
import { Color } from "../types/colorType.ts";

export namespace TopBar {
  export interface TopBarItem {
    icon: Icon.IPlaocIcon;
    onClickCode: string;
    disabled?: boolean;
  }

  export interface ITopBarNet {
    topBarNavigationBack(): Promise<boolean>;
    getTopBarShow(): Promise<boolean>;
    setTopBarShow(isShow: boolean): Promise<boolean>;
    setTopBarHidden(): Promise<boolean>;
    getTopBarOverlay(): Promise<boolean>;
    setTopBarOverlay(alpha: string): Promise<boolean>;
    getTopBarAlpha(): Promise<number>;
    setTopBarAlpha(alpha: string): Promise<boolean>;
    getTopBarTitle(): Promise<string>;
    setTopBarTitle(title: string): Promise<boolean>;
    hasTopBarTitle(): Promise<boolean>;
    getTopBarHeight(): Promise<number>;
    getTopBarActions(): Promise<TopBarItem[]>;
    setTopBarActions(actionList: TopBarItem[]): Promise<boolean>;
    getTopBarBackgroundColor(): Promise<Color.RGBAHex>;
    setTopBarBackgroundColor(color: Color.RGBAHex): Promise<boolean>;
    getTopBarForegroundColor(): Promise<Color.RGBAHex>;
    setTopBarForegroundColor(color: Color.RGBAHex): Promise<boolean>;
  }

  export interface TopBarDesktopFFI {
    setTopbarHidden(
      scopedValue: boolean | undefined,
      globalValue?: boolean
    ): Promise<void>;
    getTopbarHidden(): Promise<boolean>;
    setTopbarOverlay(
      scopedValue: boolean | undefined,
      globalValue?: boolean
    ): Promise<void>;
    getTopbarOverlay(): Promise<boolean>;
    setTopbarTitle(
      scopedValue: string | undefined,
      globalValue?: string
    ): Promise<void>;
    getTopbarTitle(): Promise<string>;
    setTopbarHeight(
      scopedValue: string | undefined,
      globalValue?: string
    ): Promise<string>;
    getTopbarHeight(): Promise<string>;
    setTopbarBackgroundColor(
      scopedValue: string | undefined,
      globalValue?: string
    ): Promise<void>;
    getTopbarBackgroundColor(): Promise<Color.ColorFormatType>;
    setTopbarForegroundColor(
      scopedValue: string | undefined,
      globalValue?: string
    ): Promise<void>;
    getTopbarForegroundColor(): Promise<Color.ColorFormatType>;
  }

  // 用于类型安全
  export interface DwebTopBar {
    title: string;
    "background-color"?: Color.RGBAHex;
    "foreground-color"?: Color.RGBAHex;
    overlay?: string | boolean;
    hidden?: string | boolean;
  }

  export interface DwebTopBarButton {
    disabled?: string | boolean;
  }
}
