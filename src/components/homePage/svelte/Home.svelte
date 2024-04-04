<script lang="ts">
  import { desktopStore } from "@lib/store"
  import { openApp } from "@lib/store/desktopStoreUtils"
  import type { HomeGridItem } from "@lib/store/types"

  const taskbarRect = document
    .getElementById("taskbar")
    ?.getBoundingClientRect()

  const gridColumns = 16
  const gridRows = 9
  const cellWidth = window.innerWidth / gridColumns
  const cellHeight =
    (window.innerHeight - (taskbarRect?.height || 40)) / gridRows

  // populate grid items
  let gridItems: HomeGridItem[] = Array.from(
    { length: gridColumns * gridRows },
    (_, i) => {
      const x = i % gridColumns
      const y = Math.floor(i / gridColumns)

      return {
        id: "-1",
        pos: { x, y },
        icon: "",
        title: "",
        link: "",
        type: "empty",
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
      }
    }
  )

  let grid = [] as HomeGridItem[]
  $: {
    // populate grid with state
    grid = [
      ...gridItems.map((cell) => {
        const cellState = $desktopStore.homeGrid.items.find(
          (s) => s.pos.x === cell.pos.x && s.pos.y === cell.pos.y
        )

        return cellState ? cellState : cell
      }),
    ] as HomeGridItem[]
  }

  const onDrop = (e: DragEvent, current: HomeGridItem) => {
    e.preventDefault()
    const data = JSON.parse(e.dataTransfer.getData("text/plain"))

    desktopStore.update((state) => {
      const itemToUpdate = state.homeGrid.items.find(
        (item) => item.id === data.id
      )
      const itemToMove = state.homeGrid.items.find(
        (item) => item.id === current.id
      )

      if (itemToUpdate) {
        itemToUpdate.pos = current.pos
      }
      if (itemToMove) {
        itemToMove.pos = data.pos
      }

      state.homeGrid.items = state.homeGrid.items.map((item) => {
        if (item === itemToUpdate) {
          return itemToUpdate
        }
        if (itemToMove && item === itemToMove) {
          return itemToMove
        }
        return item
      })
      return state
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
        if (cell.title === "") return
        openApp(cell.id, "desktop")
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
