// Rules of the game:

// BASIC
// X Player removes Dirt on tile it occupies (dirt->space)
// X Dirt/Wall are non-movable items (NMI) - they never move
// - Player/Rocks/Diamonds/Enemies/Pets are MI
// - MI (except Player) can only move in space (blocked by NMI)
// - Strong Walls can never be destroyed 
// X Diamonds can be collected by player (collect them all to win level)
// X a diamond is a rock (follows rules of rocks)
// X Rocks fall down if space below
// - player/enemy dies if MI moves onto its tile
// X rock (on rock) will move LD or RD (if space permits)
// X player can push a (single) rock L or R (space permitting)

// ADVANCED
// - Tough enemy don't get killed by explosion
// - Enemies that collide with Pets yield explosions
// - Explosions destroy ???
// - Rock falling on Dynamite triggers explosion

enum codes {
    StrongWall = 0xc,
    Dirt = 0xd,
    Player = 0x7,
    Wall = 0xa,
    Space = 0x1,
    Enemy = 0x2,
    Diamond = 0x6,
    Rock = 0xb,
    SpriteHere = 0
}
// others to follow:
// Dynamite
// Explosion
// Pet

namespace art {
    export let Player = img`
        . . . . . . f f f f . . . . . .
        . . . . f f f 2 2 f f f . . . .
        . . . f f f 2 2 2 2 f f f . . .
        . . f f f e e e e e e f f f . .
        . . f f e 2 2 2 2 2 2 e e f . .
        . . f e 2 f f f f f f 2 e f . .
        . . f f f f e e e e f f f f . .
        . f f e f b f 4 4 f b f e f f .
        . f e e 4 1 f d d f 1 4 e e f .
        . . f e e d d d d d d e e f . .
        . . . f e e 4 4 4 4 e e f . . .
        . . e 4 f 2 2 2 2 2 2 f 4 e . .
        . . 4 d f 2 2 2 2 2 2 f d 4 . .
        . . 4 4 f 4 4 5 5 4 4 f 4 4 . .
        . . . . . f f f f f f . . . . .
        . . . . . f f . . f f . . . . .
    `
    export let Rock = img`
        . . . . . c c b b b . . . . . .
        . . . . c b d d d d b . . . . .
        . . . . c d d d d d d b b . . .
        . . . . c d d d d d d d d b . .
        . . . c b b d d d d d d d b . .
        . . . c b b d d d d d d d b . .
        . c c c c b b b b d d d b b b .
        . c d d b c b b b b b b b b d b
        c b b d d d b b b b b d d b d b
        c c b b d d d d d d d b b b d c
        c b c c c b b b b b b b d d c c
        c c b b c c c c b d d d b c c b
        . c c c c c c c c c c c b b b b
        . . c c c c c b b b b b b b c .
        . . . . . . c c b b b b c c . .
        . . . . . . . . c c c c . . . .
    `
    export let Dirt = img`
        f e e e e e f e e e e 4 4 4 4 e
        e e 4 4 e e e f f f e e e e e e
        e 4 4 4 4 4 e e f f f f f e e e
        e 4 4 4 4 4 4 e f e e e e e f e
        e 4 4 4 4 4 4 e f e 4 4 4 4 e f
        e e 4 4 4 4 4 f e 4 4 4 4 4 4 e
        e e e 4 4 4 e e e 4 4 4 4 4 4 e
        f f e e e e e f e 4 4 4 4 4 4 e
        f e e e 4 4 4 e f e 4 4 4 4 e e
        f e e 4 4 4 4 4 e e e e 4 4 e f
        e e 4 4 4 4 4 4 4 e f e e e e f
        f e 4 4 4 4 4 4 4 e e f f f e e
        f e 4 4 4 4 4 4 4 e f e e e e f
        e f e 4 4 4 4 4 e f e 4 4 e e e
        e e f e 4 4 4 e f e 4 4 4 4 e e
        f e e f e e e f e 4 4 4 4 4 4 e
    `
    export let Space = img`
        f f f f f f f f f f f c c c c f
        f f c c f f f f f f f f f f f f
        f c c c c c f f f f f f f f f f
        f c c c c c c f f f f f f f f f
        f c c c c c c f f f c c c c f f
        f f c c c c c f f c c c c c c f
        f f f c c c f f f c c c c c c f
        f f f f f f f f f c c c c c c f
        f f f f c c c f f f c c c c f f
        f f f c c c c c f f f f c c f f
        f f c c c c c c c f f f f f f f
        f f c c c c c c c f f f f f f f
        f f c c c c c c c f f f f f f f
        f f f c c c c c f f f c c f f f
        f f f f c c c f f f c c c c f f
        f f f f f f f f f c c c c c c f
    `
    export let Diamond = img`
        . . . . 8 8 8 8 8 8 8 8 . . . .
        . . . 8 8 9 9 9 9 9 9 1 1 . . .
        . . 8 8 8 8 9 9 9 9 1 1 1 1 . .
        . 8 8 8 8 8 8 9 9 1 1 1 1 1 1 .
        8 8 8 8 8 8 8 8 1 1 1 1 1 1 1 1
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 1 1 1 1 1 1 1 1
        . 9 9 9 9 9 9 9 1 1 1 1 1 1 1 .
        . . 9 9 9 9 9 9 1 1 1 1 1 1 . .
        . . . 9 9 9 9 9 1 1 1 1 1 . . .
        . . . . 9 9 9 9 1 1 1 1 . . . .
        . . . . . 9 9 9 1 1 1 . . . . .
        . . . . . . 9 9 1 1 . . . . . .
        . . . . . . . 9 1 . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
    `
    export let Wall = img`
        d d d d d d d d d d d d d d d 8
        d 6 6 6 8 8 8 6 6 6 6 6 6 6 8 8
        d 6 6 8 6 6 6 8 6 6 6 6 6 6 8 8
        d 6 8 6 8 8 8 6 8 8 8 8 8 8 8 8
        d 8 6 8 8 d 8 8 6 6 6 6 6 6 8 8
        d 8 6 8 d d d 8 6 8 8 8 8 8 6 8
        d 8 6 8 8 d 8 8 6 6 6 6 6 6 8 8
        d 6 8 6 8 8 8 6 8 8 8 8 8 8 8 8
        d 6 6 6 6 6 6 6 6 8 6 6 6 6 8 8
        d 8 8 8 6 6 6 6 6 8 8 6 6 8 6 8
        d 6 6 6 6 6 6 6 6 8 8 8 8 8 6 8
        d 8 8 8 6 6 6 6 6 6 6 6 6 6 6 8
        d 6 6 6 6 6 6 6 6 6 6 6 6 6 6 8
        d 8 8 8 8 6 6 6 6 8 8 8 8 8 6 8
        d 6 6 6 6 6 6 6 8 8 6 6 6 8 6 8
        8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8
    `
    export let Enemy = img`
        . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . f f f f . . . . . . . . . .
        . . . . . . . . f f 1 1 1 1 f f . . . . . . . .
        . . . . . . . f b 1 1 1 1 1 1 b f . . . . . . .
        . . . . . . . f 1 1 1 1 1 1 1 1 f . . . . . . .
        . . . . . . f d 1 1 1 1 1 1 1 1 d f . . . . . .
        . . . . . . f d 1 1 1 1 1 1 1 1 d f . . . . . .
        . . . . . . f d d d 1 1 1 1 d d d f . . . . . .
        . . . . . . f b d b f d d f b d b f . . . . . .
        . . . . . . f c d c f 1 1 f c d c f . . . . . .
        . . . . . . . f b 1 1 1 1 1 1 b f . . . . . . .
        . . . . . . f f f c d b 1 b d f f f f . . . . .
        . . . . f c 1 1 1 c b f b f c 1 1 1 c f . . . .
        . . . . f 1 b 1 b 1 f f f f 1 b 1 b 1 f . . . .
        . . . . f b f b f f f f f f b f b f b f . . . .
        . . . . . . . . . f f f f f f . . . . . . . . .
        . . . . . . . . . . . f f f . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . .
    `
}

namespace levels {
    export let level1 =
        img`
            c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c
            c d d d d d d d d d d b d d d d d d b d d d d d d d d d d d d c
            c d d d d d 6 d d d d b d d d d d d b d d d d d d d d d d d d c
            c d d 7 d d b d d d d b d d d d d d b d d d d b d d d d d d d c
            c d d d d d d d d d d d d d d d d d b 1 1 d d d d d d b d d d c
            c a a a a a a a a a a a a a a a a a a 1 1 d d d d d b d d d d c
            c d d d d d d d d d d d d d d d d d d 1 1 d d d 6 b b b b b d c
            c d d d b d d d d d d d d d d d d d d 1 1 6 d d d d b d d d d c
            c d d d d d d d d d d d d d d 6 d d d 1 1 d d d d d d b d d d c
            c d d d d d d d d a a a a a a a a a a a a a a a a a a a a a a c
            c d 1 d d d d 6 d d d d d d d d 1 1 1 1 1 1 1 1 1 1 2 d d d d c
            c d 1 1 d d b b b d d d d d d d d d d d d 6 d d d d d d d d d c
            c d 1 d d d d 6 d d d d d d d d d d d d 6 6 6 d d d d d d d d c
            c d b d d d d d d d d d d d d d d d d d d 6 d d d d d d d d d c
            c d d d d d d d d d d d d d d d d d d d d d d d d d d d d d d c
            c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c
        `
}

type GameState = {
    player: tilesprite.TileSprite
    rocks: tilesprite.TileSprite[]
    tileMap: Image;
    spritesMap: Image;
}


function setScene(img: Image): GameState {
    // copy it, as it will be updated
    let tileMap = img.clone()
    // convert image to tile map
    scene.setTileMap(tileMap)
    scene.setTile(codes.Dirt, art.Dirt)
    scene.setTile(codes.Wall, art.Wall, true)
    scene.setTile(codes.StrongWall, art.Wall, true)
    scene.setTile(codes.Player, art.Space)
    scene.setTile(codes.Space, art.Space)
    scene.setTile(codes.Diamond, art.Space)
    scene.setTile(codes.Rock, art.Space)
    scene.setTile(codes.Enemy, art.Space)

    let gameState: GameState = { player: null, rocks: [], tileMap: tileMap, spritesMap: tileMap.clone() }

    let players = scene.getTilesByType(codes.Player)
    control.assert(players.length == 1, 0)
    let player = sprites.create(art.Player, SpriteKind.Player)
    players[0].place(player)
    // make the player sprite snap to tile grid
    gameState.player = new tilesprite.TileSprite(player)
    // bind it to L,R,U,D buttons
    tilesprite.bindToController(gameState.player)
    scene.cameraFollowSprite(player)

    let diamonds = scene.getTilesByType(codes.Diamond)
    for (let value of diamonds) {
        let diamond = sprites.create(art.Diamond, SpriteKind.Food)
        gameState.rocks.push(new tilesprite.TileSprite(diamond))
        value.place(diamond)
    }
    let rocks = scene.getTilesByType(codes.Rock)
    for (let value of rocks) {
        let rock = sprites.create(art.Rock, SpriteKind.Projectile)
        gameState.rocks.push(new tilesprite.TileSprite(rock))
        value.place(rock)
    }
    let enemies = scene.getTilesByType(codes.Enemy)
    for (let value of enemies) {
        let enemy = sprites.create(art.Enemy, SpriteKind.Enemy)
        value.place(enemy)
    }

    // now, remove the diamonds, rocks and enemies
    for (let y = 0; y < tileMap.height; y++) {
        for (let x = 0; x < tileMap.width; x++) {
            let pixel = tileMap.getPixel(x, y)
            if (pixel == codes.Diamond || pixel == codes.Rock ||
                pixel == codes.Enemy || pixel == codes.Player) {
                tileMap.setPixel(x, y, codes.Space)
            }
        }
    }
    placeSprites(gameState)
    return gameState
}

// create map in which the pixels with codes.Space are unoccupied
function placeSprites(gameState: GameState) {
    gameState.spritesMap.copyFrom(gameState.tileMap)
    function placeSprites(sprites: Sprite[]) {
        for (let s of sprites) {
            gameState.spritesMap.setPixel(s.x >> 4, s.y >> 4, codes.SpriteHere)
        }
    }
    placeSprites(sprites.allOfKind(SpriteKind.Food))
    placeSprites(sprites.allOfKind(SpriteKind.Projectile))
    placeSprites(sprites.allOfKind(SpriteKind.Enemy))
    placeSprites(sprites.allOfKind(SpriteKind.Player))
}

function startFalling(gameState: GameState) {
    for (let rock of gameState.rocks) {
        // only applies to stationary rocks
        if (rock.sprite.vx == 0 && rock.sprite.vy == 0) {
            // if there is space under rock 
            if (gameState.spritesMap.getPixel(rock.sprite.x >> 4, (rock.sprite.y >> 4) + 1) == codes.Space) {
                rock.move(tilesprite.MoveDirection.Down)
            }
            // TODO: check to left and below left
            // TODO: check to right and below right
        }
    }
}

let gameState = setScene(levels.level1)

// add handlers for rock to stop when falling onto dirt
for (let rock of gameState.rocks) {
    rock.onTileEnter(function (col: number, row: number) {
        // if we are above dirt, then stop
        return gameState.spritesMap.getPixel(col, row + 1) == codes.Dirt;
    })
}

game.onUpdate(function () {
    placeSprites(gameState);
    gameState.player.update()
    for (let rock of gameState.rocks) { rock.update() }
    startFalling(gameState)
})

// whereever player goes, replace with space
gameState.player.onTileEnter(function (col: number, row: number) {
    gameState.tileMap.setPixel(col, row, codes.Space);
    return false
})

// BUG: neither of these is firing
scene.onHitTile(codes.Wall, SpriteKind.Player, function (sprite: Sprite) {
    gameState.player.deadStop()
})
scene.onHitTile(codes.StrongWall, SpriteKind.Player, function (sprite: Sprite) {
    gameState.player.deadStop()
})

sprites.onOverlap(SpriteKind.Player, SpriteKind.Food, function (sprite: Sprite, otherSprite: Sprite) {
    // when we run into a (non-moving) diamond, we eat it
    if (otherSprite.vx == 0 && otherSprite.vy == 0) {
        otherSprite.destroy()
        //numDiamonds--
        //if (numDiamonds == 0) {
        //    game.showDialog("Got All Diamonds!", "")
        //}
    } else {
        // otherwise, we die
    }
})

sprites.onOverlap(SpriteKind.Player, SpriteKind.Projectile, function (sprite: Sprite, rock: Sprite) {
    // when we run into a (non-moving) rock we stop
    if (rock.vx == 0 && rock.vy == 0) {
        // unless there is an opportunity to push the rock
        // which depends on direction that the player is moving!
        if (gameState.player.getDirection() == tilesprite.MoveDirection.Right &&
            gameState.spritesMap.getPixel((rock.x >> 4) + 1, rock.y >> 4) == codes.Space)
            findRock(rock).move(tilesprite.MoveDirection.Right, true)
        else if (gameState.player.getDirection() == tilesprite.MoveDirection.Left &&
            gameState.spritesMap.getPixel((rock.x >> 4) - 1, rock.y >> 4) == codes.Space)
            findRock(rock).move(tilesprite.MoveDirection.Left, true)
        else
            gameState.player.deadStop()
        //}
    } else {
        // TODO: otherwise, we die
    }
})



function findRock(sprite: Sprite) {
    return gameState.rocks.find(ts => ts.sprite == sprite)
}

// TODO: rocks get stopped by dirt!
scene.onHitTile(codes.Dirt, SpriteKind.Projectile, function (sprite: Sprite) {
    findRock(sprite).deadStop()
})

sprites.onOverlap(SpriteKind.Projectile, SpriteKind.Projectile, function (sprite: Sprite, otherSprite: Sprite) {
    findRock(sprite).deadStop()
})
sprites.onOverlap(SpriteKind.Food, SpriteKind.Projectile, function (sprite: Sprite, otherSprite: Sprite) {
    findRock(sprite).deadStop()
})
sprites.onOverlap(SpriteKind.Food, SpriteKind.Food, function (sprite: Sprite, otherSprite: Sprite) {
    findRock(sprite).deadStop()
})
sprites.onOverlap(SpriteKind.Projectile, SpriteKind.Food, function (sprite: Sprite, otherSprite: Sprite) {
    findRock(sprite).deadStop()
})


