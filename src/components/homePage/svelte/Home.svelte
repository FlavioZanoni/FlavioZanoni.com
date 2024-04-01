<script lang="ts">
  import { state } from "@homePage/svelte/store"
  import type { HomeGridItem } from "@lib/state/types"
  import { onMount } from "svelte"
  const gridColumns = 16
  const gridRows = 9

  const cellWidth = window.innerWidth / gridColumns
  const cellHeight = (window.innerHeight - 40) / gridRows

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

  // populate grid with state
  grid.forEach((cell, index) => {
    const cellState = $state.homeGrid.items.find(
      (s) => s.pos.x === cell.pos.x && s.pos.y === cell.pos.y
    )

    if (cellState) {
      grid[index] = cellState
    }
  })

  onMount(() => {
    console.log("mounted", $state)
  })
</script>

<div
  class="grid"
  style={`grid-template-columns: repeat(${gridColumns}, 1fr);
        grid-template-rows: repeat(${gridRows}, 1fr);
        `}
>
  {#each grid as cell}
    <div
      class={`flex flex-col gap-2`}
      style={`
          width: ${cellWidth}px;
          height: ${cellHeight}px;
          `}
    >
      <img src={cell.icon} alt={cell.title} />
      <p>{cell.title}</p>
      {cell.pos.x}
      {cell.pos.y}
    </div>
  {/each}
</div>
