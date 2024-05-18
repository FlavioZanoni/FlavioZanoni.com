<script lang="ts">
  import { osStore } from "@lib/store"
  import type { DefaultItem, OpenApp, Position, Size } from "@lib/store/types"
  import {
    closeApp,
    focusApp,
    maximizeApp,
    minimizeApp,
  } from "@lib/utils/enviromentUtils"
  import { getItemByINode } from "@lib/utils/fileSystemUtils"
  import WindowContent from "./WindowContent.svelte"

  export let iNode: string
  export let uuid: string
  export let isFocused: boolean
  export let isMaximized: boolean
  export let lastPos: Position | undefined = undefined
  export let lastSize: Size | undefined = undefined

  // as the directoryBlock does not contain the info needed, we get it from the "openApps" variable and its type will be "OpenApp"
  // doing this instead of getting both from the oppenApps because oppenApps does not contain the content, icon, and link...
  function isDirectory(item: DefaultItem | OpenApp): item is OpenApp {
    return "isMinimized" in item
  }

  let item: DefaultItem | OpenApp = getItemByINode(iNode)
  if (!item) {
    item = $osStore.enviroment.openApps.find((item) => (item.iNode = iNode))
  }

  let defaultWidth = 600
  let defaultHeight = 450
  let minWidth = 450
  let minHeight = 300
  const defaultX = window.innerWidth / 2 - defaultWidth / 2
  const defaultY = window.innerHeight / 2 - defaultHeight / 2

  let previousWidth = defaultWidth
  let previousHeight = defaultHeight
  let previousX = defaultX
  let previousY = defaultY

  let width = defaultWidth
  let height = defaultHeight
  let startWidth = width
  let startHeight = height

  let x = window.innerWidth / 2 - width / 2
  let y = window.innerHeight / 2 - height / 2
  let dx = 0
  let dy = 0

  let startX: number, startY: number, startLeft: number, startTop: number
  let startResizeX: number, startResizeY: number

  $: {
    if (isMaximized) {
      x = 0
      y = 0
      width = window.innerWidth
      height =
        window.innerHeight - document.getElementById("taskbar").clientHeight
    } else {
      width = lastSize?.width || defaultWidth
      height = lastSize?.height || defaultHeight
      x = lastPos?.x || defaultX
      y = lastPos?.y || defaultY
    }
  }

  function handleMousedown(event: MouseEvent) {
    startX = event.clientX
    startY = event.clientY
    startLeft = x
    startTop = y

    window.addEventListener("mousemove", handleMousemove)
    window.addEventListener("mouseup", handleMouseup)
  }

  function handleMousemove(event: MouseEvent) {
    if (event.clientX >= window.innerWidth || event.clientX <= 0) {
      return
    }
    if (event.clientY >= window.innerHeight || event.clientY <= 0) {
      return
    }

    const dx = event.clientX - startX
    const dy = event.clientY - startY

    x = startLeft + dx
    y = startTop + dy
  }

  function handleMouseup() {
    // Update the last position and size of the app
    osStore.update((state) => {
      let openApps = state.enviroment.openApps

      const thisApp = openApps.find((app) => app.uuid === uuid)
      thisApp.lastSize = { width, height }
      thisApp.lastPos = { x, y }

      openApps = openApps.map((app) => {
        if (app.uuid === uuid) {
          return thisApp
        }

        return app
      })

      return state
    })

    window.removeEventListener("mousemove", handleMousemove)
    window.removeEventListener("mouseup", handleMouseup)
  }

  function handleMousedownResize(event: MouseEvent) {
    event.stopPropagation()
    startResizeX = event.clientX
    startResizeY = event.clientY
    startWidth = width
    startHeight = height

    window.addEventListener("mousemove", handleMousemoveResize)
    window.addEventListener("mouseup", handleMouseupResize)
  }

  function handleMousemoveResize(event: MouseEvent) {
    dx = event.clientX - startResizeX
    dy = event.clientY - startResizeY

    let newHeight = startHeight + dy
    let newWidth = startWidth + dx

    if (newHeight < minHeight) {
      height = minHeight
    } else {
      height = startHeight + dy
    }

    if (newWidth < minWidth) {
      width = minWidth
    } else {
      width = startWidth + dx
    }
  }

  function handleMouseupResize() {
    osStore.update((state) => {
      let openApps = state.enviroment.openApps
      const thisApp = openApps.find((app) => app.uuid === uuid)
      thisApp.lastPos = { x, y }
      thisApp.lastSize = { width: startWidth + dx, height: startHeight + dy }

      openApps = openApps.map((app) => {
        if (app.uuid === uuid) {
          return thisApp
        }

        return app
      })

      return state
    })

    window.removeEventListener("mousemove", handleMousemoveResize)
    window.removeEventListener("mouseup", handleMouseupResize)
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<section
  id={`window-${uuid}`}
  class="absolute shadow-xl"
  style="left: {x}px; top: {y}px; width: {width}px; height: {height}px; z-index: {isFocused
    ? 50
    : 10};"
  on:click={() => {
    if (!isFocused) focusApp(uuid)
  }}
>
  <div
    class={`flex flex-col border-2 border-slate-900 min-h-[${minHeight}px] min-w-[${minWidth}px]`}
    style="width: {width}px; height: {height}px;"
  >
    <div
      role="toolbar"
      tabindex="0"
      class="w-full h-5 flex justify-between items-center bg-slate-400 gap-4"
      on:mousedown={handleMousedown}
    >
      <div class="flex gap-1 items-center px-1">
        <img
          src={`icons/${!isDirectory(item) ? item.icon : "directory.png"}`}
          alt={item.name}
          class="w-4 h-4 border border-slate-500 p-[1px]"
        />
        <h1 class="select-none">
          {isDirectory(item) ? "File explorer" : item.name}
        </h1>
      </div>
      <div class="flex gap-2 items-center px-1 select-none">
        <button
          on:click={() => {
            minimizeApp(uuid, { x, y }, { width, height })
          }}
        >
          -
        </button>
        <button
          on:click={() => {
            if (!isMaximized) {
              previousWidth = width
              previousHeight = height
              previousX = x
              previousY = y
            } // when minimizing, need the previous size and position to return to that state

            maximizeApp(
              uuid,
              { x: previousX || x, y: previousY || y },
              {
                width: previousWidth || width,
                height: previousHeight || height,
              }
            )
          }}
          class={!isMaximized ? "mb-1" : "mb-[1px]"}
        >
          {isMaximized ? "▫" : "□"}
        </button>
        <button
          on:click={() => {
            closeApp(uuid)
          }}
        >
          X
        </button>
      </div>
    </div>

    <div class="w-full bg-white" style="height: calc({height}px - 40px);">
      <WindowContent
        {uuid}
        {iNode}
        isDirectory={isDirectory(item)}
        appName={isDirectory(item) ? item.name : item.appName || item.name}
        link={!isDirectory(item) && item.link}
        title={item.name}
      />
    </div>

    <div class="w-full h-5 flex justify-end bg-slate-400">
      <div
        role="toolbar"
        tabindex="0"
        class="w-10 h-full flex justify-end items-end hover:cursor-nw-resize text-gray-500"
        on:mousedown={handleMousedownResize}
        on:mouseup={handleMouseupResize}
      >
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          width="16"
          height="16"
          viewBox="0 0 256 256"
          enable-background="new 0 0 256 256"
        >
          <g
            ><g
              ><path
                fill="#6b7280"
                d="M195.2,127.5c0,14,11.4,25.4,25.4,25.4s25.4-11.4,25.4-25.4c0-14-11.4-25.4-25.4-25.4S195.2,113.5,195.2,127.5z"
              /><path
                fill="#6b7280"
                d="M195.2,210c0,14,11.4,25.4,25.4,25.4S246,224.1,246,210l0,0c0-14-11.4-25.4-25.4-25.4S195.2,196,195.2,210z"
              /><path
                fill="#6b7280"
                d="M104.2,210c0,14,11.4,25.4,25.4,25.4c14,0,25.4-11.4,25.4-25.4c0-14-11.4-25.4-25.4-25.4C115.5,184.6,104.2,196,104.2,210L104.2,210z"
              /><path
                fill="#6b7280"
                d="M104.2,127.5c0,14,11.4,25.4,25.4,25.4c14,0,25.4-11.4,25.4-25.4c0-14-11.4-25.4-25.4-25.4C115.5,102.1,104.2,113.5,104.2,127.5L104.2,127.5z"
              /><path
                fill="#6b7280"
                d="M195.2,46c0,14,11.4,25.4,25.4,25.4S246,60,246,46s-11.4-25.4-25.4-25.4S195.2,32,195.2,46z"
              /><path
                fill="#6b7280"
                d="M10,210c0,14,11.4,25.4,25.4,25.4s25.4-11.4,25.4-25.4c0-14-11.4-25.4-25.4-25.4S10,196,10,210L10,210z"
              /></g
            ></g
          >
        </svg>
      </div>
    </div>
  </div>
</section>
