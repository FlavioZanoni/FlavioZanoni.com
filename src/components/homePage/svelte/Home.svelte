<script lang="ts">
  import { osStore } from "@lib/store"
  import type { DirectoryBlock, HomeGridItem, OSStore } from "@lib/store/types"
  import { openApp } from "@lib/utils/enviromentUtils"
  import {
    getItemsInArrayByINode,
    type GetItemsInArrayByINode,
  } from "@lib/utils/fileSystemUtils"
  import { saveCurrentOSStore } from "@lib/utils/storeUtils"
  import { onDestroy, onMount } from "svelte"
  import ContextMenu from "./ContextMenu.svelte"

  let showContextMenu = false
  let contextMenuX = 0
  let contextMenuY = 0

  const taskbarRect = document
    .getElementById("taskbar")
    ?.getBoundingClientRect()

  let gridColumns = 16
  let gridRows = 9
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
        iNode: null,
        pos: { x, y },
        type: "empty",
      }
    }
  )

  let grid = [] as HomeGridItem[]
  let itemsByINode: GetItemsInArrayByINode
  $: {
    // populate grid with state
    grid = [
      ...gridItems.map((cell) => {
        const cellState = $osStore.enviroment.homeGrid.items.find(
          (s) => s.pos.x === cell.pos.x && s.pos.y === cell.pos.y
        )

        return cellState ? cellState : cell
      }),
    ] as HomeGridItem[]

    itemsByINode = getItemsInArrayByINode(grid.filter((cell) => cell.iNode))
  }

  // watch changes in the file system to update UI
  $: {
    const desktopApps = $osStore.fileSystem.iNodes["2"]
      .blocks as DirectoryBlock[]
    const screenApps = $osStore.enviroment.homeGrid.items

    const divergence = desktopApps.filter(
      (app) => !screenApps.find((screenApp) => screenApp.iNode === app.iNode)
    )
    const homeGrid = $osStore.enviroment.homeGrid
    if (divergence.length > 0) {
      divergence.forEach((app) => {
        const emptyCell = grid.find((cell) => cell.iNode)
        if (emptyCell) {
          homeGrid.items.push({
            iNode: app.iNode,
            pos: emptyCell.pos,
          })
          grid = grid.map((item) => {
            if (item.pos === emptyCell.pos) {
              return {
                iNode: app.iNode,
                pos: emptyCell.pos,
                type: "location" in app ? "file" : "directory",
              }
            }
            return item
          })
        }
      })
    }
  }

  const onDrop = (e: DragEvent, current: HomeGridItem) => {
    e.preventDefault()
    const data = JSON.parse(
      e.dataTransfer.getData("text/plain")
    ) as HomeGridItem

    osStore.update((state) => {
      const homeGrid = state.enviroment.homeGrid

      const itemToUpdate = homeGrid.items.find(
        (item) => item.iNode === data.iNode
      )
      const itemToMove = homeGrid.items.find(
        (item) => item.iNode === current.iNode
      )

      if (itemToUpdate) {
        itemToUpdate.pos = current.pos
      }
      if (itemToMove) {
        itemToMove.pos = data.pos
      }

      homeGrid.items = homeGrid.items.map((item) => {
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
    if (!cell.iNode) return

    showContextMenu = true
    contextMenuX = e.clientX
    contextMenuY = e.clientY
  }

  function handleBeforeUnload(e: MouseEvent) {
    saveCurrentOSStore($osStore)
    e.preventDefault()
  }

  let homeGrid: HTMLElement | null = null
  onMount(() => {
    let store: OSStore | null = null
    try {
      let storeLocal = localStorage.getItem("FZOSStore")
      if (storeLocal) {
        store = JSON.parse(storeLocal)
      }
    } catch (e) {
      console.error("Error getting store from local storage", e)
    }

    if (store) {
      osStore.set(store)
    }

    window.addEventListener("click", () => {
      showContextMenu = false
    })

    homeGrid = document.getElementById("home-grid")
    //window.addEventListener("beforeunload", handleBeforeUnload)
  })

  $: {
    if (homeGrid) {
      const background = $osStore.enviroment.background
      if (background.base64) {
        homeGrid.style.backgroundImage = `url(${background.base64})`
      } else if (background.fileName) {
        homeGrid.style.backgroundImage = `url(backgrounds/${background.fileName})`
      } else if (background.color) {
        homeGrid.style.backgroundColor = background.color
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
    {@const currentItem = itemsByINode[cell.iNode]}
    {@const isFile = currentItem && "icon" in currentItem}
    <div
      role={cell.iNode ? "button" : "cell"}
      class={`flex gap-2 items-center justify-center p-2 select-none`}
      style={`width: ${cellWidth}px; height: ${cellHeight}px;`}
      draggable={!!cell.iNode}
      on:dblclick={() => {
        if (cell.iNode) return
        openApp(cell.iNode)
      }}
      on:dragstart={(e) => {
        e.dataTransfer.setData("text/plain", JSON.stringify(cell))
      }}
      on:dragover={(e) => {
        e.preventDefault()
      }}
      on:drop={(e) => onDrop(e, cell)}
      on:contextmenu={(e) => handleContextMenu(e, cell)}
    >
      <div class="flex flex-col items-center justify-center w-full h-full">
        {#if cell.iNode}
          {@const name = isFile
            ? currentItem.name + (currentItem.ext ? `.${currentItem.ext}` : "")
            : currentItem.name}
          <img
            class="w-16 h-16"
            draggable="false"
            src={`/icons/${isFile ? currentItem.icon : "directory.png"}`}
            alt={currentItem.name}
          />
          <p class="truncate text-sm">
            {name || "‎"}
          </p>
        {/if}
      </div>
    </div>
  {/each}

  {#if showContextMenu}
    <ContextMenu x={contextMenuX} y={contextMenuY} />
  {/if}
</div>
