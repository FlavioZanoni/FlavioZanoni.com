import jsonState from "./state.json"
import type { State } from "./types"

export const getState = () => {
  return JSON.parse(JSON.stringify(jsonState)) as State
}

export const saveCurrentState = (state: State) => {
  localStorage.setItem("state", JSON.stringify(state))
}

export const loadState = (): State => {
  const state = localStorage.getItem("state")
  if (state) {
    return JSON.parse(state) as State
  }
  return getState()
}

export const resetState = () => {
  localStorage.removeItem("state")
}

export const exportState = (state: State) => {
  const data = JSON.stringify(state)
  const blob = new Blob([data], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "state.json"
  a.click()
  URL.revokeObjectURL(url)
}
