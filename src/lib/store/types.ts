export type DesktopStore = {
  homeGrid: {
    items: HomeGridItem[]
  }
  taskbar: {
    items: DefaultItem[]
  }
  menu: {
    items: DefaultItem[]
  }
  openApps: OpenApp[]
  background: {
    fileName?: string
    base64?: string
    color?: string
    userImages: {
      fileName: string
      base64: string
    }[]
  }
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

export type ItemType = "folder" | "file" | "app" | "empty"

export interface DefaultItem {
  id: string
  icon: string
  title: string
  type: ItemType
  link?: string
  appName?: string
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
