import { engine } from './view'

export const state = {
  system: 0,
  choises: ['start-end', 'end', 'stop'],
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
  if (choice === 'stop') stop()
}
function launch() {
  console.log('start')
}
function stop() {
  engine.speed = '0'
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
document.getElementById('launch').onclick = () => launch()
