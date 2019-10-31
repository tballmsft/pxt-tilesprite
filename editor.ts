 // the start of an editor 

namespace boulder {

    let player = img`
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
    `
    let diamond = img`
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
    let boulder = img`
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
    let enemy = img`
        . . . . . . . f f f f . . . . .
        . . . . . f f 1 1 1 1 f f . . .
        . . . . f b 1 1 1 1 1 1 b f . .
        . . . . f 1 1 1 1 1 1 1 1 f . .
        . . . f d 1 1 1 1 1 1 1 1 d f .
        . 7 . f d 1 1 1 1 1 1 1 1 d f .
        7 . . f d 1 1 1 1 1 1 1 1 d f .
        7 . . f d 1 1 1 1 1 1 1 1 d f .
        7 . . f d d d 1 1 1 1 d d d f f
        7 7 . f b d b f d d f b d b f c
        7 7 7 f c d c f 1 1 f c d c f b
        . 7 7 f f f b d b 1 b d f f c f
        . f c b 1 b c f f f f f f . . .
        . f 1 c 1 c 1 f f f f f f . . .
        . f d f d f d f f f f f . . . .
        . . f . f . f . . . . . . . . .
    `

    let wall = img`
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
    let dirt = img`
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
    let space = img`
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
    let movable = [ player, diamond, boulder, enemy]
    let fixed = [ wall, dirt, space]

    export let movableSprites: Sprite[] = []
    movable.forEach((img,i) => { 
        let foo = sprites.create(img)
        foo.setFlag(SpriteFlag.Invisible, true)
        foo.setKind(i)
        movableSprites.push(foo)
    })

    export let fixedSprites: Sprite[] = []
    fixed.forEach((img, i) => {
        let foo = sprites.create(img)
        foo.setFlag(SpriteFlag.Invisible, true)
        foo.setKind(movableSprites.length+i)
        fixedSprites.push(foo)
    })
}

 namespace tileWorldEditor {

     let tile = img`
         b b b b b b b b b b b b b b b c
         b . . . . . . . . . . . . . . c
         b . . . . . . . . . . . . . . c
         b . . . . . . . . . . . . . . c
         b . . . . . . . . . . . . . . c
         b . . . . . . . . . . . . . . c
         b . . . . . . . . . . . . . . c
         b . . . . . . . . . . . . . . c
         b . . . . . . . . . . . . . . c
         b . . . . . . . . . . . . . . c
         b . . . . . . . . . . . . . . c
         b . . . . . . . . . . . . . . c
         b . . . . . . . . . . . . . . c
         b . . . . . . . . . . . . . . c
         b . . . . . . . . . . . . . . c
         c c c c c c c c c c c c c c c c
     `
     let cursorIn = img`
         . . . . . . . . . . . . . . . .
         . . 1 1 1 1 1 1 1 1 1 1 1 1 . .
         . 1 1 . . . . . . . . . . 1 1 .
         . 1 . . . . . . . . . . . . 1 .
         . 1 . . . . . . . . . . . . 1 .
         . 1 . . . . . . . . . . . . 1 .
         . 1 . . . . . . . . . . . . 1 .
         . 1 . . . . . 1 1 . . . . . 1 .
         . 1 . . . . . 1 1 . . . . . 1 .
         . 1 . . . . . . . . . . . . 1 .
         . 1 . . . . . . . . . . . . 1 .
         . 1 . . . . . . . . . . . . 1 .
         . 1 . . . . . . . . . . . . 1 .
         . 1 1 . . . . . . . . . . 1 1 .
         . . 1 1 1 1 1 1 1 1 1 1 1 1 . .
         . . . . . . . . . . . . . . . .
     `
     let cursorOut = img`
         . 1 1 1 1 1 1 1 1 1 1 1 1 1 1 .
         1 1 . . . . . . . . . . . . 1 1
         1 . . . . . . . . . . . . . . 1
         1 . . . . . . . . . . . . . . 1
         1 . . . . . . . . . . . . . . 1
         1 . . . . . . . . . . . . . . 1
         1 . . . . . . . . . . . . . . 1
         1 . . . . . . . . . . . . . . 1
         1 . . . . . . . . . . . . . . 1
         1 . . . . . . . . . . . . . . 1
         1 . . . . . . . . . . . . . . 1
         1 . . . . . . . . . . . . . . 1
         1 . . . . . . . . . . . . . . 1
         1 . . . . . . . . . . . . . . 1
         1 1 . . . . . . . . . . . . 1 1
         . 1 1 1 1 1 1 1 1 1 1 1 1 1 1 .
     `
     let negate = img`
         . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . .
         . . . . . 2 2 2 2 2 2 . . . . .
         . . . . 2 2 . . . . 2 2 . . . .
         . . . 2 2 2 2 . . . . 2 2 . . .
         . . . 2 . 2 2 2 . . . . 2 . . .
         . . . 2 . . 2 2 2 . . . 2 . . .
         . . . 2 . . . 2 2 2 . . 2 . . .
         . . . 2 . . . . 2 2 2 . 2 . . .
         . . . 2 2 . . . . 2 2 2 2 . . .
         . . . . 2 2 . . . . 2 2 . . . .
         . . . . . 2 2 2 2 2 2 . . . . .
         . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . .
     `
     let genericSprite = img`
         . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . .
         . . . . . 1 1 1 1 1 1 . . . . .
         . . . . 1 5 5 5 5 5 5 5 . . . .
         . . . 1 5 5 5 5 5 5 5 5 5 . . .
         . . . 1 5 5 5 5 5 5 5 5 5 . . .
         . . . 1 5 5 5 5 5 5 5 5 5 . . .
         . . . 1 5 5 5 5 5 5 5 5 5 . . .
         . . . 1 5 5 5 5 5 5 5 5 5 . . .
         . . . 1 5 5 5 5 5 5 5 5 5 . . .
         . . . . 5 5 5 5 5 5 5 5 . . . .
         . . . . . 5 5 5 5 5 5 . . . . .
         . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . .
     `
     let downArrow = img`
         . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . .
         . . . . . . 9 9 9 6 . . . . . .
         . . . . . . 9 9 9 6 . . . . . .
         . . . . . . 9 9 9 6 . . . . . .
         . . . . . . 9 9 9 6 . . . . . .
         . . . . . . 9 9 9 6 . . . . . .
         . . . . 9 9 9 9 9 9 9 6 . . . .
         . . . . . 9 9 9 9 9 6 . . . . .
         . . . . . . 9 9 9 6 . . . . . .
         . . . . . . . 9 6 . . . . . . .
     `
     let upArrow = img`
         . . . . . . . 9 6 . . . . . . .
         . . . . . . 9 9 9 6 . . . . . .
         . . . . . 9 9 9 9 9 6 . . . . .
         . . . . 9 9 9 9 9 9 9 6 . . . .
         . . . . . . 9 9 9 6 . . . . . .
         . . . . . . 9 9 9 6 . . . . . .
         . . . . . . 9 9 9 6 . . . . . .
         . . . . . . 9 9 9 6 . . . . . .
         . . . . . . 9 9 9 6 . . . . . .
         . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . .
     `
     let rightArrow = img`
         . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . 9 . . .
         . . . . . . . . . . . . 9 9 . .
         . . . . . . . 9 9 9 9 9 9 9 9 .
         . . . . . . . 9 9 9 9 9 9 9 9 9
         . . . . . . . 9 9 9 9 9 9 9 9 6
         . . . . . . . 6 6 6 6 6 9 9 6 .
         . . . . . . . . . . . . 9 6 . .
         . . . . . . . . . . . . 6 . . .
         . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . .
     `
     let leftArrow = img`
         . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . .
         . . . 9 . . . . . . . . . . . .
         . . 9 9 . . . . . . . . . . . .
         . 9 9 9 9 9 9 9 9 . . . . . . .
         9 9 9 9 9 9 9 9 9 . . . . . . .
         6 9 9 9 9 9 9 9 9 . . . . . . .
         . 6 9 9 6 6 6 6 6 . . . . . . .
         . . 6 9 . . . . . . . . . . . .
         . . . 6 . . . . . . . . . . . .
         . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . .
     `
     let editorMap = img`
         . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
         . . . . . . . 4 4 4 4 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
         . . . 5 . . . 4 . . 4 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
         . . . . . . . 4 . . 4 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
         . . . . . . . 4 4 4 4 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
         . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
     `

    class MapEditor {
        // tilemap
        // size
        // default tile
        //  
    } 

    class Toolbox {
        // show sprites, tiles, commands
        // select current sprite/tile
        constructor(private gameSprites: Sprite[]) {
            
        }

        
    }

    // the "adventure"
    // - you are in room with several sprites. Each sprite has a doorway next to it.

    class Room {

    }
    
    class Editor {
        private currentMap: Image;
        constructor(private fixed: Sprite[], private movable: Sprite[]) {
                this.currentMap = editorMap.clone();
                scene.setTileMap(this.currentMap)
                scene.setTile(9, tile);
                let tiles = scene.getTilesByType(5)
                for (let value of tiles) {
                    let foo = sprites.create(genericSprite, SpriteKind.Food)
                    value.place(foo)
                }
                this.currentMap.fill(0)
                this.makeContext(3, 3)

                let cursor: Sprite = sprites.create(cursorIn, SpriteKind.Player)
                cursor.x = 40
                cursor.y = 56
                scene.cameraFollowSprite(cursor)
                controller.left.onEvent(ControllerButtonEvent.Pressed, () => {
                    cursor.x -= 16
                })
                controller.right.onEvent(ControllerButtonEvent.Pressed, () => {
                    cursor.x += 16
                })
                controller.up.onEvent(ControllerButtonEvent.Pressed, () => {
                    cursor.y -= 16
                })
                controller.down.onEvent(ControllerButtonEvent.Pressed, () => {
                    cursor.y += 16
                })
                
            }
        private  makeContext(row: number, col: number) {
            for (let i = -2; i <= 2; i++) {
                this.currentMap.setPixel(col + i, row, 9);
                this.currentMap.setPixel(col, row + i, 9);
                if (i > -2 && i < 2) {
                    this.currentMap.setPixel(col + i, row + i, 9);
                    this.currentMap.setPixel(col + i, row - i, 9);
                }
            }
        }
    }

     let editor = new Editor(boulder.fixedSprites, boulder.movableSprites)
     
     sprites.onOverlap(SpriteKind.Player, SpriteKind.Food, function (sprite: Sprite, otherSprite: Sprite) {
         // add menu of sprites...
     })

     // todo:
     // cursor navigation
     // steps:
     // 1. select "self" sprite
     // 2. select event type
     // 3. fill out context
                   
     // one room per rule
     // room list?

     // "program" data structure
     // "editor" data structure
     // menu bar
     // interpreter
     // export to MakeCode?

 }