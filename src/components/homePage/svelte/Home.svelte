<script lang="ts">
  import { osStore } from "@lib/store"
  import type { DirectoryBlock, HomeGridItem, OSStore } from "@lib/store/types"
  import { openApp } from "@lib/utils/enviromentUtils"
  import { getItemByINode, mv } from "@lib/utils/fileSystemUtils"
  import { saveCurrentOSStore } from "@lib/utils/storeUtils"
  import { onDestroy, onMount } from "svelte"
  import ContextMenu from "./contextMenu/ContextMenu.svelte"
  import HomeAppContext from "./contextMenu/homeAppContext.svelte"
  import HomeContext from "./contextMenu/homeContext.svelte"

  let isEmpty = false
  let showContextMenu = false
  let contextMenuX = 0
  let contextMenuY = 0
  let contextINode: string | null = null
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
        name: null,
      }
    }
  )

  let grid = [] as HomeGridItem[]
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
  }

  // watch changes in the fileSystem to update UI
  // if there is extra on filesystem, must be added, if extra on homegrid it must be removed
  $: {
    const desktopApps = $osStore.fileSystem.iNodes["2"] // desktop iNode
      .blocks as DirectoryBlock[]
    const screenApps = $osStore.enviroment.homeGrid.items
    let homeGrid = $osStore.enviroment.homeGrid

    const removeItems = (diff: HomeGridItem[]) => {
      homeGrid.items = homeGrid.items.filter((item) => {
        return !diff.some((app) => app.iNode === item.iNode)
      })

      grid = grid.map((item) => {
        // if this is giving more than 1 app, then you are just to move one copy of it
        const appToRemove = diff.filter((app) => app.iNode === item.iNode)[0]

        if (appToRemove) {
          return {
            pos: appToRemove.pos,
            iNode: null,
            type: "empty",
          }
        }
        return item
      })
    }

    const addItems = (diff: DirectoryBlock[]) => {
      diff.forEach((app) => {
        const desktopBlocks = $osStore.fileSystem.iNodes[2]
          .blocks as DirectoryBlock[]
        const appInDesktop = desktopBlocks.find(
          (block) => block.iNode === app.iNode
        )

        const emptyCell = grid.find((cell) => !cell.iNode)
        if (emptyCell) {
          homeGrid.items.push({
            iNode: app.iNode,
            pos: emptyCell.pos,
            name: appInDesktop.name,
            type: "location" in app ? "file" : "directory",
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

    if (desktopApps.length >= screenApps.length) {
      const diff = desktopApps.filter(
        (app) => !screenApps.some((screenApp) => screenApp.iNode === app.iNode)
      )
      addItems(diff)
    } else {
      const diff = screenApps.filter(
        (app) =>
          !desktopApps.some((desktopApp) => desktopApp.iNode === app.iNode)
      )
      removeItems(diff)
    }
  }

  const onDrop = (e: DragEvent, current: HomeGridItem) => {
    e.preventDefault()
    const data = JSON.parse(
      e.dataTransfer.getData("text/plain")
    ) as HomeGridItem

    osStore.update((state) => {
      const homeGrid = state.enviroment.homeGrid
      const { iNodes } = state.fileSystem

      const itemToUpdate = homeGrid.items.find(
        (item) => item.iNode === data.iNode
      )
      const itemToMove = homeGrid.items.find(
        (item) => item.iNode === current.iNode
      )

      if (iNodes[itemToMove?.iNode]?.type === "directory") {
        const toUpdate = iNodes[itemToUpdate.iNode].blocks[0]
        mv(`./${toUpdate.name}`, `./${itemToMove.name}`, "root/desktop")

        return state
      }

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
    if (cell.iNode) {
      contextINode = cell.iNode
      isEmpty = false
    } else {
      contextINode = null
      isEmpty = true
    }

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
    {@const currentItem = getItemByINode(cell.iNode)}
    {@const isFile = currentItem && "icon" in currentItem}
    <div
      role={cell.iNode ? "button" : "cell"}
      class="{`flex gap-2 items-center justify-center p-2 select-none`}s"
      style={`width: ${cellWidth}px; height: ${cellHeight}px;`}
      draggable={!!cell.iNode}
      on:dblclick={() => {
        if (!cell.iNode) return
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
      <div class="flex flex-col items-center justify-center">
        {#if cell.iNode}
          <img
            draggable="false"
            src={`/icons/${isFile ? currentItem.icon : "directory.png"}`}
            alt={cell.name}
          />
          <p
            style={`
              width: ${cellWidth - 4}px;
              text-align: center;
            `}
            class="truncate text-sm"
          >
            {cell.name || "‎"}
          </p>
        {/if}
      </div>
    </div>
  {/each}

  {#if showContextMenu}
    <ContextMenu x={contextMenuX} y={contextMenuY}>
      {#if isEmpty}
        <HomeContext />
      {:else}
        <HomeAppContext iNode={contextINode} />
      {/if}
    </ContextMenu>
  {/if}
</div>
