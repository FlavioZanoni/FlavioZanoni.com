<script lang="ts">
  import { state } from "@homePage/svelte/store"
  import { actionHandler } from "@lib/actionHandler"
  import type { HomeGridItem } from "@lib/state/types"

  const taskbarRect = document
    .getElementById("taskbar")
    ?.getBoundingClientRect()

  const gridColumns = 16
  const gridRows = 9
  const cellWidth = window.innerWidth / gridColumns
  const cellHeight =
    (window.innerHeight - (taskbarRect.height || 40)) / gridRows

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

  let grid = [] as HomeGridItem[]
  $: {
    // populate grid with state
    grid = [
      ...gridItems.map((cell) => {
        const cellState = $state.homeGrid.items.find(
          (s) => s.pos.x === cell.pos.x && s.pos.y === cell.pos.y
        )

        return cellState ? cellState : cell
      }),
    ] as HomeGridItem[]
  }

  const onDrop = (e: DragEvent, current: HomeGridItem) => {
    e.preventDefault()
    const data = JSON.parse(e.dataTransfer.getData("text/plain"))

    state.update((prev) => {
      const itemToUpdate = prev.homeGrid.items.find(
        (i) => i.pos.x === data.pos.x && i.pos.y === data.pos.y
      )

      const itemToMove = prev.homeGrid.items.find(
        (i) => i.pos.x === current.pos.x && i.pos.y === current.pos.y
      )

      if (itemToUpdate) {
        itemToUpdate.pos = current.pos
      }

      if (itemToMove) {
        itemToMove.pos = data.pos
      }

      const prevCopy = { ...prev }

      prevCopy.homeGrid.items = prev.homeGrid.items.map((item) => {
        if (item === itemToUpdate) {
          return itemToUpdate
        }
        if (itemToMove && item === itemToMove) {
          return itemToMove
        }
        return item
      })

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
  {#each grid as cell}
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
      on:dblclick={() => {
        if (cell.action) {
          actionHandler(cell.action)
        }
      }}
    >
      <div class="flex flex-col items-center justify-center">
        {#if cell.icon}
          <img
            class="w-[80%]"
            draggable="false"
            src={`/icons/${cell.icon}`}
            alt={cell.title}
          />
        {/if}

        <p class="truncate">{cell.title || "‎"}</p>
      </div>
    </div>
  {/each}
</div>
