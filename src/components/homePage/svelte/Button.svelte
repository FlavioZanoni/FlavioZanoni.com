<script lang="ts">
  import { createEventDispatcher } from "svelte"

  export let variant: "primary" | "tertiary" | "danger" | "secondary" =
    "primary"
  export let type: "button" | "submit" | "reset" = "button"
  export let customCss: string = ""
  export let id: string = crypto.randomUUID()
  export let disabled: boolean = false

  const defaultStyle =
    "flex flex-row items-center justify-center gap-2 text-center px-2"
  let style: string

  switch (variant) {
    case "primary":
      style = "hover:bg-slate-300"
      break
    case "secondary":
      style =
        "bg-slate-300 border-2 border-b-slate-900 border-l-slate-900 border-t-slate-200 border-r-slate-200 text-black px-2 py-1 hover:bg-slate-200"
      break
    case "danger":
      style = "bg-red-400 text-white"
      break
    case "tertiary":
      style =
        "border-2 border-b-slate-900 border-l-slate-900 border-t-slate-200 border-r-slate-200 text-black px-2"
      break
    default:
      style = "bg-primary-50"
  }

  const dispatch = createEventDispatcher()
  function handleClick() {
    dispatch("click")
  }
</script>

<button
  {type}
  {id}
  {disabled}
  class="{defaultStyle} {style} {customCss}"
  on:click={handleClick}
>
  <slot />
</button>
