import { resetInfo } from './info.js'
import { world } from './maze.js'
import { resetMaze, setEngineSpeed } from './view.js'

export const state = {
  system: 0,
  choises: ['first', 'last'],
  speed: 10,
}

export const menu = []

state.choises.forEach((name) => menu.push({ name, element: document.getElementById(name) }))
menu.forEach(
  ({ name, element }) =>
    (element.onclick = () => {
      console.log(name)
      setSystem(name)
    })
)

function activate() {
  const choise = state.choises[state.system]
  menu.forEach(({ name, element }) => {
    element.classList.toggle('active', choise === name)
  })
}
function setSystem(choice) {
  state.system = state.choises.findIndex((c) => c === choice)
  console.debug({ state })
  activate()
}

document.addEventListener(
  'keydown',
  (event) => {
    const keyName = event.key

    if (keyName === 'Control') {
      // do not alert when only Control key is pressed.
      return
    }

    if (event.ctrlKey) {
      console.log(`Combination of ctrlKey + ${keyName}`)
    } else {
      console.log(`Key pressed ${keyName}`)
    }

    if (keyName === 'ArrowDown') {
      state.system = state.system - 1 >= 0 ? state.system - 1 : state.choises.length - 1
      activate()
    }
    if (keyName === 'ArrowUp') {
      state.system = state.system + 1 < state.choises.length ? state.system + 1 : 0
      activate()
    }
    if (keyName === 'Enter') {
    }
  },
  false
)

activate()
const buttons = {
  start: document.getElementById('start'),
  stop: document.getElementById('stop'),
  reset: document.getElementById('reset'),
}
function getSize() {
  return document.forms[0].elements['size'].value
}
function getSpeed() {
  return Number(document.forms[1].elements['speed'].value)
}

document.getElementById('speedform').onclick = () => {
  state.speed = getSpeed()
  setEngineSpeed(state.speed)
}


function r(s) {
  return Math.floor((Math.random() * (s - 1)) / 2 + s / 4)
}
buttons.start.onclick = () => setEngineSpeed(state.speed)
buttons.stop.onclick = () => setEngineSpeed(0)
buttons.reset.onclick = () => {
  setEngineSpeed(0)
  const s = getSize()
  const size = s === 's' ? 20 : s === 'm' ? 40 : 80
  world.height = size
  world.width = size
  world.start = [r(size), r(size)]
  console.log({ world })
  resetMaze()
  resetInfo()
}
