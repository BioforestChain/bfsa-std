/// <reference lib="dom" />

import { BfcsStatusBar } from "./bfcsStatusBar.ts";

if (!customElements.get("dweb-status-bar")) {
  customElements.define("dweb-status-bar", BfcsStatusBar);
}

export { BfcsStatusBar };
