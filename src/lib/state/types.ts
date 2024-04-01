export type State = {
  homeGrid: {
    items: HomeGridItem[]
  }
  menuBar: {
    items: MenuItem[]
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

export type MenuItem = {
  icon: string
  title: string
  action: string
}
