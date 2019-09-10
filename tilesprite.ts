namespace TileWorld {

    // which direction is the sprite moving
    export enum Dir { None, Left, Right, Up, Down }

    export interface Tile {
        getColumn(): number;
        getRow(): number;
    }

    // a sprite that moves by tiles, but only in one of four directions
    export class TileSprite extends Sprite implements Tile {
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

        constructor(code: number, image: Image, bits: number = 4) {
            super(image);
            this.code = code
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
        knockBack(rentrant: boolean = false) {
            if ((this.dir == Dir.Left || this.dir == Dir.Right) &&
                this.old != this.getColumn()) {
                this.x = this.centerIt(this.old << this.tileBits)
            } else if ((this.dir == Dir.Up || this.dir == Dir.Down) &&
                this.old != this.getRow()) {
                this.y = this.centerIt(this.old << this.tileBits)
            }
            this.stopSprite(rentrant)
        }
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

    // a cursor is just a coordinate
    class Cursor implements Tile {
        private world: TileWorldState;
        private col: number;
        private row: number;
        constructor(w: TileWorldState, s: Tile, dir: Dir, dir2: Dir = Dir.None, dir3: Dir = Dir.None) {
            this.world = w;
            this.col = s.getColumn();
            this.row = s.getRow();
            this.move(dir); this.move(dir2); this.move(dir3)
        }
        private move(dir: Dir) {
            switch (dir) {
                case Dir.Left: this.col--; break;
                case Dir.Right: this.col++; break;
                case Dir.Up: this.row--; break;
                case Dir.Down: this.row++; break;
            }
        }
        public getColumn() { return this.col }
        public getRow() { return this.row }
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
    export type Description = { c: number, a: Image, t: number }

    export class TileWorldState {
        private spriteCodes: number[];
        // the sprites, divided up by category
        private sprites: TileSprite[][];
        // the current tile map (no sprites)  
        private tileMap: Image;
        // fill in with sprites
        private spriteMap: Image;
        // note tiles with more than one sprite
        private multiples: Image;
        private multipleSprites: TileSprite[];
        private tileHandler: (colliding: TileSprite[]) => void;
        private arrivalHandlers: ((ts: TileSprite) => void)[][];
        private stationaryHandlers: ((ts: TileSprite) => void)[][];
        // exclusion sets
        private exclusionSets: SpriteSet[];

        constructor(tileMap: Image, spriteDescriptions: Description[]) {
            this.sprites = []
            this.spriteCodes = []
            this.tileMap = tileMap.clone();
            this.spriteMap = tileMap.clone();
            this.multiples = tileMap.clone();
            this.multipleSprites = [];
            this.tileHandler = undefined;
            this.arrivalHandlers = []
            this.stationaryHandlers = []
            scene.setTileMap(this.tileMap)

            for (let sd of spriteDescriptions) {
                let tiles = scene.getTilesByType(sd.c)
                scene.setTile(sd.c, sd.t == undefined ? sd.a : spriteDescriptions.find(s => sd.t == s.c).a)
                if (sd.t != undefined) {
                    this.sprites[sd.c] = []
                    this.spriteCodes.push(sd.c);
                    for (let value of tiles) {
                        let tileSprite = new TileSprite(sd.c, sd.a)
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
                    if (r && r.t) this.tileMap.setPixel(x, y, r.t)
                }
            }
        }

        onTileStationary(code: number, h: (ts: TileSprite) => void) {
            if (!this.stationaryHandlers[code]) {
                this.stationaryHandlers[code] = []
                let process = (s: TileSprite) => this.stationaryHandlers[s.code].forEach((h) => h(s));
                this.sprites[code].forEach((spr) => spr.onTileStationary(process));
            }
            this.stationaryHandlers[code].push(h);
        }

        onTileArrived(code: number, h: (ts: TileSprite) => void) {
            if (!this.arrivalHandlers[code]) {
                this.arrivalHandlers[code] = []
                let process = (s: TileSprite) => this.arrivalHandlers[s.code].forEach((h) => h(s));
                this.sprites[code].forEach((spr) => spr.onTileArrived(process));
            }
            this.arrivalHandlers[code].push(h);
        }

        onSpritesInTile(h: (collision: TileSprite[]) => void) {
            this.tileHandler = h;
        }

        setCode(curs: Tile, code: number) {
            this.tileMap.setPixel(curs.getColumn(), curs.getRow(), code)
        }

        hasCode(code:number, orig: Tile, dir: Dir = Dir.None, dir2: Dir = Dir.None, dir3: Dir = Dir.None) {
            let cursor = new Cursor(this, orig, dir, dir2, dir3);
            return this.checkTile(code,cursor)
        }

        private checkTile(code: number, curs: Cursor) {
            if (this.multiples.getPixel(curs.getColumn(), curs.getRow())) {
                return this.getSprite(code, curs) != null
            } else {
                return this.spriteMap.getPixel(curs.getColumn(), curs.getRow()) == code
            }
        }

        removeSprite(s: TileSprite) {
            this.sprites[s.code].removeElement(s)
            s.destroy()
        }

        getSprite(code: number, orig: Tile = null, dir: Dir = Dir.None, dir2: Dir = Dir.None, dir3: Dir = Dir.None) {
            if (orig) {
                let cursor = new Cursor(this, orig, dir, dir2, dir3);
                return this.sprites[code].find((t: Tile) =>
                    t.getColumn() == cursor.getColumn() && t.getRow() == cursor.getRow())
            } else {
                return this.sprites[code][0]
            }
        }

        update() {
            // first recompute the map
            this.spriteMap.copyFrom(this.tileMap)
            this.multiples.fill(0)
            this.multipleSprites = []
            // TODO: should select one target for multiple sprites in a tile
            this.sprites.forEach((arr, code) => {
                if (arr) {
                    arr.forEach((sprite) => {
                        let col = sprite.getColumn(), row = sprite.getRow()
                        let here = this.spriteMap.getPixel(col, row)
                        if (this.spriteCodes.find((code) => code == here) &&
                            !this.multiples.getPixel(col, row)) {
                            // we have more than 1 sprite at (col,row)
                            this.addSprites(col, row);
                            this.multiples.setPixel(col, row, 1)
                        } else {
                            // no sprite at this tile yet
                            this.spriteMap.setPixel(col, row, code)
                        }
                    })
                }
            })

            // three main update steps (ordering issues to be addressed
            // by tracking which sprite is affected by which step and lot
            // 

            // 1. update the moving sprites
            this.sprites.forEach((arr) => {
                if (arr) arr.forEach((sprite) => { sprite.updateInMotion() })
            })

            // TODO: note that a sprite can be acted upon twice, if
            // TODO: it transitions from moving to stationary
            // 2. update the stationary sprites
            this.sprites.forEach((arr) => {
                if (arr) { arr.forEach((sprite) => { sprite.updateStationary() }) }
            })

            // 3. process collisions at tiles
            // TODO: there could be multiple (col, row)
            if (this.tileHandler && this.multipleSprites.length > 0) {
                this.tileHandler(this.multipleSprites)
            }
        }

        private addSprites(col: number, row: number) {
            this.sprites.forEach((arr, code) => {
                if (arr) {
                    arr.forEach((sprite) => {
                        if (col == sprite.getColumn() && row == sprite.getRow())
                            this.multipleSprites.push(sprite);
                    })
                }
            })
        }
    }
}