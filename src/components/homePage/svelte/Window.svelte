<script lang="ts">
  import { desktopStore } from "@lib/store"

  export let icon: string
  export let id: string
  export let isFocused: boolean
  export let isMaximized: boolean
  export let isMinimized: boolean
  export let isOpen: boolean
  export let link: string
  export let title: string
  export let type: "folder" | "app" | "empty"

  let defaultWidth = 250
  let defaultHeight = 150
  const defaultX = window.innerWidth / 2 - defaultWidth / 2
  const defaultY = window.innerHeight / 2 - defaultHeight / 2
  let resizeUnMaximize = false

  let width = defaultWidth
  let height = defaultHeight
  let startWidth = width
  let startHeight = height

  let x = window.innerWidth / 2 - width / 2
  let y = window.innerHeight / 2 - height / 2

  let startX: number, startY: number, startLeft: number, startTop: number
  let startDragX: number, startDragY: number

  $: {
    if (isMaximized) {
      x = 0
      y = 0
      width = window.innerWidth
      height =
        window.innerHeight - document.getElementById("taskbar").clientHeight
    } else if (resizeUnMaximize) {
      x = 0
      y = 0
      resizeUnMaximize = false
    } else {
      width = defaultWidth
      height = defaultHeight
      x = defaultX
      y = defaultY
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
    const dx = event.clientX - startX
    const dy = event.clientY - startY
    x = startLeft + dx
    y = startTop + dy
  }

  function handleMouseup() {
    window.removeEventListener("mousemove", handleMousemove)
    window.removeEventListener("mouseup", handleMouseup)
  }

  function handleMousedownDrag(event: MouseEvent) {
    event.stopPropagation()
    startDragX = event.clientX
    startDragY = event.clientY
    startWidth = width
    startHeight = height

    window.addEventListener("mousemove", handleMousemoveDrag)
    window.addEventListener("mouseup", handleMouseupDrag)
  }

  function handleMousemoveDrag(event: MouseEvent) {
    desktopStore.update((state) => {
      if (!isMaximized) return state
      resizeUnMaximize = true
      const thisApp = state.openApps.find((app) => app.id === id)
      thisApp.isMaximized = false

      state.openApps = state.openApps.map((app) => {
        if (app.id === id) {
          return thisApp
        }

        return app
      })

      x = 0
      y = 0

      return state
    })

    const dx = event.clientX - startDragX
    const dy = event.clientY - startDragY

    width = startWidth + dx
    height = startHeight + dy
  }

  function handleMouseupDrag() {
    window.removeEventListener("mousemove", handleMousemoveDrag)
    window.removeEventListener("mouseup", handleMouseupDrag)
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<section
  class="absolute"
  style="left: {x}px; top: {y}px; width: {width}px; height: {height}px; z-index: {isFocused
    ? 50
    : 10};"
  on:click={() => {
    desktopStore.update((state) => {
      state.openApps = state.openApps.map((app) => {
        if (app.id === id) {
          app.isFocused = true
        } else {
          app.isFocused = false
        }

        return app
      })

      return state
    })
  }}
>
  <div
    class="flex flex-col border-2 border-slate-900 min-h-[40px] min-w-[100px]"
    style="width: {width}px; height: {height}px;"
  >
    <div
      role="toolbar"
      tabindex="0"
      class="w-full h-5 flex justify-between items-center bg-slate-400"
      on:mousedown={handleMousedown}
    >
      <h1>{title}</h1>
      <div class="flex gap-2 items-center px-1">
        <button
          on:click={() => {
            desktopStore.update((state) => {
              const thisApp = state.openApps.find((app) => app.id === id)
              thisApp.isMinimized = !thisApp.isMinimized

              console.log(thisApp)

              state.openApps = state.openApps.map((app) => {
                if (app.id === id) {
                  return thisApp
                }

                return app
              })

              return state
            })
          }}
        >
          -
        </button>
        <button
          on:click={() => {
            desktopStore.update((state) => {
              const thisApp = state.openApps.find((app) => app.id === id)
              thisApp.isMaximized = !thisApp.isMaximized

              state.openApps = state.openApps.map((app) => {
                if (app.id === id) {
                  return thisApp
                }

                return app
              })

              return state
            })
          }}
          class={!isMaximized ? "mb-1" : "mb-[1px]"}
        >
          {isMaximized ? "▫" : "□"}
        </button>
        <button
          on:click={() => {
            desktopStore.update((state) => {
              state.openApps = state.openApps.filter((app) => app.id !== id)
              return state
            })
          }}
        >
          X
        </button>
      </div>
    </div>

    <div class="w-full bg-white" style="height: calc({height}px - 40px);">
      <iframe {title} class="w-full h-full" src={link} frameborder="0"></iframe>
    </div>

    <div class="w-full h-5 flex justify-end bg-slate-400">
      <div
        role="toolbar"
        tabindex="0"
        class="w-10 h-full flex justify-end items-end hover:cursor-nw-resize text-gray-500"
        on:mousedown={handleMousedownDrag}
        on:mouseup={handleMouseupDrag}
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
