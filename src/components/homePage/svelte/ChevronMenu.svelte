<script lang="ts">
  import { onMount } from "svelte"

  export let id: string

  let left = "0px"
  let bottom = "0px"

  onMount(() => {
    const chevronButton = document.getElementById("chevronButon")

    const chevronButtonRect = chevronButton.getBoundingClientRect()
    left = `${chevronButtonRect.left - 90 + chevronButtonRect.width / 2}px`
    bottom = `${window.innerHeight - chevronButtonRect.bottom + chevronButtonRect.height + 10}px`
  })
</script>

<section {id} style="left: {left}; bottom: {bottom}; " class="absolute">
  <div
    class="flex flex-row gap-4 w-[180px] h-[100px] bg-slate-400 border border-slate-900 p-2"
  >
    <a target="_blank" href="https://www.linkedin.com/in/flaviozanoni/">
      <img alt="Linkedn" src={"/icons/linkedin.webp"} width={20} height={20} />
    </a>
    <a target="_blank" href="https://github.com/FlavioZanoni">
      <img alt="github" src={"/icons/github.webp"} width={20} height={20} />
    </a>
  </div>
</section>
