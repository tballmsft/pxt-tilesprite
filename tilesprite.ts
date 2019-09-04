namespace TileWorld {

    // which direction is the sprite moving
    export enum Dir { None, Left, Right, Up, Down }

    // a sprite that moves by tiles, but only in one of four directions
    export class TileSprite extends Sprite {
        public tileBits: number;
        public code: number;
        // trie iff the user is requesting motion and nothing has stopped
        // the sprite from moving
        private moving: boolean;
        // which direction is the target 
        private dir: Dir;
        // previous sprite coord value
        private old: number;
        // the target
        private next: number
        // the final target
        private final: number;
        // the next direction to go
        private queue_dir: Dir;
        private queue_moving: boolean;
        // notification
        private onArrived: (ts: TileSprite) => void
        private onStationary: (ts: TileSprite) => void
        private onTransition: (ts: TileSprite, prevCol: number, prevRow: number) => void

        constructor(code: number, image: Image, sk: number, bits: number = 4) {
            super(image);
            this.code = code;
            this.setKind(sk);
            const scene = game.currentScene();
            scene.physicsEngine.addSprite(this);
            this.tileBits = bits;
            this.moving = false;
            this.dir = Dir.None;
            this.queue_dir = Dir.None;
            this.onArrived = undefined;
            this.onStationary = undefined;
            this.onTransition = undefined;
        }

        Path(dir: Dir) { return new Path(this, dir) }
        getColumn() { return this.x >> this.tileBits }
        getRow() { return this.y >> this.tileBits }
        inMotion() {
            if (this.vx > 0) return Dir.Right
            else if (this.vx < 0) return Dir.Left
            else if (this.vy > 0) return Dir.Down
            else if (this.vy < 0) return Dir.Up;
            else return Dir.None;
        }
        // request sprite to move in specified direction
        move(dir: Dir, moving: boolean = true) {
            if (dir == Dir.Left || dir == Dir.Right)
                this.moveInX(dir, moving)
            else if (dir == Dir.Up || dir == Dir.Down)
                this.moveInY(dir, moving)
        }
        getDirection() { return this.dir; }

        // stop at current tile
        deadStop(rentrant: boolean = false) { this.stopSprite(rentrant) }
        // request sprite to stop moving when it reaches destination
        stop(dir: Dir) {
            if (dir == this.dir) {
                this.moving = false;
                this.final = 0;
            } else if (dir == this.queue_dir) {
                this.queue_moving = false;
            }
        }
        // process queued movement (client must invoke)
        doQueued() {
            if (this.queue_dir != Dir.None) {
                this.move(this.queue_dir, this.queue_moving)
            }
            this.queue_dir = Dir.None;
        }
        clearQueue() { this.queue_dir = Dir.None }
        // notify client on entering tile
        onTileArrived(handler: (ts: TileSprite) => void) {
            this.onArrived = handler
        }
        onTileStationary(handler: (ts: TileSprite) => void) {
            this.onStationary = handler
        }
        onTileTransition(handler: (ts: TileSprite, col: number, row: number) => void) {
            this.onTransition = handler
        }
        // call from game update loop
        updateInMotion() {
            if (this.dir == Dir.None)
                return;
            // have we crossed into a new tile?
            if (this.onTransition) {
                if (this.dir == Dir.Left || this.dir == Dir.Right) {
                    if (this.old != this.getColumn()) {
                        this.onTransition(this, this.old, this.getRow())
                    }
                    this.old = this.getColumn()
                } else if (this.dir == Dir.Up || this.dir == Dir.Down) {
                    if (this.old != this.getRow()) {
                        this.onTransition(this, this.getColumn(), this.old)
                    }
                    this.old = this.getRow()
                }
            }
            // have we reached the target?
            let size = 1 << this.tileBits
            if (this.dir == Dir.Left && this.x <= this.next) {
                this.reachedTargetX(this.next, -size)
            } else if (this.dir == Dir.Right && this.x >= this.next) {
                this.reachedTargetX(this.next, size)
            } else if (this.dir == Dir.Up && this.y <= this.next) {
                this.reachedTargetY(this.next, -size)
            } else if (this.dir == Dir.Down && this.y >= this.next) {
                this.reachedTargetY(this.next, size)
            }
        }
        updateStationary() {
            if (this.onStationary && this.dir == Dir.None) {
                this.onStationary(this)
            }
        }
        private moveInX(dir: Dir, moving: boolean) {
            let size = 1 << this.tileBits
            let opDir = dir == Dir.Left ? Dir.Right : Dir.Left
            let sign = dir == Dir.Left ? -1 : 1
            if (this.dir == dir && !moving) {
                this.final += sign * size;
                return;
            } else if (this.dir == opDir) {
                // switching 180 doesn't require queuing
                // next_x is defined, so use it
                this.next += sign * size
            } else if (this.dir == Dir.None) {
                // player.x is aligned, so use it
                this.next = this.x + sign * size;
            } else {
                this.queue_dir = dir;
                this.queue_moving = moving
                return;
            }
            this.old = this.getColumn()
            this.dir = dir
            this.moving = moving
            this.final = this.next;
            this.vx = sign * 100
        }
        private moveInY(dir: Dir, moving: boolean) {
            let size = 1 << this.tileBits
            let opDir = dir == Dir.Up ? Dir.Down : Dir.Up
            let sign = dir == Dir.Up ? -1 : 1
            if (this.dir == dir && !moving) {
                this.final += sign * size;
                return;
            } else if (this.dir == opDir) {
                // next_x is defined, so use it
                this.next += sign * size
            } else if (this.dir == Dir.None) {
                // player.x is aligned, so use it
                this.next = this.y + sign * size;
            } else {
                this.queue_dir = dir;
                this.queue_moving = moving
                return;
            }
            this.old = this.getRow()
            this.dir = dir
            this.moving = moving
            this.final = this.next
            this.vy = sign * 100
        }
        private reachedTargetX(x: number, step: number, reentrant: boolean = true) {
            // determine what comes next
            this.x = x
            if (this.moving || this.final && this.next != this.final) {
                this.next += step
            } else {
                this.dir = Dir.None
                this.vx = 0
            }
            // notify
            if (this.onArrived && reentrant) {
                this.onArrived(this)
            }
            this.queue_dir = Dir.None
            this.old = this.getColumn()
        }
        private reachedTargetY(y: number, step: number, reentrant: boolean = true) {
            this.y = y
            if (this.moving || this.final && this.next != this.final) {
                this.next += step
            } else {
                this.dir = Dir.None
                this.vy = 0
            }
            // notify
            if (this.onArrived && reentrant) {
                this.onArrived(this)
            }
            this.queue_dir = Dir.None
            this.old = this.getRow()
        }
        private centerIt(n: number) {
            return ((n >> this.tileBits) << this.tileBits) + (1 << (this.tileBits - 1))
        }
        private stopSprite(reentrant: boolean) {
            this.moving = false
            this.final = 0
            this.queue_dir = Dir.None
            if (this.dir == Dir.Left || this.dir == Dir.Right) {
                this.reachedTargetX(this.centerIt(this.x), 0, reentrant)
            } else {
                this.reachedTargetY(this.centerIt(this.y), 0, reentrant)
            }
        }
    }


    // paths
    export class Path {
        private root: TileSprite;
        private dir: Dir;
        private col: number;
        private row: number;
        constructor(s: TileSprite, dir: Dir) {
            this.root = s;
            this.dir = dir;
            this.Origin();
        }
        public getColumn() { return this.col }
        public getRow() { return this.row }
        public Origin() {
            this.col = this.root.getColumn()
            this.row = this.root.getRow()
            this.Next(this.dir)
            return this;
        }
        public Next(dir: Dir) {
            switch (dir) {
                case Dir.Left: this.col--; return this;
                case Dir.Right: this.col++; return this;
                case Dir.Up: this.row--; return this;
                case Dir.Down: this.row++; return this
            }
            return this;
        }
    }

    // basic movement for player sprite
    export function bindToController(sprite: TileSprite, canMove: (s: TileSprite, dir: Dir) => boolean) {
        controller.left.onEvent(ControllerButtonEvent.Pressed, function () {
            if (canMove(sprite, Dir.Left))
                sprite.move(Dir.Left)
        })
        controller.left.onEvent(ControllerButtonEvent.Released, function () {
            sprite.stop(Dir.Left)
        })
        controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
            if (canMove(sprite, Dir.Right))
                sprite.move(Dir.Right)
        })
        controller.right.onEvent(ControllerButtonEvent.Released, function () {
            sprite.stop(Dir.Right)
        })
        controller.up.onEvent(ControllerButtonEvent.Pressed, function () {
            if (canMove(sprite, Dir.Up))
                sprite.move(Dir.Up)
        })
        controller.up.onEvent(ControllerButtonEvent.Released, function () {
            sprite.stop(Dir.Up)
        })
        controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
            if (canMove(sprite, Dir.Down))
                sprite.move(Dir.Down)
        })
        controller.down.onEvent(ControllerButtonEvent.Released, function () {
            sprite.stop(Dir.Down)
        })
    }

    // description of sprites
    export type Description = { c: number, a: Image, sk: number, t: number }

    export class TileWorldState {
        private spriteCodes: number[];
        // the sprites, divided up by category
        sprites: TileSprite[][];
        // the current tile map (no sprites)  
        tileMap: Image;
        // fill in with sprites
        spriteMap: Image;
        // note tiles with more than one sprite
        multiples: Image;
        spritesInTile: TileSprite[][][];

        constructor(tileMap: Image, spriteDescriptions: Description[]) {
            this.sprites = []
            this.spriteCodes = []
            this.tileMap = tileMap.clone();
            this.spriteMap = tileMap.clone();
            this.multiples = tileMap.clone();
            this.spritesInTile = [];
            scene.setTileMap(this.tileMap)

            for (let sd of spriteDescriptions) {
                let tiles = scene.getTilesByType(sd.c)
                scene.setTile(sd.c, sd.sk == undefined ? sd.a : spriteDescriptions.find(s => sd.t == s.c).a)
                if (sd.sk != undefined) {
                    this.sprites[sd.c] = []
                    this.spriteCodes.push(sd.c);
                    for (let value of tiles) {
                        let tileSprite = new TileSprite(sd.c, sd.a, sd.sk)
                        this.sprites[sd.c].push(tileSprite)
                        value.place(tileSprite)
                    }
                }
            }

            // now that we have created sprites, remove them from the tile map
            for (let y = 0; y < tileMap.height; y++) {
                for (let x = 0; x < tileMap.width; x++) {
                    let pixel = this.tileMap.getPixel(x, y)
                    let r = spriteDescriptions.find(r => r.c == pixel)
                    if (r && r.sk) this.tileMap.setPixel(x, y, r.t)
                }
            }
        }

        private getAllSprites(col: number, row: number) {
            let res: TileSprite[] = []
            this.sprites.forEach((arr, code) => {
                if (arr) {
                    arr.forEach((sprite) => {
                        if (col == sprite.getColumn() && row == sprite.getRow())
                            res.push(sprite);
                    })
                }
            })
            return res;
        }

        private addSprites(col: number, row: number) {
            if (this.spritesInTile[col]) {
                if (this.spritesInTile[col][row]) {
                    // already filled
                    return;
                }
            } else {
                this.spritesInTile[col] = [];
            }
            this.spritesInTile[col][row] = this.getAllSprites(col, row)
        }

        update() {
            // first recompute the map
            this.spriteMap.copyFrom(this.tileMap)
            this.multiples.fill(0)
            this.spritesInTile = []
            this.sprites.forEach((arr, code) => {
                if (arr) {
                    arr.forEach((sprite) => {
                        let col = sprite.getColumn(), row = sprite.getRow()
                        let here = this.spriteMap.getPixel(col, row)
                        if (this.spriteCodes.find((code) => code == here)) {
                            // we have more than 1 sprite at (col,row)
                            this.addSprites(col, row)
                            this.multiples.setPixel(col, row, 1)
                        } else {
                            // no sprite at this tile yet
                            this.spriteMap.setPixel(col, row, code)
                        }
                    })
                }
            })
            // update the moving sprites
            this.sprites.forEach((arr) => {
                if (arr) { arr.forEach((sprite) => { sprite.updateInMotion() }) }
            })
            // TODO: note that a sprite can be acted upon twice, if
            // TODO: it transitions from moving to stationary
            // update the stationary sprites
            this.sprites.forEach((arr) => {
                if (arr) { arr.forEach((sprite) => { sprite.updateStationary() }) }
            })
        }

        player() {
            return <TileSprite>game.currentScene().spritesByKind[SpriteKind.Player].sprites()[0]
        }

        getSprite(code: number, path: tw.Path) {
            return this.sprites[code].find(function (value: tw.TileSprite, index: number) {
                return (value.getColumn() == path.getColumn() && value.getRow() == path.getRow())
            })
        }

        getSprites(p: tw.Path) {
            return this.spritesInTile[p.getColumn()][p.getRow()]
        }

        getTile(p: tw.Path) {
            if (this.multiples.getPixel(p.getColumn(), p.getRow())) {
                return -1
            } else {
                return this.spriteMap.getPixel(p.getColumn(), p.getRow())
            }
        }
    }
}