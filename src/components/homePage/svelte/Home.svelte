<script lang="ts">
  import { state } from "@homePage/svelte/store"
  import type { HomeGridItem } from "@lib/state/types"

  const gridColumns = 16
  const gridRows = 9
  const cellWidth = window.innerWidth / gridColumns
  const cellHeight = (window.innerHeight - 40) / gridRows

  // populate grid items
  let gridItems: HomeGridItem[] = Array.from(
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

  let grid = []
  $: {
    // populate grid with state
    grid = [
      ...gridItems.map((cell) => {
        const cellState = $state.homeGrid.items.find(
          (s) => s.pos.x === cell.pos.x && s.pos.y === cell.pos.y
        )

        return cellState ? cellState : cell
      }),
    ]
  }

  const onDrop = (e: DragEvent, current: HomeGridItem) => {
    e.preventDefault()
    const data = JSON.parse(e.dataTransfer.getData("text/plain"))

    state.update((prev) => {
      const itemToUpdate = prev.homeGrid.items.find(
        (i) => i.pos.x === data.pos.x && i.pos.y === data.pos.y
      )

      if (itemToUpdate) {
        itemToUpdate.pos = current.pos
      }

      const prevCopy = { ...prev }

      prevCopy.homeGrid.items = prev.homeGrid.items.map((item) =>
        item === itemToUpdate ? itemToUpdate : item
      )

      return prevCopy
    })
  }
</script>

<div
  class="grid"
  style={`grid-template-columns: repeat(${gridColumns}, 1fr);
        grid-template-rows: repeat(${gridRows}, 1fr);
        `}
>
  {#each grid as cell, index}
    <div
      role={cell.title !== "" ? "button" : "cell"}
      class={`flex gap-2 items-center justify-center p-2`}
      style={`
          width: ${cellWidth}px;
          height: ${cellHeight}px;
          `}
      draggable={cell.title !== ""}
      on:dragstart={(e) => {
        e.dataTransfer.setData("text/plain", JSON.stringify(cell))
      }}
      on:drop={(e) => onDrop(e, cell)}
      on:dragover={(e) => {
        e.preventDefault()
      }}
    >
      <div class="w-full h-full flex-col flex items-center justify-center">
        <img src={cell.icon} alt={cell.title} />
        <p>{cell.title}</p>
      </div>
    </div>
  {/each}
</div>
