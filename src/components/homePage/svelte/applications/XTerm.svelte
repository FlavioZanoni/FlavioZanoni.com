<script lang="ts">
  import { Term } from "@lib/terminal"
  import { Terminal } from "@xterm/xterm"
  import { onDestroy, onMount } from "svelte"

  export let uuid: string
  export let currentDir: string | undefined = "root"

  let term = new Terminal()
  const termBackend = new Term(term)

  let observer = new ResizeObserver((_) => {
    termBackend.fit()
  })

  onMount(() => {
    termBackend.setup(currentDir, uuid)
    termBackend.loadFitAddon()
    termBackend.fit()

    observer.observe(document.getElementById(`window-${uuid}`))
  })

  onDestroy(() => {
    observer.disconnect()
  })
</script>

<div class="w-full h-full bg-black pt-1" id={`terminal-${uuid}`}></div>
