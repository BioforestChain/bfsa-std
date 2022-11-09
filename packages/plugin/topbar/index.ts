/// <reference lib="dom" />

import { BfcsTopBar } from "./bfcsTopBar.ts";
import { BfcsTopBarButton } from "./bfcsTopBarButton.ts";

export { BfcsTopBar };

if (!customElements.get("dweb-top-bar")) {
  customElements.define("dweb-top-bar", BfcsTopBar);
}
if (!customElements.get("dweb-top-bar-button")) {
  customElements.define("dweb-top-bar-button", BfcsTopBarButton);
}
