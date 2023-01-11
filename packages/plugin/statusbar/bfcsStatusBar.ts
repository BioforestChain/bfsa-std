import { convertToRGBAHex } from "../util/index.ts";
import { DwebPlugin } from "../native/dweb-plugin.ts";
import { StatusBarNet } from "./net.ts";
import { StatusBar } from "./bfcsStatusBarType.ts";
import { Color } from "../types/colorType.ts";

export class BfcsStatusBar extends DwebPlugin {
  private net: StatusBar.IStatusBarNet;

  constructor() {
    super();
    this.net = new StatusBarNet();
  }
  /**每次将 Web 组件附加到 DOM 时，都会调用一次该 方法 */
  connectedCallback() {
    this._init();
  }
  /**移除DOM添加的方法 */
  disconnectedCallback() { }

  private async _init() {
    if (this.getAttribute("bar-style")) return;
    // this.setAttribute("background-color", colorHex);
    const barStyle = await this.getStatusBarIsDark();
    this.setAttribute("bar-style", barStyle);
  }
  /**
   * 设置状态栏颜色
   * @param color string
   * @param barStyle enum(light-content,dark-content)
   * @returns
   */
  async setStatusBarBackgroundColor(
    color: string,
  ): Promise<void> {
    const colorHex = convertToRGBAHex(color ?? "");
    await this.net.setStatusBarBackgroundColor(colorHex);
    return;
  }
  /**获取状态栏颜色 */
  async getStatusBarBackgroundColor(): Promise<Color.RGBAHex> {
    const colorHex = await this.net.getStatusBarBackgroundColor();
    return colorHex;
  }
  /**查看状态栏是否可见 */
  async getStatusBarVisible(): Promise<boolean> {
    const isVisible = await this.net.getStatusBarVisible();
    return isVisible;
  }
  /**设置状态栏是否可见 */
  async setStatusBarVisible(isVer = true): Promise<boolean> {
    return await this.net.setStatusBarVisible(isVer);
  }
  /**查看状态栏是否覆盖内容 */
  async getStatusBarOverlay(): Promise<boolean> {
    const overlay = await this.net.getStatusBarOverlay();
    return overlay;
  }
  /**设置状态栏是否覆盖内容 */
  async setStatusBarOverlay(isOver = false): Promise<boolean> {
    const overlay = await this.net.setStatusBarOverlay(isOver);
    return overlay;
  }
  /**获取状态栏是否更偏向于使用黑色效果 */
  async getStatusBarIsDark(): Promise<StatusBar.StatusBarStyle> {
    const barStyle = await this.net.getStatusBarIsDark();
    return barStyle;
  }
  /** 设置状态栏效果 */
  async setStatusBarStyle(barStyle: StatusBar.StatusBarStyle): Promise<void> {
    return await this.net.setStatusBarStyle(barStyle);
  }

  static get observedAttributes() {
    return ["overlay", "hidden", "bar-style", "background-color"];
  }

  /**当自定义元素增加、删除、自身属性修改时，被调用。 */
  attributeChangedCallback(
    attrName: string,
    _oldVal: unknown,
    newVal: unknown
  ) {
    if (attrName === "overlay") {
      this.net.setStatusBarOverlay(true);
    } else if (attrName === "hidden") {
      this.net.setStatusBarHidden();
    } else if (attrName === "bar-style") {
      this.setStatusBarStyle(newVal as StatusBar.StatusBarStyle)
    } else if (attrName === "background-color") {
      this.setStatusBarBackgroundColor(newVal as string);
    }
  }
}
