import { Data } from "../types/dataType.ts";

export namespace Dialogs {
  export interface IBaseConfig {
    title: string;
    confirmText: string;
    dismissOnBackPress?: boolean;
    dismissOnClickOutside?: boolean;
  }

  export interface IAlertConfig extends IBaseConfig {
    content: string;
  }

  export interface IPromptConfig extends IBaseConfig {
    label: string;
    cancelText?: string;
    defaultValue?: string;
  }

  export interface IConfirmConfig extends IBaseConfig {
    message: string;
    cancelText?: string;
  }

  export interface IDialogsNet {
    openAlert(config: IAlertConfig, confirmFunc: string): Promise<void>;
    openPrompt(
      config: IPromptConfig,
      confirmFunc: string,
      cancelFunc?: string
    ): Promise<void>;
    openConfirm(
      config: IConfirmConfig,
      confirmFunc: string,
      cancelFunc?: string
    ): Promise<void>;
    openWarning(
      config: IConfirmConfig,
      confirmFunc: string,
      cancelFunc?: string
    ): Promise<void>;
  }
}
