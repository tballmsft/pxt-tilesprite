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

import tw = TileWorld

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

let spriteDescriptions: tw.Description[] = [
    { c: codes.Rock, a: art.Rock, sk: SpriteKind.Projectile, t: codes.Space },
    { c: codes.Diamond, a: art.Diamond, sk: SpriteKind.Food, t: codes.Space },
    { c: codes.Enemy, a: art.Enemy, sk: SpriteKind.Enemy, t: codes.Space },
    { c: codes.Player, a: art.Player, sk: SpriteKind.Player, t: codes.Space },
    { c: codes.Wall, a: art.Wall, sk: undefined, t: undefined },
    { c: codes.StrongWall, a: art.Wall, sk: undefined, t: undefined },
    { c: codes.Space, a: art.Space, sk: undefined, t: undefined },
    { c: codes.Dirt, a: art.Dirt, sk: undefined, t: undefined }
];

let world = tw.setScene(levels.level1, spriteDescriptions)
function player(): tw.TileSprite {
    return <tw.TileSprite>(<any>world[codes.Player][0])
}
tw.bindToController(player(), playerMoves)
scene.cameraFollowSprite(player())

function findInTile(code: codes, path: tw.Path) {
    return world[code].find(function (value: tw.TileSprite, index: number) {
        return (value.getColumn() == path.getColumn() && value.getRow() == path.getRow())
    })
}

function stopsRocks(value: number) {
    return value == codes.Dirt || value == codes.Rock || value == codes.Diamond
        || value == codes.Wall || value == codes.StrongWall
}

function playerOK(p: tw.Path) {
    let value = getTile(p)
    return value == codes.Space || value == codes.Dirt || value == codes.Diamond
        || value == codes.Enemy
}

function getTile(p: tw.Path) {
    return world.spritesMap.getPixel(p.getColumn(), p.getRow())
}

// p.left \in  
// condition: p.left = rock and p.left.left = space
// action p.move.left and p.left.move.left

function playerMoves(player: tw.TileSprite, dir: tw.Dir) {
    let tile = player.Path(dir)
    if (playerOK(tile))
        return true
    if (dir == tw.Dir.Left || dir == tw.Dir.Right) {
        if (getTile(tile) == codes.Rock &&
            getTile(tile.Next(dir)) == codes.Space) {
            let rock = findInTile(codes.Rock, tile.Origin())
            rock.move(dir, false)
            return true
        }
    }
    return false
}

function isRock(p: tw.Path) {
    let value = getTile(p)
    return value == codes.Rock || value == codes.Diamond

}
function isSpace(p: tw.Path) {
    let value = getTile(p)
    return value == codes.Space && !(p.getColumn() == player().getColumn() &&
        p.getRow() == player().getRow())
}

function checkRock(rock: tw.TileSprite) {
    let below = rock.Path(tw.Dir.Down)
    if (isSpace(below)) {
        rock.move(tw.Dir.Down)
        return;
    }
    if (rock.inMotion() == tw.Dir.None && isRock(below)) {
        let above = rock.Path(tw.Dir.Up)
        if (!isRock(above)) {
            let same = rock.Path(tw.Dir.None)
            let fallLeftOK = isSpace(same.Next(tw.Dir.Left)) && isSpace(below.Next(tw.Dir.Left))
            same.Origin(); below.Origin()
            let fallRightOK = isSpace(same.Next(tw.Dir.Right)) && isSpace(below.Next(tw.Dir.Right))
            if (fallLeftOK && fallRightOK) {
                let choose = Math.pickRandom([true, false])
                fallLeftOK = choose
                fallRightOK = !choose
            }
            if (fallLeftOK) {
                rock.move(tw.Dir.Left, false)
            } else if (fallRightOK) {
                rock.move(tw.Dir.Right, false)
            }
        }
    }
}

for (let r of world[codes.Rock]) { addRockHandler(r) }
for (let r of world[codes.Diamond]) { addRockHandler(r) }

function startFalling(world: tw.WorldState) {
    for (let r of world[codes.Rock]) { checkRock(r) }
    for (let r of world[codes.Diamond]) { checkRock(r) }
}

// place sprites to eliminate spaces
function placeSprites(world: tw.WorldState) {
    world.spritesMap.copyFrom(world.tileMap)
    function place(sprites: tw.TileSprite[], code: number) {
        for (let s of sprites) {
            world.spritesMap.setPixel(s.getColumn(), s.getRow(), code)
        }
    }
    // TODO: if multiple sprites occupy tile, we may want to break ties
    place(world[codes.Rock], codes.Rock)
    place(world[codes.Diamond], codes.Diamond)
    // todo: enemies, dynamite, etc.
    // todo: is the enemy stationary or moving?
}

game.onUpdate(function () {
    placeSprites(world);
    player().update();
    for (let r of world[codes.Rock]) { r.update() }
    for (let r of world[codes.Diamond]) { r.update() }
    startFalling(world);
})

// add handlers for rock to stop when falling onto dirt
function addRockHandler(rock: tw.TileSprite) {
    function stop(col: number, row: number) {
        // if we are above dirt or rock, then stop
        return stopsRocks(world.spritesMap.getPixel(col, row))
    }
    rock.onTileArrived(function (s: tw.TileSprite) {
        let col = s.getColumn(), row = s.getRow()
        if (s.vy > 0 && stop(col, row + 1)) {
            // falling rock stopped by barrier
            s.deadStop()
        } else {
            s.doQueued()
            // horizontally moving rock
            if (!stop(col, row + 1)) {
                // falls if there's a hole
                s.deadStop();
                s.move(tw.Dir.Down)
            }
        }
    })
}

player().onTileTransition(function (sprite: tw.TileSprite) {
    let col = sprite.getColumn()
    let row = sprite.getRow()
    if (world.spritesMap.getPixel(col, row) == codes.Diamond) {
        // TODO: player overwrites diamond
        // check for (stationary) diamond in tile
        // when we run into a (non-moving) diamond, we eat it
        let diamond = findInTile(codes.Diamond, sprite.Path(tw.Dir.None))
        if (diamond != null) {
            world[codes.Diamond].removeElement(diamond)
            diamond.destroy()
            if (world[codes.Diamond].length == 0) {
                game.showDialog("Got All Diamonds!", "")
            }
        }
    }
})

player().onTileArrived(function (player: tw.TileSprite) {
    player.doQueued()
    // try to keep moving in current direction
    if (!playerMoves(player, player.getDirection()))
        player.deadStop()
    // whereever player goes, replace with space
    world.tileMap.setPixel(player.getColumn(), player.getRow(), codes.Space);
})

// all collision detection here:

// a moving diamond kills us
sprites.onOverlap(SpriteKind.Player, SpriteKind.Food, function (sprite: Sprite, diamond: Sprite) {

})

sprites.onOverlap(SpriteKind.Player, SpriteKind.Projectile, function (sprite: Sprite, rock: Sprite) {
    // when we run into a moving rock we die
})

// unfortunately, we need this because multiple rocks can be in motion at the same time
sprites.onOverlap(SpriteKind.Projectile, SpriteKind.Projectile, function (sprite: Sprite, otherSprite: Sprite) {
    (<tw.TileSprite>sprite).deadStop(true)
})
sprites.onOverlap(SpriteKind.Food, SpriteKind.Food, function (sprite: Sprite, otherSprite: Sprite) {
    (<tw.TileSprite>sprite).deadStop(true)
})
sprites.onOverlap(SpriteKind.Projectile, SpriteKind.Food, function (sprite: Sprite, otherSprite: Sprite) {
    (<tw.TileSprite>sprite).deadStop(true)
})
sprites.onOverlap(SpriteKind.Food, SpriteKind.Projectile, function (sprite: Sprite, otherSprite: Sprite) {
    (<tw.TileSprite>sprite).deadStop(true)
})
