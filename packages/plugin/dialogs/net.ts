import { getCallNative } from "../gateway/network.ts";
import { Dialogs } from "./bfcsDialogsType.ts";
import { NativeUI } from "../common/nativeHandle.ts";

export class DialogsNet implements Dialogs.IDialogsNet {
  async openAlert(
    config: Dialogs.IAlertConfig,
    confirmFunc: string
  ): Promise<void> {
    const cb = `(()=>{
          ${confirmFunc}
      })`;
    await getCallNative(NativeUI.OpenDialogAlert, {
      config: JSON.stringify(config),
      cb,
    });
  }

  async openPrompt(
    config: Dialogs.IPromptConfig,
    confirmFunc: string,
    cancelFunc?: string
  ): Promise<void> {
    const cb = `((result)=>{
        if(result){
          ${confirmFunc}
        }else{
          ${cancelFunc ?? ""}
        }
      })`;
    await getCallNative(NativeUI.OpenDialogPrompt, {
      config: JSON.stringify(config),
      cb,
    });
  }

  async openConfirm(
    config: Dialogs.IConfirmConfig,
    confirmFunc: string,
    cancelFunc?: string
  ): Promise<void> {
    const cb = `((result)=>{
        if(result){
          ${confirmFunc}
        }else{
          ${cancelFunc ?? ""}
        }
      })`;
    await getCallNative(NativeUI.OpenDialogConfirm, {
      config: JSON.stringify(config),
      cb,
    });
  }

  async openWarning(
    config: Dialogs.IConfirmConfig,
    confirmFunc: string,
    cancelFunc?: string
  ): Promise<void> {
    const cb = `((result)=>{
        if(result){
          ${confirmFunc}
        }else{
          ${cancelFunc ?? ""}
        }
      })`;
    await getCallNative(NativeUI.OpenDialogWarning, {
      config: JSON.stringify(config),
      cb,
    });
  }
}
