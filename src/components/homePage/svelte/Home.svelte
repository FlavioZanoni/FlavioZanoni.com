<script lang="ts">
  import { desktopStore } from "@lib/store"
  import {
    openApp,
    saveCurrentDesktopStore,
  } from "@lib/store/desktopStoreUtils"
  import type { HomeGridItem } from "@lib/store/types"
  import { onDestroy, onMount } from "svelte"
  import ContextMenu from "./ContextMenu.svelte"

  let showContextMenu = false
  let contextMenuX = 0
  let contextMenuY = 0

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

  const handleContextMenu = (e: MouseEvent, cell: HomeGridItem) => {
    e.preventDefault()
    if (cell.type !== "empty") return

    showContextMenu = true
    contextMenuX = e.clientX
    contextMenuY = e.clientY

    console.log("context menu")
  }

  function handleBeforeUnload(e) {
    saveCurrentDesktopStore($desktopStore)
    e.preventDefault()
  }

  let homeGrid: HTMLElement | null = null
  onMount(() => {
    let store
    try {
      let storeLocal = localStorage.getItem("FZOSDesktopStore")
      if (storeLocal) {
        store = JSON.parse(storeLocal)
      }
    } catch (e) {
      console.error("Error getting store from local storage", e)
    }

    if (store) {
      desktopStore.set(store)
    }

    window.addEventListener("click", () => {
      showContextMenu = false
    })

    // handle background
    homeGrid = document.getElementById("home-grid")
    window.addEventListener("beforeunload", handleBeforeUnload)
  })

  $: {
    if (homeGrid) {
      if ($desktopStore.background.base64) {
        homeGrid.style.backgroundImage = `url(${$desktopStore.background.base64})`
      } else if ($desktopStore.background.fileName) {
        homeGrid.style.backgroundImage = `url(/backgrounds/${$desktopStore.background.fileName})`
      } else if ($desktopStore.background.color) {
        homeGrid.style.backgroundColor = $desktopStore.background.color
        homeGrid.style.backgroundImage = null
      }
    }
  }

  onDestroy(() => {
    window.removeEventListener("click", () => {
      showContextMenu = false
    })
  })
</script>

<div
  id="home-grid"
  class="grid bg-cover"
  style={`grid-template-columns: repeat(${gridColumns}, 1fr);
          grid-template-rows: repeat(${gridRows}, 1fr);`}
>
  {#each grid as cell}
    <div
      role={cell.type !== "empty" ? "button" : "cell"}
      class={`flex gap-2 items-center justify-center p-2 select-none`}
      style={`
          width: ${cellWidth}px;
          height: ${cellHeight}px;
          `}
      draggable={cell.type !== "empty"}
      on:dragstart={(e) => {
        e.dataTransfer.setData("text/plain", JSON.stringify(cell))
      }}
      on:drop={(e) => onDrop(e, cell)}
      on:dragover={(e) => {
        e.preventDefault()
      }}
      on:dblclick={() => {
        if (cell.type === "empty") return
        openApp(cell.id, "desktop")
      }}
      on:contextmenu={(e) => handleContextMenu(e, cell)}
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

  {#if showContextMenu}
    <ContextMenu x={contextMenuX} y={contextMenuY} />
  {/if}
</div>
