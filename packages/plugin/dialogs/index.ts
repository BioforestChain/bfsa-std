/// <reference lib="dom" />

import {
  BfcsDialogAlert,
  BfcsDialogConfirm,
  BfcsDialogPrompt,
  BfcsDialogWarning,
} from "./bfcsDialogs.ts";
import { BfcsDialogButton } from "./bfcsDialogButton.ts";

if (!customElements.get("dweb-dialog-alert")) {
  customElements.define("dweb-dialog-alert", BfcsDialogAlert);
}
if (!customElements.get("dweb-dialog-prompt")) {
  customElements.define("dweb-dialog-prompt", BfcsDialogPrompt);
}
if (!customElements.get("dweb-dialog-confirm")) {
  customElements.define("dweb-dialog-confirm", BfcsDialogConfirm);
}
if (!customElements.get("dweb-dialog-warning")) {
  customElements.define("dweb-dialog-warning", BfcsDialogWarning);
}
if (!customElements.get("dweb-dialog-button")) {
  customElements.define("dweb-dialog-button", BfcsDialogButton);
}

export {
  BfcsDialogAlert,
  BfcsDialogConfirm,
  BfcsDialogPrompt,
  BfcsDialogWarning,
  BfcsDialogButton,
};
