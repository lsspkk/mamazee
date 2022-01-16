import { engine } from './view.js'

export const t = {
  UP_DOWN: [0, 0],
  LEFT_RIGHT: [0, 1],
  DOWN_RIGHT: [0, 2],
  DOWN_LEFT: [0, 3],
  UP_LEFT: [0, 4],
  UP_RIGHT: [0, 5],
  UP_DOWN_RIGHT: [1, 0],
  UP_DOWN_LEFT: [1, 1],
  LEFT_RIGHT_DOWN: [1, 2],
  LEFT_RIGHT_UP: [1, 3],
  EMPTY: [9, 9],
  DEAD_END: [2, 0],
  STAR: [1, 4],
}

export const initialworld = {
  height: 80,
  width: 80,
  start: [19, 19],
  end: [19, 39],
  current: {
    location: [],
  },
  previous: {
    location: [],
  },
}
// export const initialworld = {
//   height: 40,
//   width: 40,
//   start: [19, 19],
//   end: [19, 39],
//   current: {
//     location: [],
//   },
//   previous: {
//     location: [],
//   },
// }
// export const initialworld = {
//   height: 20,
//   width: 20,
//   start: [9, 9],
//   end: [9, 19],
//   current: {
//     location: [],
//   },
//   previous: {
//     location: [],
//   },
// }

export let world = initialworld

export function isStart(x, y) {
  return x === world.start[0] && y === world.start[1]
}
export function isEnd(x, y) {
  return x === world.end[0] && y === world.end[1]
}

export function isBlocked(x, y, tiles) {
  const { name } = tiles[x][y]
  return (name[0] !== t.EMPTY[0] && name[1] !== t.EMPTY[1]) || (x === world.start[0] && y === world.start[1])
}

export function getChoises(x, y, tiles) {
  let choises = []
  if (x !== 0 && !isBlocked(x - 1, y, tiles)) {
    choises.push(['left', x - 1, y])
  }
  if (x !== world.width - 1 && !isBlocked(x + 1, y, tiles)) {
    choises.push(['right', x + 1, y])
  }
  if (y !== 0 && !isBlocked(x, y - 1, tiles)) {
    choises.push(['up', x, y - 1])
  }
  if (y !== world.height - 1 && !isBlocked(x, y + 1, tiles)) {
    choises.push(['down', x, y + 1])
  }
  return choises
}
export function rMove([x, y], tiles) {
  return
}

export function getNextTileName(move, lastMove) {
  if ((move === 'left' && lastMove === 'left') || (move === 'right' && lastMove === 'right')) {
    return t.LEFT_RIGHT
  }
  if ((move === 'up' && lastMove === 'up') || (move === 'down' && lastMove === 'down')) {
    return t.UP_DOWN
  }
  if ((move === 'up' && lastMove === 'right') || (move === 'left' && lastMove === 'down')) {
    return t.UP_LEFT
  }
  if ((move === 'up' && lastMove === 'left') || (move === 'right' && lastMove === 'down')) {
    return t.UP_RIGHT
  }
  if ((move === 'left' && lastMove === 'up') || (move === 'down' && lastMove === 'right')) {
    return t.DOWN_LEFT
  }
  if ((move === 'right' && lastMove === 'up') || (move === 'down' && lastMove === 'left')) {
    return t.DOWN_RIGHT
  }
  return t.EMPTY
}

export function makeMove(tiles) {
  let [, x, y] = world.current.location
  const choises = getChoises(x, y, tiles)
  if (choises.length === 0) {
    throw new Error('dead-end')
  }
  const choice = Math.floor(Math.random() * choises.length)
  return choises[choice]
}
export function chooseNewDirection(choises) {
  const choice = Math.floor(Math.random() * choises.length)
  return choises[choice]
}

export function makeStartMove(tiles) {
  const [x, y] = world.start
  world.previous.location = world.current.location = ['start', x, y]
  world.current.location = makeMove(tiles)
  tiles[x][y].move = world.current.location[0]
}

export function followMaze(x, y, move) {
  if (move === 'right') return [1, 0]
  if (move === 'left') return [-1, 0]
  if (move === 'up') return [0, -1]
  if (move === 'down') return [0, +1]
  throw new Error('no route found')
}

var count = 0
export function findCrossroads(x, y, tiles) {
  if (count > 1000000) throw new Error('hi')
  do {
    const { move } = tiles[x][y]
    const choises = getChoises(x, y, tiles)
    if (choises.length === 0 || (x === world.start[0] && y === world.start[1])) {
      const [dx, dy] = followMaze(x, y, move)
      x += dx
      y += dy
      //console.log({x,y,move, count})
      count++
    } else {
      //console.log('found choises', choises)
      return [x, y, choises]
    }
  } while (true)
}

export function crossRoadTileName(x, y, newDirection, tiles) {
  const current = tiles[x][y]
  let walls = ['up', 'down', 'left', 'right'].filter(
    (w) => w !== newDirection[0] && w !== current.move && w !== current.back
  )
  if (walls.length !== 1) {
    console.log('can not add crossroads', { x, y, current, newDirection })
    throw 'bye'
  }
  const wall = walls[0]

  if (wall === 'up') return t.LEFT_RIGHT_DOWN
  if (wall === 'down') return t.LEFT_RIGHT_UP
  if (wall === 'left') return t.UP_DOWN_RIGHT
  return t.UP_DOWN_LEFT
}

export function backWard(move) {
  if (move === 'right') return 'left'
  if (move === 'left') return 'right'
  if (move === 'up') return 'down'
  if (move === 'down') return 'up'
  return 'dead-end'
}
let lastTiles = []
export function placeTile(x, y, name, tile, move, back, tiles, turn) {
  lastTiles.push(move)
  if (lastTiles.length > 20) {
    const ends = lastTiles.filter((e) => e === 'dead-end')
    //console.log({ ends })
    if (ends.length > 20) {
      lastTiles = []
      throw new Error('deadlock')
    }

    lastTiles.shift()
  }
  tile.name = name
  tile.x = x * 20 + 10
  tile.y = y * 20 + 10
  tile.anchor.x = 0.5
  tile.anchor.y = 0.5
  const life = engine.life
  tiles[x][y] = { tile, name, move, back, turn, life }
}
