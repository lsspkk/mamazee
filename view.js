import {
  t,
  world,
  isStart,
  isEnd,
  getNextTileName,
  makeMove,
  makeStartMove,
  chooseNewDirection,
  findCrossroads,
  crossRoadTileName,
  backWard,
  clearWorld,
} from './maze.js'

import { randomColor, setInfo } from './info.js'
import * as PIXI from 'pixi.js'
const { Texture, Sprite, Rectangle } = PIXI

// The application will create a renderer using WebGL, if possible,
// with a fallback to a canvas render. It will also setup the ticker
// and the root stage PIXI.Container
const app = new PIXI.Application()
app.renderer.backgroundColor = 0xefefff //0x9fd0cf
//app.renderer.resize(800, 800)

// The application will create a canvas element for you that you
// can then insert into the DOM
const displayDiv = document.querySelector('#display')
displayDiv.appendChild(app.view)

function makeTexture(x, y, tileset) {
  return new Texture(tileset, new Rectangle(20 * x, 20 * y, 20, 20))
}

function randomTile(textures) {
  return new Sprite(textures[Math.floor(Math.random() * textures.length)])
}

function makeTile(x, y, tileset) {
  return new Sprite(new Texture(tileset, new Rectangle(20 * y, 20 * x, 20, 20)))
}
function makeNamedTile([x, y], tileset) {
  return makeTile(x, y, tileset)
}

//let lastTiles = []
export function placeTile(tiles, x, y, name, tile) {
  // lastTiles.push(move)
  // if (lastTiles.length > 20) {
  //   const ends = lastTiles.filter((e) => e === 'dead-end')
  //   //console.log({ ends })
  //   if (ends.length > 20) {
  //     lastTiles = []
  //     throw new Error('deadlock')
  //   }

  //   lastTiles.shift()
  // }
  tile.x = x * 20 + 10

  tile.y = y * 20 + 10
  tile.anchor.x = 0.5
  tile.anchor.y = 0.5
  tiles[x][y] = { tile, name }
  app.stage.addChild(tile)
}

export const engine = {
  life: 0,
  speed: 0, // 1 is fastest
  gear: 'first',
  deadQueue: [],
  crossQueue: [],
  routeColor: randomColor(),
  routeCount: 0,
}
export function setEngineSpeed(speed) {
  engine.speed = speed
}
function clearEngine() {
  engine.speed = 0
  engine.life = 0
  engine.routeCount = 0
  engine.deadQueue = []
  engine.crossQueue = []
}

export function clearMapTiles(tiles) {
  if (tiles) {
    tiles.forEach((row) =>
      row.forEach((column) => {
        app.stage.removeChild(column.tile)
        column.tile.destroy()
      })
    )
  }
}
export function createMapTiles(tileset) {
  return world.grid.map((row, y) =>
    row.map(({name}, x) => {
      //const tile = randomTile(textures)
      const tile = makeNamedTile(name, tileset)
      tile.x = x * 20 + 10
      tile.y = y * 20 + 10
      tile.anchor.x = 0.5
      tile.anchor.y = 0.5

      app.stage.addChild(tile)
      return { name, tile }
    })
  )
}

function createCrossroadsAndContinue(tiles, tileset) {
  while (true) {
    try {
      if (engine.crossQueue.length === 0) {
        throw new Error('the end: no place to start another route')
      }
      const [sx, sy] = engine.gear === 'first' ? engine.crossQueue[0] : engine.crossQueue[engine.crossQueue.length - 1]
      const [name, x, y, newDirection] = findCrossroads(sx, sy, engine.life)

      const tile = makeNamedTile(name, tileset)
      placeTile(tiles, x, y, name, tile)
      world.current.location = newDirection
      engine.crossQueue.push([newDirection[1], newDirection[2]])
      return
    } catch (error) {
      if (error.message === 'no route found') {
        //console.log(engine.crossQueue[0], { engine })
        // continue to find crossroads starting from "next path" i.e. a known crossroad
        if (engine.gear === 'first') engine.crossQueue.shift()
        if (engine.gear === 'last') engine.crossQueue.pop()
      } else {
        throw error
      }
    }
  }
}

let deadEndCounter = 0
function runEngine(tiles, tileset, goals) {
  if( deadEndCounter > 20 ) {
    throw new Error('deadlock')
  }


  world.previous.location = [...world.current.location]
  let [lastMove, x, y] = world.current.location
  setInfo(x, y, engine.routeCount, engine.routeColor) 
  try {
    world.current.location = makeMove(engine.life)
    const {name} = world.grid[x][y]
    const tile = makeNamedTile(name, tileset)
    placeTile(tiles, x, y, name, tile)
    deadEndCounter = 0

  } catch (error) {
    //console.log(error.message)
    if (error.message === 'dead-end') {
      deadEndCounter++
      if (engine.deadQueue.length % 10 === 0) {
        const anotherGear = engine.gear === 'first' ? 'last' : Math.random() < 0.1 ? 'first' : 'last'
        engine.gear = anotherGear
      }
      engine.deadQueue.push([x, y])
      const name = t.DEAD_END_NORMAL
      world.grid[x][y] = { name, move: 'dead-end', turn: '', back: backWard(lastMove), life: engine.life}


      const tile = makeNamedTile(name, tileset)
      placeTile(tiles, x, y, name, tile)
      if (x === 0 || y === 0 || x === world.height - 1 || y === world.length - 1) {
        goals.push({ x, y, life: engine.life })
      }

      createCrossroadsAndContinue(tiles, tileset)
      engine.routeColor = randomColor()
      engine.routeCount = engine.routeCount + 1
      return
    }
  }
}

app.renderer.resize(world.width * 20, world.height * 20)
export function resetMaze() {
  clearEngine()
  clearWorld()
  clearMapTiles(tiles)
  app.renderer.resize(world.width * 20, world.height * 20)
  tiles = createMapTiles(tileset)
  makeStartMove()
  engine.crossQueue.push(world.start)
  goals = []
}

let tileset = undefined
let tiles = undefined
let goals = undefined

// load tileset
app.loader.add('tileset', 'tileset.png').load((loader, resources) => {
  tileset = PIXI.utils.TextureCache['tileset.png']
  let end = undefined

  resetMaze()
  app.ticker.speed = 3
  // Listen for frame updates
  app.ticker.add(() => {
    if (end) end.rotation += 0.03
    engine.life = engine.life + 1
    try {
      if (engine.speed !== 0 && engine.life % engine.speed === 0) {
        if (engine.speed === 10) {
          while (true) runEngine(tiles, tileset, goals)
        } else 
        {
          runEngine(tiles, tileset, goals)
        }
      }
    } catch (error) {
      if (error.message === 'the end' || error.message === 'deadlock') {
        engine.speed = 0
        if (goals.length === 0) return
        goals.sort((a, b) => b.life - a.life)
        end = makeNamedTile(t.STAR, tileset)
        end.x = goals[0].x * 20 + 10
        end.y = goals[0].y * 20 + 10
        end.anchor.x = 0.5
        end.anchor.y = 0.5
        app.stage.addChild(end)
        //console.log(goals[0])

        for (let i = 0; i < goals.length; i++) {
          const { x, y } = goals[i]
          const name = t.DEAD_END_SPECIAL
          const tile = makeNamedTile(name, tileset)
          placeTile(tiles, x, y, name, tile)
          app.stage.addChild(tile)
          i = i + i
        }
      }
    }
  })
})
