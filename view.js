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
  placeTile,
} from './maze.js'

import { randomColor, setInfo } from './info.js'

const { Texture, Sprite, Rectangle } = PIXI

// The application will create a renderer using WebGL, if possible,
// with a fallback to a canvas render. It will also setup the ticker
// and the root stage PIXI.Container
const app = new PIXI.Application()
app.renderer.backgroundColor = 0xefefff //0x9fd0cf
app.renderer.resize(world.width * 20, world.height * 20)
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

// keskipiste
// maalipiste
// tee yksi reitti maaliin
// - satunnainen reitti, laske pituus
// joka 20s askel, painota kohti lähtöä
// jos ei pääse eteenpäin
// laske lähimpänä maalia oleva piste, tee siihen risteys
// jatka siitä

// start -metodi
// heitä risteykset jonoon, jos et pysty etsimään uutta risteystä tästä reitistä
// vaihda reitinetsintä jatkumaan risteyksistä

// pidä kirjaa edellisestä suunnasta, maalin suunnasta
// jos ympärillä on seinät, osaa mennä eteenpäin
// Jos yhdellä puolella on seinä, osaa mennä eteenpäin tai kääntyä

// pidä kirjaa ruuduista, jotka on täytetty
// jos ruutua ei ole täytetty, ja ollaan maalissa, tee risteys

// 1 = jako
// joka 100:s, jako
// 5:n jälkeen painota mutkaa

// load the texture we need

const grid = [...Array(world.height).keys()].map((x) => [...Array(world.width).keys()])

export const engine = {
  life: 0,
  running: false,
  speed: 10, // 1 is fastest
  gear: 'start',
  deadQueue: [],
  crossQueue: [],
  color: randomColor(),
  count: 0,
}
export function clearMap(tiles, tileset) {
  if (tiles) {
    tiles.forEach((row) =>
      row.forEach((column) => {
        app.stage.removeChild(column.tile)
        column.tile.destroy()
      })
    )
  }

  return grid.map((row, y) =>
    row.map((column, x) => {
      //const tile = randomTile(textures)
      const name = isStart(x, y) ? t.STAR : t.EMPTY
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

function continueFromCrossroads(tiles, tileset) {
  while (true) {
    try {
      if (engine.crossQueue.length === 0) {
        throw new Error('the end')
      }
      const [sx, sy] = engine.gear === 'start' ? engine.crossQueue[0] : engine.crossQueue[engine.crossQueue.length - 1]
      const crossRoads = findCrossroads(sx, sy, tiles)
      //console.log(tiles[sx][sy], JSON.stringify(crossRoads,null,2))

      // make crossroads
      const [x, y, choises] = crossRoads
      const newDirection = chooseNewDirection(choises)
      const crName = crossRoadTileName(x, y, newDirection, tiles)
      const crTile = makeNamedTile(crName, tileset)
      const { move, back } = tiles[x][y]
      //app.stage.removeChild(tiles[x][y].tile)
      //console.log({ x, y, crName, move, back, turn: newDirection[0] })
      placeTile(x, y, crName, crTile, move, back, tiles, newDirection[0])
      app.stage.addChild(crTile)
      world.current.location = newDirection
      engine.crossQueue.push([newDirection[1], newDirection[2]])
      return
      //console.log(JSON.stringify(world,null,2))
      throw new Error('hi')
    } catch (error) {
      if (error.message === 'no route found') {
        //console.log(engine.crossQueue[0], { engine })
        // continue to find crossroads starting from "next path" i.e. a known crossroad
        if (engine.gear === 'start') engine.crossQueue.shift()
        if (engine.gear === 'end') engine.crossQueue.pop()
      } else {
        console.log('another error from crossroads', { error })
        throw error
      }
    }
  }
}
function runEngine(tiles, tileset, goals) {
  world.previous.location = [...world.current.location]
  let [lastMove, x, y] = world.current.location
  try {
    setInfo(x, y, engine.count, engine.color)
    world.current.location = makeMove(tiles)
  } catch (error) {
    //console.log(error.message)
    if (error.message === 'dead-end') {
      if (engine.deadQueue.length % 10 === 0) {
        const anotherGear = engine.gear === 'start' ? 'end' : Math.random() < 0.1 ? 'start' : 'end'
        engine.gear = anotherGear
      }
      engine.deadQueue.push([x, y])
      const tile = makeNamedTile([4, 4], tileset)
      placeTile(x, y, [4, 4], tile, 'dead-end', backWard(lastMove), tiles, '')
      app.stage.addChild(tile)
      //console.log('added_dead', { x, y, count: engine.count })
      if (x === 0 || y === 0 || x === world.height - 1 || y === world.length - 1) {
        goals.push({ x, y, life: engine.life })
      }

      continueFromCrossroads(tiles, tileset)
      engine.color = randomColor()
      engine.count = engine.count + 1
      return
    }
  }
  const [move] = world.current.location

  const name = getNextTileName(move, lastMove)
  //console.log({lastMove, move, name, x, y})
  //app.stage.removeChild(tiles[x][y].tile)
  const tile = makeNamedTile(name, tileset)
  placeTile(x, y, name, tile, move, backWard(lastMove), tiles, '')
  app.stage.addChild(tile)
}
app.loader.add('tileset', 'tileset.png').load((loader, resources) => {
  // This creates a texture from a 'bunny.png' image
  // count the first position
  const tileset = PIXI.utils.TextureCache['tileset.png']
  let tiles = clearMap(undefined, tileset)
  makeStartMove(tiles)

  let end = undefined
  engine.crossQueue.push(world.start)
  const goals = []

  app.ticker.speed = 3
  // Listen for frame updates
  app.ticker.add(() => {
    if (end) end.rotation += 0.03
    engine.life = engine.life + 1
    try {
      if (engine.speed !== 0 && engine.life % engine.speed === 0) {
        if (engine.speed === 10) {
          while (true) runEngine(tiles, tileset, goals)
        } else runEngine(tiles, tileset, goals)
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
        console.log(goals[0])

        for (let i = 0; i < goals.length; i++) {
          const { x, y } = goals[i]
          const tile = makeNamedTile(t.DEAD_END, tileset)
          placeTile(x, y, t.DEAD_END, tile, 'dead-end', '', tiles, '')
          app.stage.addChild(tile)
          i = i + i
        }
      }
    }
  })
})
