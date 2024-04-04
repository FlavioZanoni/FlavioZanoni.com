export type DesktopStore = {
  homeGrid: {
    items: HomeGridItem[]
  }
  taskbar: {
    items: DefaultItem[]
    openApps: OpenApp[]
  }
  menu: {
    items: DefaultItem[]
  }
  openApps: OpenApp[]
}

export type Position = {
  x: number
  y: number
}

export type Size = {
  width: number
  height: number
}

export interface HomeGridItem extends DefaultItem {
  pos: Position
}

export interface DefaultItem {
  id: string
  icon: string
  title: string
  type: "folder" | "app" | "empty"
  link: string
  isOpen: boolean
}

export interface OpenApp extends DefaultItem {
  uuid: string
  isMaximized: boolean
  isMinimized: boolean
  isFocused: boolean
  lastPos?: Position
  lastSize?: Size
}
