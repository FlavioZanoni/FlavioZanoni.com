export type State = {
  homeGrid: {
    items: HomeGridItem[]
  }
  taskbar: {
    items: taskbarItem[]
  }
}

export type HomeGridItem = {
  pos: {
    x: number
    y: number
  }
  icon: string
  title: string
  action: string
}

export type taskbarItem = {
  icon: string
  title: string
  action: string
}
