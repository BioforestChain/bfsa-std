/// <reference lib="esnext" />
/// <reference lib="dom" />

// import * as React from "https://esm.sh/react";
import { TopBar } from "../topbar/bfcsTopBarType.ts";
import { BottomBar } from "../bottombar/bfcsBottomBarType.ts";
import { StatusBar } from "../statusbar/bfcsStatusBarType.ts";
import { Dialogs } from "../dialogs/bfcsDialogsType.ts";
import { Icon } from "../icon/bfspIconType.ts";
import { Keyboard } from "../keyboard/bfcsKeyboardType.ts";
import React from 'https://dev.jspm.io/react'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "dweb-top-bar": DwebTopBarProps;
      "dweb-top-bar-button": DwebTopBarButtonProps;
      "dweb-bottom-bar": DwebBottomBarProps;
      "dweb-bottom-bar-button": DwebBottomBarButtonProps;
      "dweb-bottom-bar-icon": DwebBottomBarIconProps;
      "dweb-bottom-bar-text": DwebBottomBarTextProps;
      "dweb-status-bar": DwebStatusBarProps;
      "dweb-dialog-alert": DwebDialogAlertProps;
      "dweb-dialog-prompt": DwebDialogPromptProps;
      "dweb-dialog-confirm": DwebDialogConfirmProps;
      "dweb-dialog-warning": DwebDialogConfirmProps;
      "dweb-icon": null;
      "dweb-messager": null;
      "dweb-navigation": null;
      "dweb-scanner": null;
    }

    // topbar
    interface DwebTopBarProps
      extends Omit<
        React.DetailedHTMLProps<
          React.HTMLAttributes<HTMLElement>,
          HTMLElement
        >,
        keyof TopBar.DwebTopBar
      >,
      TopBar.DwebTopBar { }
    interface DwebTopBarButtonProps
      extends React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >,
      TopBar.DwebTopBarButton { }
    // bottombar
    interface DwebBottomBarProps
      extends Omit<
        React.DetailedHTMLProps<
          React.HTMLAttributes<HTMLElement>,
          HTMLElement
        >,
        keyof BottomBar.DwebBottomBar
      >,
      BottomBar.DwebBottomBar { }
    interface DwebBottomBarButtonProps
      extends React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >,
      BottomBar.DwebBottomBarButton { }
    interface DwebBottomBarIconProps
      extends Omit<
        React.DetailedHTMLProps<
          React.HTMLAttributes<HTMLElement>,
          HTMLElement
        >,
        keyof BottomBar.DwebBottomBarIcon
      >,
      BottomBar.DwebBottomBarIcon { }
    interface DwebBottomBarTextProps
      extends Omit<
        React.DetailedHTMLProps<
          React.HTMLAttributes<HTMLElement>,
          HTMLElement
        >,
        keyof BottomBar.DwebBottomBarText
      >,
      BottomBar.DwebBottomBarText { }
    // statusbar
    interface DwebStatusBarProps
      extends Omit<
        React.DetailedHTMLProps<
          React.HTMLAttributes<HTMLElement>,
          HTMLElement
        >,
        keyof StatusBar.DwebStatusBar
      >,
      StatusBar.DwebStatusBar { }
    // dialogs
    interface DwebDialogAlertProps
      extends Omit<
        React.DetailedHTMLProps<
          React.HTMLAttributes<HTMLElement>,
          HTMLElement
        >,
        keyof Dialogs.IAlertConfig
      >,
      Dialogs.IAlertConfig { }
    interface DwebDialogPromptProps
      extends Omit<
        React.DetailedHTMLProps<
          React.HTMLAttributes<HTMLElement>,
          HTMLElement
        >,
        keyof Dialogs.IPromptConfig
      >,
      Dialogs.IPromptConfig { }
    interface DwebDialogConfirmProps
      extends Omit<
        React.DetailedHTMLProps<
          React.HTMLAttributes<HTMLElement>,
          HTMLElement
        >,
        keyof Dialogs.IConfirmConfig
      >,
      Dialogs.IConfirmConfig { }
    // icon
    interface DwebIconProps
      extends React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >,
      Icon.IPlaocIcon { }
    // keyboard
    interface DwebKeyboardProps
      extends Omit<
        React.DetailedHTMLProps<
          React.HTMLAttributes<HTMLElement>,
          HTMLElement
        >,
        keyof Keyboard.DwebKeyboard
      >,
      Keyboard.DwebKeyboard { }
  }
}
