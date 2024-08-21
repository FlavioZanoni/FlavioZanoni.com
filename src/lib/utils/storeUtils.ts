import { osStore } from "../store"
import type { OSStore } from "../store/types"

export const exportCurrentOSStore = () => {
  osStore.update((store) => {
    const data = JSON.stringify(store)
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "FZOSStore.json"
    a.click()
    URL.revokeObjectURL(url)
    return store
  })
}

export const saveCurrentOSStore = (state: OSStore) => {
  localStorage.setItem("FZOSStore", JSON.stringify(state))
}

export const loadOSState = (state: OSStore) => {
  osStore.set(state)
}
