// import * as PIXI from 'pixi.js'

// The application will create a renderer using WebGL, if possible,
// with a fallback to a canvas render. It will also setup the ticker
// and the root stage PIXI.Container
const app = new PIXI.Application()
app.renderer.backgroundColor = 0xffffff //0x9fd0cf
app.renderer.resize(800, 800)

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
// load the texture we need
app.loader.add('bunny', 'tileset.png').load((loader, resources) => {
  // This creates a texture from a 'bunny.png' image
  const bunny = new PIXI.Sprite(resources.bunny.texture)

  // Setup the position of the bunny
  bunny.x = app.renderer.width / 2
  bunny.y = app.renderer.height / 2

  // Rotate around the center
  bunny.anchor.x = 0.5
  bunny.anchor.y = 0.5

  const tileset = PIXI.utils.TextureCache['tileset.png']

  let a = [...Array(6).keys()].map((x) => makeTile(x, 0, tileset))
  a.forEach((t, i) => {
    t.x = i * 20
    t.y = i * 20
    app.stage.addChild(t)
  })

  const textures = [...Array(6).keys()].map((x) => makeTexture(x, 0, tileset))
  const wall = randomTile(textures)
  wall.x = wall.y = 20
  app.stage.addChild(wall)

  const grid = [...Array(40).keys()].map((x) => [...Array(40).keys()])
  const tiles = grid.map((row, y) =>
    row.map((column, x) => {
      const tile = randomTile(textures)
      tile.x = x * 20
      tile.y = y * 20
      tile.anchor.x = 0.5
      tile.anchor.y = 0.5

      app.stage.addChild(tile)
      return tile
    })
  )

  // Add the bunny to the scene we are building
  app.stage.addChild(bunny)

  // Listen for frame updates
  app.ticker.add(() => {
    // each frame we spin the bunny around a bit
    bunny.rotation += 0.03
    tiles.map((r) => r.map((t) => (t.rotation += 0.01)))
  })
})

console.log(app)
