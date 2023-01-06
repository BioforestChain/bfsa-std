import { NativeUI } from "../common/nativeHandle.ts";
import { getCallNative } from "../gateway/network.ts";
import { Color } from "../types/colorType.ts";
import { BottomBar } from "./bfcsBottomBarType.ts";
export class BottomBarNet implements BottomBar.IBottomBarNet {
  async getHidden(): Promise<boolean> {
    return await getCallNative(NativeUI.GetBottomBarEnabled);
  }

  async setHidden(isEnabled = true): Promise<boolean> {
    return await getCallNative(NativeUI.SetBottomBarEnabled, isEnabled);
  }

  async getBottomBarAlpha(): Promise<number> {
    return await getCallNative(NativeUI.GetBottomBarAlpha);
  }

  async setBottomBarAlpha(alpha: string): Promise<number> {
    return await getCallNative(NativeUI.SetBottomBarAlpha, alpha);
  }

  async getHeight(): Promise<number> {
    return await getCallNative(NativeUI.GetBottomBarHeight);
  }

  async setHeight(height: number): Promise<boolean> {
    return await getCallNative(NativeUI.SetBottomBarHeight, height);
  }

  async getBackgroundColor(): Promise<Color.RGBAHex> {
    const colorHex = await getCallNative(
      NativeUI.GetBottomBarBackgroundColor
    );
    return colorHex;
  }

  async setBackgroundColor(colorHex: Color.RGBAHex): Promise<boolean> {
    return await getCallNative(
      NativeUI.SetBottomBarBackgroundColor,
      colorHex
    );
  }

  async getForegroundColor(): Promise<Color.RGBAHex> {
    const colorHex = await getCallNative(
      NativeUI.GetBottomBarForegroundColor
    );
    return colorHex;
  }

  async setForegroundColor(colorHex: Color.RGBAHex): Promise<boolean> {
    return await getCallNative(
      NativeUI.SetBottomBarForegroundColor,
      colorHex
    );
  }

  async getActions(): Promise<BottomBar.BottomBarItem[]> {
    const actionList = JSON.parse(
      await getCallNative(NativeUI.GetBottomBarActions)
    );
    return actionList;
  }

  async setActions(actionList: BottomBar.BottomBarItem[]): Promise<void> {
    console.log("bottomNet setAction");
    console.log(actionList);
    return await getCallNative(NativeUI.SetBottomBarActions, actionList);
  }
}
