import { getCallNative } from "../gateway/network.ts";
import { Keyboard } from "./bfcsKeyboardType.ts";
import { NativeUI } from "../common/nativeHandle.ts";

export class VirtualKeyboardNet implements Keyboard.IVirtualKeyboardNet {
  async getKeyboardSafeArea(): Promise<Keyboard.IKeyboardSafeArea> {
    const safeArea = await getCallNative(NativeUI.GetKeyBoardSafeArea);
    return JSON.parse(safeArea);
  }

  async getKeyboardHeight(): Promise<number> {
    const height = await getCallNative(NativeUI.GetKeyBoardHeight);
    return parseFloat(height);
  }

  async getKeyboardOverlay(): Promise<boolean> {
    const overlay = await getCallNative(NativeUI.GetKeyBoardOverlay);
    return overlay;
  }

  async setKeyboardOverlay(isOver = true): Promise<boolean> {
    const overlay = await getCallNative(NativeUI.SetKeyBoardOverlay, isOver);
    return overlay;
  }

  async toggleKeyboardOverlay(): Promise<boolean> {
    const overlay = await this.getKeyboardOverlay();
    if (!overlay) {
      await this.setKeyboardOverlay(true);
    }
    return overlay;
  }

  showKeyboard(): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(async () => {
        const isShow = await getCallNative(NativeUI.ShowKeyBoard);
        resolve(isShow);
      }, 100);
    });
  }

  async hideKeyboard(): Promise<boolean> {
    return await getCallNative(NativeUI.HideKeyBoard);
  }
}
