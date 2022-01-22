import { world } from './maze.js'

const infoDisplay = {}

infoDisplay.info = document.getElementById('info')

function buildGrid() {
  infoDisplay.info.style = `
  width: ${world.width * 20}px;
  height: ${world.height * 20}px;
  margin-left: ${world.width * -10}px;`

  infoDisplay.grid = [...Array(world.height).keys()].map((x) =>
    [...Array(world.width).keys()].map((x) => {
      const div = document.createElement('div')
      infoDisplay.info.appendChild(div)
      return div
    })
  )
}
buildGrid()
var r = () => (Math.random() * 256) >> 0
export function randomColor() {
  return `rgba(${r()}, ${r()}, ${r()}, 0.2)`
}

export function setInfo(x, y, text, color) {
  const element = infoDisplay.grid[y][x]
  if (color) element.style.background = color
  if (text) element.innerHTML = text
}

export function resetInfo() {
  infoDisplay.grid.forEach((y) => y.forEach((x) => x.remove()))
  buildGrid()
}
