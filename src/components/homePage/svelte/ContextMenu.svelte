<script lang="ts">
  import Button from "./Button.svelte"

  export let x: number = 0
  export let y: number = 0
</script>

<div
  class="bg-slate-200 border-2 border-slate-900 absolute flex flex-col w-[250px] h-fit"
  style={`left: ${x}px; top: ${y}px;`}
>
  <Button id={"button1"}>item 1</Button>
  <Button id={"button2"}>item 2</Button>
  <Button id={"button3"}>item 3</Button>
  <Button id={"button4"}>item 4</Button>
</div>
