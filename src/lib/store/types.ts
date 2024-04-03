export type DesktopStore = {
  homeGrid: {
    items: HomeGridItem[]
  }
  taskbar: {
    items: defaultItem[]
  }
  menu: {
    items: defaultItem[]
  }
  openApps: OpenApp[]
}

export interface HomeGridItem extends defaultItem {
  pos: {
    x: number
    y: number
  }
}

export interface defaultItem {
  id: string
  icon: string
  title: string
  type: "folder" | "app" | "empty"
  link: string
  isOpen: boolean
}

export interface OpenApp extends defaultItem {
  isMaximized: boolean
  isMinimized: boolean
  isFocused: boolean
}
