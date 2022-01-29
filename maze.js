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
  DEAD_END_SPECIAL: [2, 0],
  DEAD_END_NORMAL: [4, 4],
  STAR: [1, 4],
}

export const initialworld = {
  height: 40,
  width: 40,
  start: [19, 19],
  end: [19, 39],
  current: {
    location: [],
  },
  previous: {
    location: [],
  },
  grid: []
}

export let world = initialworld

export function clearWorld() {
  world.grid = [...Array(world.height).keys()]
    .map((y) => [...Array(world.width).keys()].map(x => {
      const name = isStart(x, y) ? t.STAR : t.EMPTY
      return { name }
    })
  )
}


export function isStart(x, y) {
  return x === world.start[0] && y === world.start[1]
}
export function isEnd(x, y) {
  return x === world.end[0] && y === world.end[1]
}

export function isBlocked(x, y ) {
  const { name } = world.grid[x][y]
  return (name[0] !== t.EMPTY[0] && name[1] !== t.EMPTY[1]) || (x === world.start[0] && y === world.start[1])
}

export function getChoises(x, y ) {
  let choises = []
  if (x !== 0 && !isBlocked(x - 1, y)) {
    choises.push(['left', x - 1, y])
  }
  if (x !== world.width - 1 && !isBlocked(x + 1, y)) {
    choises.push(['right', x + 1, y])
  }
  if (y !== 0 && !isBlocked(x, y - 1)) {
    choises.push(['up', x, y - 1])
  }
  if (y !== world.height - 1 && !isBlocked(x, y + 1)) {
    choises.push(['down', x, y + 1])
  }
  return choises
}
export function rMove([x, y]) {
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

export function makeMove(life) {
  let [lastMove, x, y] = world.current.location
  const choises = getChoises(x, y)
  if (choises.length === 0) {
    throw new Error('dead-end')
  }
  const choice = Math.floor(Math.random() * choises.length)
  if( !life ) return choises[choice]
  const [move, newx,newy] = choises[choice]
  const name = getNextTileName(move, lastMove)
  const back =  backWard(lastMove)
  world.grid[x][y] = { name, move, back, turn: '', life }
  return [move, newx,newy]
}
export function chooseNewDirection(choises) {
  const choice = Math.floor(Math.random() * choises.length)
  return choises[choice]
}

export function makeStartMove() {
  const [x, y] = world.start
  world.previous.location = world.current.location = ['start', x, y]
  world.current.location = makeMove(0)
  world.grid[x][y].move = world.current.location[0]
}

export function followMaze(x, y, move) {
  if (move === 'right') return [1, 0]
  if (move === 'left') return [-1, 0]
  if (move === 'up') return [0, -1]
  if (move === 'down') return [0, +1]
  throw new Error('no route found')
}

var count = 0
export function findCrossroads(x, y, life) {
  if (count > 42424242) throw new Error('a million crossroads searched, bye now')
  do {
    const { move } = world.grid[x][y]
    const choises = getChoises(x, y)
    if (choises.length === 0 || (x === world.start[0] && y === world.start[1])) {
      const [dx, dy] = followMaze(x, y, move)
      x += dx
      y += dy
      //console.log({x,y,move, count})
      count++
    } else {
      //console.log('found choises', choises)
      const newDirection = chooseNewDirection(choises)
      const name = crossRoadTileName(x, y, newDirection)
      const { move, back } = world.grid[x][y]
      world.grid[x][y] = { name, move, back, turn: newDirection[0], life }

      return [name, x, y, newDirection]
    }
  } while (true)
}

export function crossRoadTileName(x, y, newDirection) {
  const current = world.grid[x][y]
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
