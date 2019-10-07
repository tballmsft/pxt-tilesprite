/*
namespace SpriteKind {
    export const Rock = SpriteKind.create()
    export const Wall = SpriteKind.create()
    export const Dirt = SpriteKind.create()
    export const Space = SpriteKind.create()
}
TileWorld.onMoveRequest(SpriteKind.Player, function (direction) {
    TileWorld.setCode(1, _tileDir(TileDir.None))
    TileWorld.hasKind(SpriteKind.Wall, direction, _tileDir(TileDir.None), ResultSet.Zero)
    TileWorld.hasCode(11, direction, _tileDir(TileDir.None), ResultSet.Zero)
    TileWorld.moveSelf(direction)
})
TileWorld.setTileMap(img`
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
`)
TileWorld.setBackgroundTile(1)
TileWorld.addSprite(7, img`
    . . . . . . f f f f . . . . . .
    . . . . f f f 2 2 f f f . . . .
    . . . f f f 2 3 2 2 f f f . . .
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
`, Spritely.Movable, SpriteKind.Player)
TileWorld.addSprite(6, img`
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
`, Spritely.Movable, SpriteKind.Rock)
TileWorld.addSprite(11, img`
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
`, Spritely.Movable, SpriteKind.Rock)
TileWorld.addSprite(10, img`
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
`, Spritely.Fixed, SpriteKind.Wall)
TileWorld.addSprite(12, img`
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
`, Spritely.Fixed, SpriteKind.Wall)
TileWorld.addSprite(13, img`
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
`, Spritely.Fixed, SpriteKind.Dirt)
TileWorld.addSprite(1, img`
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
`, Spritely.Fixed, SpriteKind.Space)
TileWorld.moveWithButtons(SpriteKind.Player)

*/

 /*

 // Rules of the game:

// ADVANCED
// - Tough enemy don't get killed by explosion
// - Enemies that collide with Pets yield explosions
// - Explosions destroy ???
// - Rock falling on Dynamite triggers explosion

import tw = TileWorld

// various tiles and sprites in the game
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

// others to follow:
// Dynamite
// Explosion
// Pet

namespace levels {
    // the values in the image correspond to the 'codes' enum above
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

let world = new tw.TileWorld()

world.setMap(levels.level1)
world.setBackgroundTile(codes.Space)

// names for sets

namespace SpriteKind {
    export let Rock = SpriteKind.create()
}

world.addTiles(codes.StrongWall, art.Wall)
world.addTiles(codes.Wall, art.Wall)
world.addTiles(codes.Space, art.Space)
world.addTiles(codes.Dirt, art.Dirt)

world.addTileSprites(codes.Boulder, art.Boulder, SpriteKind.Rock)
world.addTileSprites(codes.Diamond, art.Diamond, SpriteKind.Rock)
world.addTileSprites(codes.Enemy, art.Enemy, SpriteKind.Enemy)
world.addTileSprites(codes.Player, art.Player, SpriteKind.Player)

scene.cameraFollowSprite(world.getSprite(codes.Player))

tw.bindToController(world.getSprite(codes.Player))

// TODOs:
// 0. remove the need for boolean expressions and check call
//    - has, lacks
// 1. Defining conflicting actions.
// 2. Run all rules and collect actions, but defer actual execution.
// 3. add agent as layer on top

// we have a nice playground for logic here (no arithmetic, just fixed predicates)

// interesting issues that arise in our semantics:
// 1. multiple rules for S could fire and succeed on S.
// 2. a rule on A and a rule on B could both act on sprite S (S != A, S != B)

// how to state that Down has higher priority than all other directions (for Rocks)

// extensions: askToMove event

// fun stuff: debugger

//  - - -      - - -
//  - R -  =>  - - -
//  - S -      - R -

// player logic

// whereever player goes, replace with space
world.onTileArrived(SpriteKind.Player, (tile) => {
    world.setCode(tile, codes.Space);
})

world.onTileArrived(SpriteKind.Player, (tile, dir) => {
    world.isNotOneOf(dir, TileDir.None)
    tile.hasNoCode(codes.Boulder, dir)
    tile.hasNoCode(codes.Wall, dir)
    tile.hasNoCode(codes.StrongWall, dir)
    tile.moveOne(dir)
})

world.onTileArrived(SpriteKind.Player, (tile, dir) => {
    world.isOneOf(dir, TileDir.Left, TileDir.Right)
    tile.hasCode(codes.Space, dir, dir)
    tile.hasCode(codes.Boulder, dir)
    tile.get(codes.Boulder, dir).moveOne(dir)
    tile.moveOne(dir)
})

// if the player is moving into a tile with a diamond, eat it
world.onTileTransition(SpriteKind.Player, (tile) => {
    tile.hasCode(codes.Diamond)
    tile.get(codes.Diamond).remove()
})

// rock logic

// rock starts falling if there is a space below it
world.onTileStationary(SpriteKind.Rock, (tile) => {
    tile.hasCode(codes.Space, TileDir.Down)
    tile.moveOne(TileDir.Down)
})

// rock falls to right
world.onTileStationary(SpriteKind.Rock, (tile) => {
    tile.hasCode(codes.Space, TileDir.Right)
    tile.hasCode(codes.Space, TileDir.Right, TileDir.Down)
    tile.hasKind(SpriteKind.Rock, TileDir.Down)
    tile.moveOne(TileDir.Right)
})

// rock falls to left
world.onTileStationary(SpriteKind.Rock, (tile) => {
    tile.hasCode(codes.Space, TileDir.Left)
    tile.hasCode(codes.Space, TileDir.Left, TileDir.Down)
    tile.hasKind(SpriteKind.Rock, TileDir.Down)
    tile.moveOne(TileDir.Left)
})

world.onTileArrived(SpriteKind.Rock, (tile, dir) => {
    world.isOneOf(dir, TileDir.Down);
    world.check(!world.tileIs(codes.Space, tile, TileDir.Down))
    tile.deadStop();
})

world.onTileArrived(SpriteKind.Rock, (tile, dir) => {
    world.isOneOf(dir, TileDir.Down);
    tile.hasKind(SpriteKind.Rock, TileDir.Down)
    tile.deadStop();
})

world.onTileArrived(SpriteKind.Rock, (tile, dir) => {
    world.isNotOneOf(dir, TileDir.Down);
    tile.hasCode(codes.Space, TileDir.Down)
    tile.deadStop();
    tile.moveOne(TileDir.Down)
})

world.onTileTransition(SpriteKind.Rock, (tile) => {
    // TODO: need to generalize this to work with kinds as well
    tile.hasMultiple(codes.Boulder)
    tile.knockBack()
})

*/