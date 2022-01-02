// import * as PIXI from 'pixi.js'

// The application will create a renderer using WebGL, if possible,
// with a fallback to a canvas render. It will also setup the ticker
// and the root stage PIXI.Container
const app = new PIXI.Application()
app.renderer.backgroundColor = 0xefefff //0x9fd0cf
app.renderer.resize(800, 800)

const UP_DOWN = [0,0]
const LEFT_RIGHT = [0,1]
const DOWN_RIGHT = [0,2]
const DOWN_LEFT = [0,3]
const UP_LEFT = [0,4]
const UP_RIGHT = [0,5]
const UP_DOWN_RIGHT = [1,0]
const UP_DOWN_LEFT = [1,1]
const LEFT_RIGHT_DOWN = [1,2]
const LEFT_RIGHT_UP = [1,3]
const EMPTY = [9,9]
const DEAD_END = [1,4]
const STAR = [1,4]


// The application will create a canvas element for you that you
// can then insert into the DOM
document.body.appendChild(app.view)

const { Texture, Sprite, Rectangle } = PIXI

function makeTexture(x, y, tileset) {
  return new Texture(tileset, new Rectangle(20 * x, 20 * y, 20, 20))
}

function randomTile(textures) {
  return new Sprite(textures[Math.floor(Math.random() * textures.length)])
}

function makeTile(x, y, tileset) {
  return new Sprite(new Texture(tileset, new Rectangle(20 * x, 20 * y, 20, 20)))
}
function makeNamedTile([x,y], tileset) {
  return makeTile(y,x,tileset)
}


// keskipiste
// maalipiste
// tee yksi reitti maaliin
// - satunnainen reitti, laske pituus
// joka 20s askel, painota kohti lähtöä
// jos ei pääse eteenpäin
// laske lähimpänä maalia oleva piste, tee siihen risteys
// jatka siitä


// pidä kirjaa edellisestä suunnasta, maalin suunnasta
// jos ympärillä on seinät, osaa mennä eteenpäin
// Jos yhdellä puolella on seinä, osaa mennä eteenpäin tai kääntyä 


// pidä kirjaa ruuduista, jotka on täytetty
// jos ruutua ei ole täytetty, ja ollaan maalissa, tee risteys



// 1 = jako
// joka 100:s, jako
// 5:n jälkeen painota mutkaa


const world = {
  height: 40,
  width: 40,
  start: [19,19],
  end: [19, 39],
  current: {
    location: []    
  },
  previous: {
    location: [],
  }
}

function isStart(x,y) {
  return x === world.start[0] && y === world.start[1]
}
function isEnd(x,y) {
  return x === world.end[0] && y === world.end[1]
}


function isBlocked(x,y, tiles) {
  const {name} = tiles[x][y]
  return (name[0] !== EMPTY[0] && name[1] !== EMPTY[1]) || 
    (x === world.start[0] && y === world.start[1])
}

var down = false
function getChoises(x,y,tiles) {
  let choises = []
 //   if( !down ) { //|| 
 if (x !== 0 && !isBlocked(x-1,y,tiles)) {
  choises.push(['left', x-1,y])
}
if( x !== world.width-1 && !isBlocked(x+1,y,tiles)) {
       choises.push(['right', x+1,y])
}
if( y !== 0 && !isBlocked(x,y-1,tiles)) {
       choises.push(['up', x,y-1])
}
 //if( down ) { // || 
  if (y !== world.height-1 && !isBlocked(x,y+1,tiles)) {
   choises.push(['down', x,y+1])
 }
   down = !down
  return choises
}
function rMove([x,y], tiles) {
  return 
}


function getNextTileName(move, lastMove) {
  if( move === 'left' && lastMove === 'left' || 
      move === 'right' && lastMove === 'right') {
    return LEFT_RIGHT
  }
  if( move === 'up' && lastMove === 'up' || 
      move === 'down' && lastMove === 'down') {
    return UP_DOWN
  }
  if( move === 'up' && lastMove === 'right' || 
      move === 'left' && lastMove === 'down') {
    return UP_LEFT
  }
  if( move === 'up' && lastMove === 'left' || 
      move === 'right' && lastMove === 'down') {
    return UP_RIGHT
  }
  if( move === 'left' && lastMove === 'up' || 
      move === 'down' && lastMove === 'right') {
    return DOWN_LEFT
  }
  if( move === 'right' && lastMove === 'up' || 
      move === 'down' && lastMove === 'left') {
    return DOWN_RIGHT
  }
  return EMPTY
}

function makeMove(tiles) {
  let [,x,y] = world.current.location
  const choises = getChoises(x,y,tiles)  
  if( choises.length === 0) {
    throw new Error('No moves!')
  }
  const choice = Math.floor(Math.random()*choises.length)
  return choises[choice]
}
function chooseNewDirection(choises) {
  const choice = Math.floor(Math.random()*choises.length)
  return choises[choice]
}

function makeStartMove(tiles) {
  const [x,y] = world.start
  world.previous.location = world.current.location = ['start', x,y]
  world.current.location = makeMove(tiles)
  tiles[x][y].move = world.current.location[0]
}

function followMaze(x,y,move) {
  if( move === 'right') return [1,0]
  if( move === 'left') return [-1,0]
  if( move === 'up') return [0,-1]
  if( move === 'down') return [0,+1]
  throw new Error('no route found')
}

var count = 0
function findCrossroads(x,y, tiles) {
  if( count > 300) throw new Error('hi')
  do {
    const {move} = tiles[x][y]
    const choises = getChoises(x,y, tiles)
    if( choises.length === 0 ||
      ( x === world.start[0] && y === world.start[1] )) {
      [dx,dy] = followMaze(x,y, move)
      x += dx
      y += dy
      //console.log({x,y,move, count})
      count++
      continue  
    }
    else {
      console.log('found choises', choises)
       return [x,y, choises]
    }
  } while ( x !== undefined)
  return [undefined]
}


function crossRoadTileName(x,y, newDirection, tiles) {
  const current = tiles[x][y]
  let walls =  [ 'up', 'down', 'left', 'right' ]
    .filter(w => w !== newDirection[0] && w !== current.move && w !== current.back)
  if( walls.length !== 1 ) {
    console.log('can not add crossroads', {x,y,current,newDirection})
    throw('bye')
  }
  const wall = walls[0]
  
  if( wall === 'up' ) return  LEFT_RIGHT_DOWN  
  if( wall === 'down') return LEFT_RIGHT_UP 
  if( wall === 'left') return UP_DOWN_RIGHT 
  return UP_DOWN_LEFT
}


function backWard(move) {
  if( move === 'right' ) return 'left'
  if( move === 'left' ) return 'right'
  if( move === 'up' ) return 'down'
  if( move === 'down' ) return 'up'
  return 'dead-end'
}
function placeTile(x,y, name, tile, move, back, tiles, turn) {
  tile.name = name
  tile.x = x * 20
  tile.y = y * 20
  tile.anchor.x = 0.5
  tile.anchor.y = 0.5
  tiles[x][y] = {tile,name, move, back, turn}
}

// load the texture we need
app.loader.add('tileset', 'tileset.png').load((loader, resources) => {
  // This creates a texture from a 'bunny.png' image
  const tileset = PIXI.utils.TextureCache['tileset.png']

 const textures = [...Array(6).keys()]. map((x) => makeTexture(x, 0, tileset))


   let star = makeNamedTile(STAR, tileset)
  //  star.x = world.width / 2 * 20
  //  star.y = world.height / 2 * 20
  //  star.anchor.x = 0.5
  //  star.anchor.y = 0.5



  const grid = [...Array(40).keys()].map((x) => [...Array(40).keys()])
  const tiles = grid.map((row, y) =>
    row.map((column, x) => {
      //const tile = randomTile(textures)
      const name = isStart(x,y) || isEnd(x,y) ? STAR : EMPTY
      const tile = makeNamedTile(name, tileset)
      tile.x = x * 20
      tile.y = y * 20
      tile.anchor.x = 0.5
      tile.anchor.y = 0.5
      if( isEnd(x,y)) {
       star = tile 
      }

      app.stage.addChild(tile)
      return {name,tile}
    })
  )

  let life = 0
  // count the first position

  makeStartMove(tiles)

  // Listen for frame updates
  app.ticker.add(() => {
    star.rotation += 0.03
    ++life
    if (life % 1 === 0 ) {
      world.previous.location = [...world.current.location]
      let [lastMove,x,y] = world.current.location
      try {
         world.current.location = makeMove(tiles)
      } catch(error) {
        const tile = makeNamedTile(DEAD_END, tileset)
        placeTile(x,y, DEAD_END, tile, 'dead-end', backWard(lastMove), tiles)
        app.stage.addChild(tile)
        console.log('added_dead')
        const [sx,sy] = world.start 
        const crossRoads = findCrossroads(sx,sy, tiles)
        //console.log(tiles[sx][sy], JSON.stringify(crossRoads,null,2))
        if( !crossRoads[0]) {
          throw new Error('all routes done')
        } 
        else {
          // TODO make crossroads
          [x,y, choises] = crossRoads
          const newDirection = chooseNewDirection(choises)
          const crName = crossRoadTileName(x,y,newDirection, tiles)
          const crTile = makeNamedTile(crName, tileset)
          const {move, back} = tiles[x][y]
          //app.stage.removeChild(tiles[x][y].tile)
          console.log({x,y,crName,move,back,turn: newDirection[0]})
          placeTile(x,y, crName, crTile, move,back, tiles, newDirection[0])
          app.stage.addChild(crTile)
          world.current.location = newDirection
          if( count === 100) throw new Error('hi')

          return
          //console.log(JSON.stringify(world,null,2))
          throw new Error('hi')
        }
      }
      const [move] = world.current.location

      const name = getNextTileName(move, lastMove)
      //console.log({lastMove, move, name, x, y})
      //app.stage.removeChild(tiles[x][y].tile)
      const tile = makeNamedTile(name, tileset)
      placeTile(x,y, name, tile, move, backWard(lastMove), tiles)
      app.stage.addChild(tile)
    }
  })
})

document.addEventListener('keydown', (event) => {
  const keyName = event.key;

  if (keyName === 'Control') {
    // do not alert when only Control key is pressed.
    return;
  }

  if (event.ctrlKey) {
    console.log(`Combination of ctrlKey + ${keyName}`);
  } else {
    console.log(`Key pressed ${keyName}`);
  }
}, false);
console.log(app)
