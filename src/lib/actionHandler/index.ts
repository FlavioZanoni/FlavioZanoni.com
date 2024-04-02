export function actionHandler(action: string) {
  switch (action) {
    case "action1":
      return "action1"
    case "action2":
      return "action2"
    default:
      return "default"
  }
}
