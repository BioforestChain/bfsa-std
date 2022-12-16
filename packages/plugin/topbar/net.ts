import { NativeUI } from "../common/nativeHandle.ts";
import { getCallNative, postCallNative } from "../gateway/network.ts";
import { Color } from "../types/colorType.ts";
import { TopBar } from "./bfcsTopBarType.ts";

export class TopBarNet implements TopBar.ITopBarNet {
  async topBarNavigationBack(): Promise<boolean> {
    return await getCallNative(NativeUI.TopBarNavigationBack);
  }

  async getTopBarShow(): Promise<boolean> {
    const isShow = await getCallNative(NativeUI.GetTopBarShow);
    return Boolean(isShow);
  }

  async setTopBarShow(isShow: boolean): Promise<boolean> {
    return await getCallNative(NativeUI.SetTopBarShow, isShow);
  }

  async setTopBarHidden(): Promise<boolean> {
    const isShow = await this.getTopBarShow();
    if (isShow) {
      await this.setTopBarShow(false);
    }
    return isShow;
  }

  async getTopBarOverlay(): Promise<boolean> {
    const isOverlay = await getCallNative(NativeUI.GetTopBarOverlay);

    return Boolean(isOverlay);
  }

  async setTopBarOverlay(alpha: string): Promise<boolean> {
    return await getCallNative(NativeUI.SetTopBarOverlay, Number(alpha));
  }

  async getTopBarAlpha(): Promise<number> {
    const alpha = await getCallNative(NativeUI.GetTopBarAlpha);

    return alpha;
  }

  async setTopBarAlpha(alpha: string): Promise<boolean> {
    return await getCallNative(NativeUI.SetTopBarAlpha, Number(alpha));
  }

  async getTopBarTitle(): Promise<string> {
    const title = await getCallNative(NativeUI.GetTopBarTitle);
    return title.toString();
  }

  async setTopBarTitle(title: string): Promise<boolean> {
    return await getCallNative(NativeUI.SetTopBarTitle, title);
  }

  async hasTopBarTitle(): Promise<boolean> {
    const has = await getCallNative(NativeUI.HasTopBarTitle);
    return Boolean(has);
  }

  async getTopBarHeight(): Promise<number> {
    const height = await getCallNative(NativeUI.GetTopBarHeight);
    return Number(height);
  }

  async getTopBarActions(): Promise<TopBar.TopBarItem[]> {
    const actionList = (await getCallNative(
      NativeUI.GetTopBarActions
    )) as string;

    return JSON.parse(actionList);
  }

  async setTopBarActions(actionList: TopBar.TopBarItem[]): Promise<boolean> {
    return await postCallNative(NativeUI.SetTopBarActions, actionList);
  }

  async getTopBarBackgroundColor(): Promise<Color.RGBAHex> {
    return await getCallNative(NativeUI.GetTopBarBackgroundColor);
  }

  async setTopBarBackgroundColor(color: Color.RGBAHex): Promise<boolean> {
    return await getCallNative(NativeUI.SetTopBarBackgroundColor, color);
  }

  async getTopBarForegroundColor(): Promise<Color.RGBAHex> {
    return await getCallNative(NativeUI.GetTopBarForegroundColor);
  }

  async setTopBarForegroundColor(color: Color.RGBAHex): Promise<boolean> {
    return await getCallNative(NativeUI.SetTopBarForegroundColor, color);
  }
}
