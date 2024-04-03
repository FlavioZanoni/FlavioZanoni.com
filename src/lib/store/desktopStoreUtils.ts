import { desktopStore } from "."

export const exportCurrentDesktopStore = () => {
  const data = JSON.stringify(desktopStore)
  const blob = new Blob([data], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "desktopStore.json"
  a.click()
  URL.revokeObjectURL(url)
}

export const saveCurrentDesktopStore = () => {
  localStorage.setItem("state", JSON.stringify(desktopStore))
}
