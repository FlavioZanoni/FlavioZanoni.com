export type State = {
  homeGrid: {
    items: HomeGridItem[]
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
