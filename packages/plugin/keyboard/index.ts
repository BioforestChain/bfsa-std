/// <reference lib="dom" />

import { BfcsKeyboard } from "./bfcsKeyboard.ts";

if (!customElements.get("dweb-keyboard")) {
  customElements.define("dweb-keyboard", BfcsKeyboard);
}

export { BfcsKeyboard };
