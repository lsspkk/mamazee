let a = [0, 0, 0, 1, 1, 0, 0, 0, 0, 0]
let display = document.getElementById('display')
let result = document.getElementById('result')
console.log(a)

function clear() {
  a = [0, 0, 0, 1, 1, 0, 0, 0, 0, 0]
  console.log({ a })
}
function render(element) {
  element.innerHTML = ''

  a.forEach((e, i) => {
    const div = document.createElement('div')
    div.style.width = div.style.height = '20px'
    div.style.border = `1px solid #000`
    div.style.background = e ? '#999' : '#fff'
    div.innerHTML = i
    element.appendChild(div)
  })
}

function space() {
  const b = [...a]
  const indexes = []
  b.forEach((e, i) => {
    if (e) indexes.push(i)
  })
  const amount = indexes.length
  if (amount < 2) return
  const neededSpace = Math.floor((b.length - amount) / (amount - 1)) + 1
  console.log({ amount, neededSpace, indexes })

  findLocations(b, indexes, neededSpace)
  a = b
}

function findLocations(b, indexes, neededSpace) {
  let targets = []
  for (let i = 0; i < b.length; i = i + neededSpace) {
    targets.push(i)
  }
  console.log({ targets }, { indexes })
  for (let i = 0; i < indexes.length; i++) {
    const current = indexes[i]
    const target = targets[i]
    if (current !== target) {
      const temp = b[current]
      b[current] = b[target]
      b[target] = temp
    }
  }
}

function getFreeLeft(b, index) {
  let free = 0
  for (let i = index - 1; i >= 0; i--) {
    const c = b[i]
    if (c) break
    free++
  }
  return free
}

function getFreeRight(b, index) {
  let free = 0
  for (let i = index + 1; i < b.length; i++) {
    const c = b[i]
    if (c) break
    free++
  }
  return free
}

// ei näin
// laske kaikki etäisyydet toisistaan
// kasvata lähimpien etäisyyttä siihen suuntaan, kummassa on enemmän tilaa
// ei toimi, koska lähimpien etäisyyden muuttaminen ei osaa riitä silloin
// jos on useampi sama etäisyys, jolloin pitää siirtää koko ketjua siihen suuntaan
// kummassa on enemmän tilaa
function findLocationsTwo(b, indexes, neededSpace) {
  console.log('---------------------')
  let keepMoving = true
  let count = 0
  while (keepMoving && count < 20) {
    const distances = []
    count++
    console.log(count)
    keepMoving = false
    for (let i = 0; i < indexes.length - 1; i++) {
      const current = indexes[i]
      const next = indexes[i + 1]
      const delta = next - current - 1
      distances.push({ delta, i })
    }

    distances.sort((a, b) => a.delta - b.delta)
    console.log({ distances })

    const current = indexes[distances[0].i]
    const next = indexes[distances[0].i + 1]
    // find direction to move: which side has more free squares
    const freeLeft = getFreeLeft(b, current)
    const freeRight = getFreeRight(b, next)

    // when to move the left piece
    // when to move the right piece
    if (freeLeft >= freeRight && current > 0) {
      const move = current - 1
      const temp = b[move]
      b[move] = b[current]
      b[current] = temp
    } else if (next < b.length) {
      const move = next + 1
      const temp = b[move]
      b[move] = b[next]
      b[next] = temp
    }
    keepMoving = true
    break
  }
}

// ei toimi, en muista miks
function findLocationsOne(b, indexes, neededSpace) {
  console.log('---------------------')
  let keepMoving = true
  let count = 0
  while (keepMoving && count < 20) {
    count++
    console.log(count)
    keepMoving = false
    for (let i = 0; i < indexes.length - 1; i++) {
      const current = indexes[i]
      const next = indexes[i + 1]
      const previous = i > 0 ? indexes[i - 1] : -1
      const delta = next - current - 1
      console.log({ current, next, delta })

      if (delta >= neededSpace) continue
      const mySpace = neededSpace - delta
      let move = -10
      let nextMove = -10
      if (current - mySpace >= 0 && (previous < 0 || current - mySpace - previous >= neededSpace))
        move = current - mySpace
      else if (current !== 0 && current - mySpace < 0) move = 0
      else if (next !== b.length - 1 && next + mySpace < b.length - 1) nextMove = next + mySpace
      else if (next + mySpace >= b.length - 1) nextMove = b.length - 1

      console.log({ current, next, delta, mySpace, move, nextMove })
      if (move < 0 && nextMove < 0) continue

      // if direction start, only move as far until there is a reserved square
      if (move >= 0) {
        const limit = b[move] ? move + 1 : move
        let foundPlace = !b[move] ? move : -1
        for (let j = current - 1; j > limit; j--) {
          const c = b[j]
          if (c) {
            move = j + 1
            break
          } else {
            foundPlace = j
          }
        }

        if (foundPlace < 0) continue
        indexes[i] = move
        const temp = b[move]
        b[move] = b[current]
        b[current] = temp
      }
      // if direction end, only move as far until there is a reserved square
      if (nextMove >= 0) {
        const limit = b[nextMove] ? nextMove - 1 : nextMove
        let foundPlace = !b[nextMove] ? nextMove : -1
        for (let j = next + 1; j < limit; j++) {
          const c = b[j]
          if (c) {
            nextMove = j - 1
            break
          } else {
            foundPlace = j
          }
        }
        if (foundPlace < 0) continue
        indexes[i + 1] = nextMove
        const temp = b[nextMove]
        b[nextMove] = b[next]
        b[next] = temp
      }
      console.log(b)
      keepMoving = true
      break
    }
  }
}

document.getElementById('reset').addEventListener('click', (event) => {
  clear()
  render(display)
})
document.getElementById('randomize').addEventListener('click', (event) => {
  const max = Math.round(Math.random() * 10) * 5
  a = [...Array(max).keys()].map((k) => (Math.random() < 0.7 ? 0 : 1))
  render(display)
})
document.getElementById('space').addEventListener('click', (event) => {
  space()
  render(display)
})
