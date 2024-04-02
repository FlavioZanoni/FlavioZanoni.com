export type State = {
  homeGrid: {
    items: HomeGridItem[]
  }
  taskbar: {
    items: defaultItem[]
  }
  menu: {
    items: defaultItem[]
  }
}

export interface HomeGridItem extends defaultItem {
  pos: {
    x: number
    y: number
  }
}

export interface defaultItem {
  icon: string
  title: string
  action: string
}
