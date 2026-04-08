interface Window {
  Telegram?: {
    WebApp: {
      expand: () => void
      disableVerticalSwipes?: () => void
      viewportStableHeight?: number
    }
  }
}
