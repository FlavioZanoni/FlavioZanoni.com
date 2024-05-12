<script lang="ts">
  import { osStore } from "@lib/store"
  import {
    getItemsInArrayByINode,
    type GetItemsInArrayByINode,
  } from "@lib/utils/fileSystemUtils"
  import Button from "./Button.svelte"
  import ChevronMenu from "./ChevronMenu.svelte"
  import Menu from "./Menu.svelte"

  let clock = "00:00:00"
  let showMenu = false
  let showChevronMenu = false

  const updateClock = () => {
    const now = new Date()
    const hours = String(now.getHours()).padStart(2, "0")
    const minutes = String(now.getMinutes()).padStart(2, "0")
    const seconds = String(now.getSeconds()).padStart(2, "0")
    clock = `${hours}:${minutes}:${seconds}`
  }
  updateClock()
  setInterval(updateClock, 1000)

  const handleClickOutsideMenu = (e) => {
    const menu = document.getElementById("menu")
    if (!menu) return

    if (showMenu && !menu.contains(e.target) && e.target.id !== "menuBtn") {
      showMenu = false
    }
  }

  const handleClickOutsideChevron = (e) => {
    const chevronMenu = document.getElementById("chevronMenu")
    if (!chevronMenu) return

    if (
      showChevronMenu &&
      !chevronMenu.contains(e.target) &&
      e.target.id !== "chevronButon"
    ) {
      showChevronMenu = false
    }
  }

  let hasMenuListener = false
  let hasChevronListener = false

  let taskBarItemsByINode: GetItemsInArrayByINode
  let openAppsByINode: GetItemsInArrayByINode
  $: {
    const env = $osStore.enviroment
    openAppsByINode = getItemsInArrayByINode(env.openApps)
    taskBarItemsByINode = getItemsInArrayByINode(env.taskbar.items)
  }

  $: {
    if (showMenu) {
      hasMenuListener = true
      window.addEventListener("click", handleClickOutsideMenu)
    } else if (hasMenuListener) {
      window.removeEventListener("click", handleClickOutsideMenu)
    }

    if (showChevronMenu) {
      hasChevronListener = true
      window.addEventListener("click", handleClickOutsideChevron)
    } else if (hasChevronListener) {
      window.removeEventListener("click", handleClickOutsideChevron)
    }
  }
</script>

<footer
  id="taskbar"
  class="flex min-h-10 justify-between w-full items-center bg-slate-400 border-t border-r border-slate-900 select-none"
>
  <section id="start" class="flex divide-x divide-slate-900 gap-1">
    <Button
      on:click={() => {
        showMenu = !showMenu
      }}
      variant="secondary"
      id="menuBtn">₪ Menu</Button
    >
    {#if $osStore.enviroment.taskbar.items}
      {#each $osStore.enviroment.taskbar.items as item (item.iNode)}
        {@const currentItem = taskBarItemsByINode[item.iNode]}
        <Button
          id={item.iNode}
          on:click={() => {
            osStore.update((state) => {
              state.enviroment.openApps.push({
                name: item.name,
                iNode: item.iNode,
                isMinimized: false,
                isMaximized: false,
                isFocused: true,
                uuid: crypto.randomUUID(),
              })
              return state
            })
          }}>{currentItem.name}</Button
        >
      {/each}
    {/if}

    {#if $osStore.enviroment.openApps}
      {#each $osStore.enviroment.openApps as item}
        <Button
          id={item.uuid}
          on:click={() => {
            osStore.update((state) => {
              const currentItem = state.enviroment.openApps.findIndex(
                (app) => app.uuid === item.uuid
              )

              state.enviroment.openApps[currentItem].isMinimized =
                !state.enviroment.openApps[currentItem].isMinimized
              return state
            })
          }}>{item.name}</Button
        >
      {/each}
    {/if}
  </section>

  <section id="end" class="flex divide-x divide-slate-900 gap-1">
    <Button
      on:click={() => {
        showChevronMenu = !showChevronMenu
      }}
      id="chevronButon"
      customCss="pt-2">^</Button
    >

    <div class="flex justify-center items-center min-w-[91px]">
      <p id="clock">{clock}</p>
    </div>
  </section>

  {#if showMenu}
    <Menu id="menu" />
  {/if}

  {#if showChevronMenu}
    <ChevronMenu id="chevronMenu" />
  {/if}
</footer>
