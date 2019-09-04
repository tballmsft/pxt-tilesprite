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
    Boulder = 0xb
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
    export let Boulder = img`
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
    { c: codes.Boulder, a: art.Boulder, sk: SpriteKind.Projectile, t: codes.Space },
    { c: codes.Diamond, a: art.Diamond, sk: SpriteKind.Food, t: codes.Space },
    { c: codes.Enemy, a: art.Enemy, sk: SpriteKind.Enemy, t: codes.Space },
    { c: codes.Player, a: art.Player, sk: SpriteKind.Player, t: codes.Space },
    { c: codes.Wall, a: art.Wall, sk: undefined, t: undefined },
    { c: codes.StrongWall, a: art.Wall, sk: undefined, t: undefined },
    { c: codes.Space, a: art.Space, sk: undefined, t: undefined },
    { c: codes.Dirt, a: art.Dirt, sk: undefined, t: undefined }
];

let world = new tw.TileWorldState(levels.level1, spriteDescriptions)
tw.bindToController(world.getPlayer(), playerMoves)
scene.cameraFollowSprite(world.getPlayer())

// predicates (sets)

function isWall(value: number) {
    return value == codes.Wall || value == codes.StrongWall
}

function isRock(value: number) {
    return value == codes.Boulder || value == codes.Diamond
}

function stopsRocks(value: number) {
    return isWall(value) || isRock(value) || value == codes.Dirt
}

function stopsPlayer(value: number) {
    return isWall(value) || value == codes.Boulder
}

// TODO: this code assumes lack of motion of rock
function playerMoves(player: tw.TileSprite, dir: tw.Dir) {
    let tile = player.Path(dir)
    if (!stopsPlayer(world.getTile(tile)))
        return true
    if (dir == tw.Dir.Left || dir == tw.Dir.Right) {
        if (world.getTile(tile) == codes.Boulder &&
            world.getTile(tile.Next(dir)) == codes.Space) {
            let rock = world.getSprite(codes.Boulder, tile.Origin())
            rock.move(dir, false)
            return true
        }
    }
    return false
}

function isSpace(p: tw.Path) {
    let value = world.getTile(p)
    return value == codes.Space
}

function rockfallDown(rock: tw.TileSprite) {
    let below = rock.Path(tw.Dir.Down)
    if (isSpace(below)) {
        rock.move(tw.Dir.Down)
        return true;
    }
    return false;
}

function rockOnTopofStack(rock: tw.TileSprite) {
    let below = rock.Path(tw.Dir.Down)
    if (isRock(world.getTile(below))) {
        let above = rock.Path(tw.Dir.Up)
        return !isRock(world.getTile(above))
    }
    return false
}

function spaceToFallOff(rock: tw.TileSprite, dir: tw.Dir) {
    let below = rock.Path(tw.Dir.Down)
    let same = rock.Path(tw.Dir.None)
    return isSpace(same.Next(dir)) && isSpace(below.Next(dir))
}

function rockfallSide(rock: tw.TileSprite) {
    if (rockOnTopofStack(rock)) {
        let fallLeftOK = spaceToFallOff(rock, tw.Dir.Left)
        let fallRightOK = spaceToFallOff(rock, tw.Dir.Right)
        if (fallLeftOK) {
            rock.move(tw.Dir.Left, false);
            return true
        } else if (fallRightOK) {
            rock.move(tw.Dir.Right, false)
            return true
        }
    }
    return false;
}

function rockfall(rock: tw.TileSprite) {
    return rock.inMotion() != tw.Dir.None ||
        rockfallDown(rock) || rockfallSide(rock)
}

// add handlers for rock to stop when falling onto dirt
function addRockHandlers(rock: tw.TileSprite) {
    // start a rockfall
    rock.onTileStationary(function (s: tw.TileSprite) {
        rockfall(s)
    })
    // deal with moving rock
    rock.onTileArrived(function (s: tw.TileSprite) {
        let below = s.Path(tw.Dir.Down)
        let stopRock = stopsRocks(world.getTile(below))
        if (s.inMotion() == tw.Dir.Down && stopRock) {
            // falling rock stopped by barrier
            s.deadStop()
        } else {
            s.doQueued()
            // horizontally moving rock
            if (!stopRock) {
                // falls if there's a hole
                s.deadStop();
                s.move(tw.Dir.Down)
            }
        }
    })
}

for (let r of world.getSpritesWithCode(codes.Boulder)) { addRockHandlers(r) }
for (let r of world.getSpritesWithCode(codes.Diamond)) { addRockHandlers(r) }

game.onUpdate(function () { world.update(); })

// TODO: this will go away
world.getPlayer().onTileTransition(function (sprite: tw.TileSprite) {
    let here = sprite.Path(tw.Dir.None)
    if (world.getTile(here) == -1) {
        let diamond = world.getSprite(codes.Diamond, here)
        if (diamond != null) {
            // world.sprites[codes.Diamond].removeElement(diamond)
            diamond.destroy()
        }
    }
})

world.getPlayer().onTileArrived(function (player: tw.TileSprite) {
    player.doQueued()
    // try to keep moving in current direction
    if (!playerMoves(player, player.getDirection()))
        player.deadStop()
    // whereever player goes, replace with space
    world.setTile(player.Path(tw.Dir.None), codes.Space);
})

world.onSpritesInTile(function (collision: tw.TileSprite[]) {
    // there are a few cases here to consider:
    // 1. all sprites are moving
    // 2. some are stationary, some are moving
    // 3. all are stationary (currently, won't happen)
    // there's also the question of the code of the sprite, and its kind

    // let's first deal with moving rocks
    // let onlyMovingRocks = collision.every((spr) => isRock(spr.code))
    // if (onlyMovingRocks) {
    //    collision[0].knockBack(true)
    //}
})

// here - we abstract to tiles rather than sprites colliding
// unfortunately, we need this because multiple rocks can be in motion at the same time
// for example, one entering tile from above, one entering from right

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
