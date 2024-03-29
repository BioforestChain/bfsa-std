export enum NativeHandle {
  OpenQrScanner = "OpenQrScanner", // 二维码
  BarcodeScanner = "BarcodeScanner", // 条形码
  ToggleTorch = "ToggleTorch", // 打开关闭手电筒
  GetTorchState = "GetTorchState", // 获取手电筒状态
  ServiceWorkerReady = "ServiceWorkerReady", // 通知后端，serviceWorker已经初始化好了
  ReadClipboardContent = "ReadClipboardContent", // 读取剪切板
  WriteClipboardContent = "WriteClipboardContent", // 写入剪切板
  ExitApp = "ExitApp", // 退出app
  ListenBackButton = "ListenBackButton", // 监听后退事件 （android only）

  CheckCameraPermission = "CheckCameraPermission", // 检查是否有摄像头权限，如果没有或者被拒绝，那么会强制请求打开权限（设置）
  ApplyPermissions = "ApplyPermissions", // 申请摄像头权限

  GetNetworkStatus = "GetNetworkStatus", // 获取网络状态
  HapticsImpact = "HapticsImpact", // 触碰物体
  HapticsNotification = "HapticsNotification", // 振动通知
  HapticsVibrate = "HapticsVibrate", // 反馈振动
  HapticsVibratePreset = "HapticsVibratePreset", // 反馈振动预设

  ShowToast = "ShowToast", // 提示
  SystemShare = "SystemShare", // 系统分享

  TakeCameraPhoto = "TakeCameraPhoto", // 拍摄照片
  PickCameraPhoto = "PickCameraPhoto", // 从图库获取单张照片
  PickCameraPhotos = "PickCameraPhotos", // 从图库获取多张照片

  FileOpener = "FileOpener", // 打开文件
}

export enum NativeUI {
  // Navigation
  SetNavigationBarVisible = "SetNavigationBarVisible",
  GetNavigationBarVisible = "GetNavigationBarVisible",
  SetNavigationBarColor = "SetNavigationBarColor",
  SetNavigationBarOverlay = "SetNavigationBarOverlay",
  GetNavigationBarOverlay = "GetNavigationBarOverlay",
  // Status Bar
  SetStatusBarBackgroundColor = "SetStatusBarBackgroundColor",
  GetStatusBarBackgroundColor = "GetStatusBarBackgroundColor",
  GetStatusBarIsDark = "GetStatusBarIsDark",
  GetStatusBarVisible = "GetStatusBarVisible",
  GetStatusBarOverlay = "GetStatusBarOverlay",
  SetStatusBarOverlay = "SetStatusBarOverlay",
  SetStatusBarVisible = "SetStatusBarVisible",
  SetStatusBarStyle = "SetStatusBarStyle",
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
  GetBottomBarOverlay = "GetBottomBarOverlay",
  SetBottomBarOverlay = "SetBottomBarOverlay",
  // GetBottomBarAlpha = "GetBottomBarAlpha",
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
