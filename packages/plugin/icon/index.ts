/// <reference lib="dom" />

import { BfspIcon } from "./bfspIcon.ts";

if (!customElements.get("dweb-icon")) {
  customElements.define("dweb-icon", BfspIcon);
}

export default BfspIcon;
