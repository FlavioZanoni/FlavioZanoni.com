let image = ""

async function loadArt() {
  const response = await fetch('/neofetch.txt');
  image = await response.text();
}
loadArt()

export const getASCIIArt = () => {
  return image
}
