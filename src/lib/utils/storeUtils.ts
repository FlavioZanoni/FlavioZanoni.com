import { osStore } from "../store"
import type { OSStore } from "../store/types"

export const exportCurrentOSStore = () => {
  const data = JSON.stringify(osStore)
  const blob = new Blob([data], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "FZOSStore.json"
  a.click()
  URL.revokeObjectURL(url)
}

export const saveCurrentOSStore = (state: OSStore) => {
  localStorage.setItem("FZOSStore", JSON.stringify(state))
}
