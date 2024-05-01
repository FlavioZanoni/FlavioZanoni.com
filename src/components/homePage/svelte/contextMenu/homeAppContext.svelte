<script lang="ts">
  import Button from "../Button.svelte"

  export let iNode: string

  const moveToRecycleBin = () => {
    console.log("Move to Recycle bin", iNode)
  }
</script>

<Button on:click={moveToRecycleBin} id={"button1"}>Move to Recycle bin</Button>
<Button on:click={() => {}} id={"button2"}>Toggle CRT effect</Button>
