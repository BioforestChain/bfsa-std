/// <reference lib="dom" />

import { BfcsBottomBar } from "./bfcsBottomBar.ts";
import { BfcsBottomBarButton } from "./bfcsBottomBarButton.ts";
import { BfcsBottomBarIcon } from "./bfcsBottomBarIcon.ts";
import { BfcsBottomBarText } from "./bfcsBottomBarText.ts";

export { BfcsBottomBar };

if (!customElements.get("dweb-bottom-bar")) {
  customElements.define("dweb-bottom-bar", BfcsBottomBar);
}
if (!customElements.get("dweb-bottom-bar-button")) {
  customElements.define("dweb-bottom-bar-button", BfcsBottomBarButton);
}
if (!customElements.get("dweb-bottom-bar-icon")) {
  customElements.define("dweb-bottom-bar-icon", BfcsBottomBarIcon);
}
if (!customElements.get("dweb-bottom-bar-text")) {
  customElements.define("dweb-bottom-bar-text", BfcsBottomBarText);
}
