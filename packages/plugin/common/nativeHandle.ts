export enum NativeHandle {
  OpenQrScanner = "OpenQrScanner", // 二维码
  BarcodeScanner = "BarcodeScanner", // 条形码
  ServiceWorkerReady = "ServiceWorkerReady", // 通知后端，serviceWorker已经初始化好了
  ReadClipboardContent = "ReadClipboardContent", // 读取剪切板
  WriteClipboardContent = "WriteClipboardContent", // 写入剪切板
  ExitApp = "ExitApp", // 退出app
  ListenBackButton = "ListenBackButton", // 监听后退事件 （android only）
}

export enum NativeUI {
  // Navigation
  SetNavigationBarVisible = "SetNavigationBarVisible",
  GetNavigationBarVisible = "GetNavigationBarVisible",
  SetNavigationBarColor = "SetNavigationBarColor",
  SetNavigationBarOverlay = "SetNavigationBarOverlay",
  GetNavigationBarOverlay = "GetNavigationBarOverlay",
  // Status Bar
  SetStatusBarColor = "SetStatusBarColor",
  GetStatusBarColor = "GetStatusBarColor",
  GetStatusBarIsDark = "GetStatusBarIsDark",
  GetStatusBarVisible = "GetStatusBarVisible",
  GetStatusBarOverlay = "GetStatusBarOverlay",
  SetStatusBarOverlay = "SetStatusBarOverlay",
  SetStatusBarVisible = "SetStatusBarVisible",
  // keyboard
  GetKeyBoardSafeArea = "GetKeyBoardSafeArea",
  GetKeyBoardHeight = "GetKeyBoardHeight",
  GetKeyBoardOverlay = "GetKeyBoardOverlay",
  SetKeyBoardOverlay = "SetKeyBoardOverlay",
  ShowKeyBoard = "ShowKeyBoard",
  HideKeyBoard = "HideKeyBoard",
  // Top Bar
  TopBarNavigationBack = "TopBarNavigationBack",
  GetTopBarShow = "GetTopBarShow",
  SetTopBarShow = "SetTopBarShow",
  GetTopBarOverlay = "GetTopBarOverlay",
  SetTopBarOverlay = "SetTopBarOverlay",
  GetTopBarAlpha = "GetTopBarAlpha",
  SetTopBarAlpha = "SetTopBarAlpha",
  GetTopBarTitle = "GetTopBarTitle",
  SetTopBarTitle = "SetTopBarTitle",
  HasTopBarTitle = "HasTopBarTitle",
  GetTopBarHeight = "GetTopBarHeight",
  GetTopBarActions = "GetTopBarActions",
  SetTopBarActions = "SetTopBarActions",
  GetTopBarBackgroundColor = "GetTopBarBackgroundColor",
  SetTopBarBackgroundColor = "SetTopBarBackgroundColor",
  GetTopBarForegroundColor = "GetTopBarForegroundColor",
  SetTopBarForegroundColor = "SetTopBarForegroundColor",
  // Bottom bar
  GetBottomBarEnabled = "GetBottomBarEnabled",
  SetBottomBarEnabled = "SetBottomBarEnabled",
  GetBottomBarAlpha = "GetBottomBarAlpha",
  SetBottomBarAlpha = "SetBottomBarAlpha",
  GetBottomBarHeight = "GetBottomBarHeight",
  SetBottomBarHeight = "SetBottomBarHeight",
  GetBottomBarActions = "GetBottomBarActions",
  SetBottomBarActions = "SetBottomBarActions",
  GetBottomBarBackgroundColor = "GetBottomBarBackgroundColor",
  SetBottomBarBackgroundColor = "SetBottomBarBackgroundColor",
  GetBottomBarForegroundColor = "GetBottomBarForegroundColor",
  SetBottomBarForegroundColor = "SetBottomBarForegroundColor",
  // Dialog
  OpenDialogAlert = "OpenDialogAlert",
  OpenDialogPrompt = "OpenDialogPrompt",
  OpenDialogConfirm = "OpenDialogConfirm",
  OpenDialogWarning = "OpenDialogWarning",
}
