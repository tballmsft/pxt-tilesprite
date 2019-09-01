// Rules of the game:

// BASIC
// X Player removes Dirt on tile it occupies (dirt->space)
// X Dirt/Wall are non-movable items (NMI) - they never move
// X Player/Rocks/Diamonds/Enemies/Pets are MI
// X MI (except Player) can only move in space (blocked by NMI)
// - Strong Walls can never be destroyed 
// X Diamonds can be collected by player (collect them all to win level)
// X a diamond is a rock (follows rules of rocks)
// X Rocks fall down if space below
// X player/enemy dies if MI moves onto its tile
// X rock (on rock) will move LD or RD (if space permits)
// X player can push a (single) rock L or R (space permitting)

// ADVANCED
// - Tough enemy don't get killed by explosion
// - Enemies that collide with Pets yield explosions
// - Explosions destroy ???
// - Rock falling on Dynamite triggers explosion

import ts = tilesprite

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

// this is now generic
type GameState = {
    [key: number]: ts.TileSprite[];
    tileMap: Image;
    spritesMap: Image;
}

// description of sprites
type Description = { c: codes, a: Image, sk: number, t: Image }

let spriteDescriptions = [
    { c: codes.Rock, a: art.Rock, sk: SpriteKind.Projectile, t: art.Space },
    { c: codes.Diamond, a: art.Diamond, sk: SpriteKind.Food, t: art.Space },
    { c: codes.Enemy, a: art.Enemy, sk: SpriteKind.Enemy, t: art.Space },
    { c: codes.Player, a: art.Player, sk: SpriteKind.Player, t: art.Space }
];

// place sprites to eliminate spaces
function placeSprites(gameState: GameState) {
    gameState.spritesMap.copyFrom(gameState.tileMap)
    function place(sprites: ts.TileSprite[], code: number) {
        for (let s of sprites) {
            gameState.spritesMap.setPixel(s.getColumn(), s.getRow(), code)
        }
    }
    // TODO: if multiple sprites occupy tile, we may want to break ties
    place(gameState[codes.Rock], codes.Rock)
    place(gameState[codes.Diamond], codes.Diamond)
    // todo: enemies, dynamite, etc.
    // todo: is the enemy stationary or moving?
}

function setScene(img: Image): GameState {
    // copy it, as it will be updated
    let tileMap = img.clone()
    // convert image to tile map
    scene.setTileMap(tileMap)
    // don't use any physics collisions on tile sprites
    // as we change these dynamically instead
    // TODO: need to abstract the following
    scene.setTile(codes.Dirt, art.Dirt)
    scene.setTile(codes.Wall, art.Wall)
    scene.setTile(codes.StrongWall, art.Wall)
    scene.setTile(codes.Player, art.Space)
    scene.setTile(codes.Space, art.Space)
    scene.setTile(codes.Diamond, art.Space)
    scene.setTile(codes.Rock, art.Space)
    scene.setTile(codes.Enemy, art.Space)

    let gameState: GameState = {
        tileMap: tileMap,
        spritesMap: tileMap.clone()
    }

    let spriteCodes: codes[] = []
    for (let sd of spriteDescriptions) {
        let tiles = scene.getTilesByType(sd.c)
        gameState[sd.c] = []
        spriteCodes.push(sd.c)
        for (let value of tiles) {
            let sprite = sprites.create(sd.a, sd.sk)
            let tileSprite = new ts.TileSprite(sprite)
            gameState[sd.c].push(tileSprite)
            value.place(sprite)
        }
    }

    // now that we have created sprites, remove them from the tile map
    for (let y = 0; y < tileMap.height; y++) {
        for (let x = 0; x < tileMap.width; x++) {
            let pixel = tileMap.getPixel(x, y)
            if (spriteCodes.find(c => c == pixel)) {
                tileMap.setPixel(x, y, codes.Space)
            }
        }
    }
    placeSprites(gameState)
    return gameState
}

let gameState = setScene(levels.level1)
function player(): ts.TileSprite {
    return <ts.TileSprite>(<any>gameState[codes.Player][0])
}
ts.bindToController(player(), playerMoves)
scene.cameraFollowSprite(player().sprite)

function findInTile(code: codes, col: number, row: number) {
    return gameState[code].find(function (value: ts.TileSprite, index: number) {
        return (value.getColumn() == col && value.getRow() == row)
    })
}

function playerCanMoveTo(col: number, row: number) {
    let value = gameState.spritesMap.getPixel(col, row)
    return value == codes.Space || value == codes.Dirt || value == codes.Diamond || value == codes.Enemy
}

function playerMoves(player: ts.TileSprite, dir: ts.MoveDirection) {
    let col = player.getColumn()
    let row = player.getRow()
    if (dir == ts.MoveDirection.Left) {
        if (playerCanMoveTo(col - 1, row))
            return true
        if (gameState.spritesMap.getPixel(col - 1, row) == codes.Rock &&
            gameState.spritesMap.getPixel(col - 2, row) == codes.Space) {
            let rock = findInTile(codes.Rock, col - 1, row)
            rock.move(ts.MoveDirection.Left, false)
            return true
        }
    } else if (dir == ts.MoveDirection.Right) {
        if (playerCanMoveTo(col + 1, row))
            return true
        if (gameState.spritesMap.getPixel(col + 1, row) == codes.Rock &&
            gameState.spritesMap.getPixel(col + 2, row) == codes.Space) {
            let rock = findInTile(codes.Rock, col + 1, row)
            rock.move(ts.MoveDirection.Right, false)
            return true
        }
    } else if (dir == ts.MoveDirection.Down && playerCanMoveTo(col, row + 1) ||
        dir == ts.MoveDirection.Up && playerCanMoveTo(col, row - 1)) {
        return true
    }
    return false
}

function isRock(col: number, row: number) {
    let value = gameState.spritesMap.getPixel(col, row)
    return value == codes.Rock || value == codes.Diamond

}
function isSpace(col: number, row: number) {
    let value = gameState.spritesMap.getPixel(col, row)
    return value == codes.Space && !(col == player().getColumn() &&
        row == player().getRow())
}

function checkRock(rock: ts.TileSprite) {
    let col = rock.getColumn()
    let row = rock.getRow()
    if (rock.sprite.vy == 0) {
        if (isSpace(col, row + 1)) {
            // if there is space under rock, fall
            rock.move(ts.MoveDirection.Down)
            return;
        }
        // stationary rock can also fall to left/right
        if (rock.sprite.vx == 0 && isRock(col, row + 1) && !isRock(col, row - 1)) {
            // rock is on top of rock pile
            let fallLeftOK = isSpace(col - 1, row) && isSpace(col - 1, row + 1)
            let fallRightOK = isSpace(col + 1, row) && isSpace(col + 1, row + 1)
            if (fallLeftOK && fallRightOK) {
                let choose = Math.pickRandom([true, false])
                fallLeftOK = choose
                fallRightOK = !choose
            }
            if (fallLeftOK) {
                rock.move(ts.MoveDirection.Left, false)
            } else if (fallRightOK) {
                rock.move(ts.MoveDirection.Right, false)
            }
        }
    }
}

for (let r of gameState[codes.Rock]) { addRockHandler(r) }
for (let r of gameState[codes.Diamond]) { addRockHandler(r) }

function startFalling(gameState: GameState) {
    for (let r of gameState[codes.Rock]) { checkRock(r) }
    for (let r of gameState[codes.Diamond]) { checkRock(r) }
}

game.onUpdate(function () {
    placeSprites(gameState);
    player().update();
    for (let r of gameState[codes.Rock]) { r.update() }
    for (let r of gameState[codes.Diamond]) { r.update() }
    startFalling(gameState);
})

// add handlers for rock to stop when falling onto dirt
function addRockHandler(rock: ts.TileSprite) {
    function rockStops(col: number, row: number) {
        // if we are above dirt or rock, then stop
        let value = gameState.spritesMap.getPixel(col, row)
        return value == codes.Dirt || value == codes.Rock || value == codes.Diamond
            || value == codes.Wall || value == codes.StrongWall
    }
    rock.onTileArrived(function (s: ts.TileSprite) {
        let col = s.getColumn(), row = s.getRow()
        if (s.sprite.vy > 0 && rockStops(col, row + 1)) {
            // falling rock stopped by barrier
            s.deadStop()
        } else {
            s.doQueued()
            // horizontally moving rock
            if (!rockStops(col, row + 1)) {
                // falls if there's a hole
                s.deadStop();
                s.move(ts.MoveDirection.Down)
            }
        }
    })
}

player().onTileTransition(function (ts: ts.TileSprite) {
    let col = ts.getColumn()
    let row = ts.getRow()
    if (gameState.spritesMap.getPixel(col, row) == codes.Diamond) {
        // TODO: player overwrites diamond
        // check for (stationary) diamond in tile
        // when we run into a (non-moving) diamond, we eat it
        let diamond = findInTile(codes.Diamond, col, row)
        if (diamond != null) {
            gameState[codes.Diamond].removeElement(diamond)
            diamond.sprite.destroy()
            if (gameState[codes.Diamond].length == 0) {
                game.showDialog("Got All Diamonds!", "")
            }
        }
    }
})

player().onTileArrived(function (player: ts.TileSprite) {
    player.doQueued()
    // try to keep moving in current direction
    if (!playerMoves(player, player.getDirection()))
        player.deadStop()
    // whereever player goes, replace with space
    gameState.tileMap.setPixel(player.getColumn(), player.getRow(), codes.Space);
})

// all collision detection here:

// a moving diamond kills us
sprites.onOverlap(SpriteKind.Player, SpriteKind.Food, function (sprite: Sprite, diamond: Sprite) {

})

sprites.onOverlap(SpriteKind.Player, SpriteKind.Projectile, function (sprite: Sprite, rock: Sprite) {
    // when we run into a moving rock we die
})

// unfortunately, we need this because multiple rocks can be in motion at the same time
function findRock(sprite: Sprite) {
    let ret = gameState[codes.Rock].find((t: ts.TileSprite) => t.sprite == sprite)
    if (!ret) {
        ret = gameState[codes.Diamond].find((t: ts.TileSprite) => t.sprite == sprite)
    }
    return ret
}
sprites.onOverlap(SpriteKind.Projectile, SpriteKind.Projectile, function (sprite: Sprite, otherSprite: Sprite) {
    findRock(sprite).deadStop(true)
})
sprites.onOverlap(SpriteKind.Food, SpriteKind.Food, function (sprite: Sprite, otherSprite: Sprite) {
    findRock(sprite).deadStop(true)
})
sprites.onOverlap(SpriteKind.Projectile, SpriteKind.Food, function (sprite: Sprite, otherSprite: Sprite) {
    findRock(sprite).deadStop(true)
})
sprites.onOverlap(SpriteKind.Food, SpriteKind.Projectile, function (sprite: Sprite, otherSprite: Sprite) {
    findRock(sprite).deadStop(true)
})
