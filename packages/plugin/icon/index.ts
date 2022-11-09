/// <reference lib="dom" />

import { BfcsIcon } from "./bfcsIcon.ts";

if (!customElements.get("dweb-icon")) {
  customElements.define("dweb-icon", BfcsIcon);
}

export default BfcsIcon;
