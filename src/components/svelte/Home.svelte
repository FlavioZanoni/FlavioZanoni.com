<script lang="ts">
import type { HomeGridItem } from "@lib/state/types"
import { state } from "@svelte/store"
import { onMount } from "svelte"
const gridColumns = 16
const gridRows = 9

// create full grid
const grid: HomeGridItem[] = Array.from(
  { length: gridColumns * gridRows },
  (_, i) => {
    const x = i % gridColumns
    const y = Math.floor(i / gridColumns)

    return {
      pos: { x, y },
      icon: "",
      title: "",
      action: "",
    }
  }
)

grid.forEach((cell) => {
  const cellState = $state.homeGrid.items.find(
    (s) => s.pos.x === cell.pos.x && s.pos.y === cell.pos.y
  )

  if (cellState) {
    cell = { ...cellState }
  }
})

onMount(() => {
    console.log("mounted", $state)
})

</script>

<div class="grid w-full h-full"
    style={
        `grid-template-columns: repeat(${gridColumns}, 1fr);
        grid-template-rows: repeat(${gridRows}, 1fr);`
    }
>
    {#each grid as cell}
        <div class="flex flex-col gap-2">
            {cell.pos.x} {cell.pos.y}
            <img src={cell.icon} alt={cell.title} />
            <p>{cell.title}</p>
        </div>
    {/each}
</div>