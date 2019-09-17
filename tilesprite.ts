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
        private code: number;
        private parent: TileWorld;
        // which direction is the target 
        private dir: Dir;
        // previous sprite coord value
        private old: number;
        // the next tile target
        private next: number
        // the final tile target
        private final: number;
        // the next direction to go
        private queue_dir: Dir;
        // notification
        private onArrived: (ts: TileSprite, d: Dir) => void
        private onStationary: (ts: TileSprite) => void
        private onTransition: (ts: TileSprite, prevCol: number, prevRow: number) => void

        constructor(world: TileWorld, code: number, image: Image, sk: number = -1, bits: number = 4) {
            super(image);
            this.setKind(sk)
            const scene = game.currentScene();
            scene.physicsEngine.addSprite(this);
            this.parent = world;
            this.code = code
            this.tileBits = bits;
            this.dir = Dir.None;
            this.queue_dir = Dir.None;
            this.onArrived = undefined;
            this.onStationary = undefined;
            this.onTransition = undefined;
        }
        //
        getCode() { return this.code }
        getColumn() { return this.x >> this.tileBits }
        getRow() { return this.y >> this.tileBits }
        // request sprite to move in specified direction
        getDirection() { return this.dir; }
        moveOne(dir: Dir) {
            if (dir == Dir.Left || dir == Dir.Right)
                this.moveInX(dir)
            else if (dir == Dir.Up || dir == Dir.Down)
                this.moveInY(dir)
        }
        // stop at current tile
        deadStop() { this.stopSprite(false) }
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
        requestStop() {
            this.final = 0;
            // TODO: queued?
        }
        // notify client on entering tile
        onTileArrived(handler: (ts: TileSprite, d: Dir) => void) {
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
        private moveInX(dir: Dir) {
            let size = 1 << this.tileBits
            let opDir = dir == Dir.Left ? Dir.Right : Dir.Left
            let sign = dir == Dir.Left ? -1 : 1
            if (this.dir == dir) {
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
                // direction is 90 to current direction, so queue it
                this.queue_dir = dir;
                return;
            }
            this.old = this.getColumn()
            this.dir = dir
            this.final = this.next;
            this.vx = sign * 100
        }
        private moveInY(dir: Dir) {
            let size = 1 << this.tileBits
            let opDir = dir == Dir.Up ? Dir.Down : Dir.Up
            let sign = dir == Dir.Up ? -1 : 1
            if (this.dir == dir) {
                this.final += sign * size;
                return;
            } else if (this.dir == opDir) {
                // next_x is defined, so use it
                this.next += sign * size
            } else if (this.dir == Dir.None) {
                // player.x is aligned, so use it
                this.next = this.y + sign * size;
            } else {
                // direction is 90 to current direction, so queue it
                this.queue_dir = dir;
                return;
            }
            this.old = this.getRow()
            this.dir = dir
            this.final = this.next
            this.vy = sign * 100
        }
        // process queued movement (client must invoke)
        private doQueued() {
            if (this.dir == Dir.None) {
                if (this.queue_dir != Dir.None) {
                    this.moveOne(this.queue_dir)
                }
                this.queue_dir = Dir.None;
            }
        }
        private reachedTargetX(x: number, step: number, reentrant: boolean = true) {
            // determine what comes next
            this.x = x
            let keepDir = Dir.None
            if (this.final && this.next != this.final) {
                this.next += step
            } else {
                if (this.final) keepDir = this.dir
                this.dir = Dir.None
                this.vx = 0
            }
            // notify
            if (this.onArrived && reentrant) {
                this.onArrived(this, keepDir)
            }
            this.doQueued()
            this.old = this.getColumn()
        }
        private reachedTargetY(y: number, step: number, reentrant: boolean = true) {
            this.y = y
            let keepDir = Dir.None
            if (this.final && this.next != this.final) {
                this.next += step
            } else {
                if (this.final) keepDir = this.dir
                this.dir = Dir.None
                this.vy = 0
            }
            // notify
            if (this.onArrived && reentrant) {
                this.onArrived(this, keepDir)
            }
            this.doQueued()
            this.old = this.getRow()
        }
        private centerIt(n: number) {
            return ((n >> this.tileBits) << this.tileBits) + (1 << (this.tileBits - 1))
        }
        private stopSprite(reentrant: boolean) {
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
        private world: TileWorld;
        private col: number;
        private row: number;
        constructor(w: TileWorld, s: Tile, dir: Dir, dir2: Dir = Dir.None, dir3: Dir = Dir.None) {
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
    export function bindToController(sprite: TileSprite, move: (s: TileSprite, dir: Dir) => void) {
        controller.left.onEvent(ControllerButtonEvent.Pressed, function () {
            move(sprite, Dir.Left)
        })
        controller.left.onEvent(ControllerButtonEvent.Released, function () {
            sprite.requestStop()
        })
        controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
            move(sprite, Dir.Right)
        })
        controller.right.onEvent(ControllerButtonEvent.Released, function () {
            sprite.requestStop()
        })
        controller.up.onEvent(ControllerButtonEvent.Pressed, function () {
            move(sprite, Dir.Up)
        })
        controller.up.onEvent(ControllerButtonEvent.Released, function () {
            sprite.requestStop()
        })
        controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
            move(sprite, Dir.Down)
        })
        controller.down.onEvent(ControllerButtonEvent.Released, function () {
            sprite.requestStop()
        })
    }

    // description of sprites
    export type Description = { c: number, a: Image, t: number }

    export class TileWorld {
        private codeToKind: number[];
        private spriteCodes: number[];
        // the sprites, divided up by code
        private sprites: TileSprite[][];
        // the current tile map (no sprites)  
        private tileMap: Image;
        // fill in with sprites
        private spriteMap: Image;
        // note tiles with more than one sprite
        private multiples: Image;
        private multipleSprites: TileSprite[];
        private tileHandler: (colliding: TileSprite[]) => void;
        private arrivalHandlers: ((ts: TileSprite, d: Dir) => void)[][];
        private stationaryHandlers: ((ts: TileSprite) => void)[][];
        private backgroundTile: number;

        constructor(tileMap: Image, backgroundTile: number) {
            this.backgroundTile = backgroundTile
            this.sprites = []
            this.codeToKind = []
            this.spriteCodes = []
            this.tileMap = tileMap.clone();
            this.spriteMap = tileMap.clone();
            this.multiples = tileMap.clone();
            this.multipleSprites = [];
            this.tileHandler = undefined;
            this.arrivalHandlers = []
            this.stationaryHandlers = []
            scene.setTileMap(this.tileMap)
        }

        addTiles(code: number, art: Image, kind: number = 0) {
            let tiles = scene.getTilesByType(code)
            this.codeToKind[code] = kind;
            scene.setTile(code, art)
        }

        addTileSprites(code: number, art:Image, kind: number = 0) {
            let tiles = scene.getTilesByType(code)
            scene.setTile(code, art);
            this.sprites[code] = []
            this.codeToKind[code] = kind;
            this.spriteCodes.push(code);
            for (let value of tiles) {
                let tileSprite = new TileSprite(this, code, art, kind)
                this.sprites[code].push(tileSprite)
                value.place(tileSprite)
            }
            // remove from tile map
            for (let y = 0; y < this.tileMap.height; y++) {
                for (let x = 0; x < this.tileMap.width; x++) {
                    let pixel = this.tileMap.getPixel(x, y)
                    if (code == pixel) this.tileMap.setPixel(x, y, this.backgroundTile)
                }
            }
        }

        onTileStationary(code: number, h: (ts: TileSprite) => void) {
            if (!this.stationaryHandlers[code]) {
                this.stationaryHandlers[code] = []
                let process = (s: TileSprite) => this.stationaryHandlers[s.getCode()].forEach((h) => h(s));
                this.sprites[code].forEach((spr) => spr.onTileStationary(process));
            }
            this.stationaryHandlers[code].push(h);
        }

        onTileArrived(code: number, h: (ts: TileSprite, d: Dir) => void) {
            if (!this.arrivalHandlers[code]) {
                this.arrivalHandlers[code] = []
                let process = (s: TileSprite, d: Dir) => this.arrivalHandlers[s.getCode()].forEach((h) => h(s,d));
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

        hasKind(kind: number, orig: Tile, dir: Dir = Dir.None, dir2: Dir = Dir.None, dir3: Dir = Dir.None) {
            let cursor = new Cursor(this, orig, dir, dir2, dir3);
            return this.checkTileKind(kind, cursor)
        }

        private checkTile(code: number, curs: Cursor) {
            if (this.multiples.getPixel(curs.getColumn(), curs.getRow())) {
                return this.getSpriteByCode(code, curs) != null
            } else {
                return this.spriteMap.getPixel(curs.getColumn(), curs.getRow()) == code
            }
        }

        private checkTileKind(kind: number, curs: Cursor) {
            if (this.multiples.getPixel(curs.getColumn(), curs.getRow())) {
                return this.getSpriteByKind(kind, curs) != null
            } else {
                return this.codeToKind[this.spriteMap.getPixel(curs.getColumn(), curs.getRow())] == kind
            }
        }

        removeSprite(s: TileSprite) {
            this.sprites[s.getCode()].removeElement(s)
            s.destroy()
        }

        getSpriteByCode(code: number, orig: Tile = null, dir: Dir = Dir.None, dir2: Dir = Dir.None, dir3: Dir = Dir.None) {
            if (orig) {
                let cursor = new Cursor(this, orig, dir, dir2, dir3);
                return this.sprites[code].find((t: Tile) =>
                    t.getColumn() == cursor.getColumn() && t.getRow() == cursor.getRow())
            } else {
                return this.sprites[code][0]
            }
        }

        getSpriteByKind(kind: number, orig: Tile = null, dir: Dir = Dir.None, dir2: Dir = Dir.None, dir3: Dir = Dir.None) {
            let ss = game.currentScene().spritesByKind[kind].sprites()
            if (orig) {
                let cursor = new Cursor(this, orig, dir, dir2, dir3);
                return ss.find(function (s: Sprite, index: number) {
                    return ((<TileSprite>s).getColumn() == cursor.getColumn()) &&
                           ((<TileSprite>s).getRow() == cursor.getRow())
                })
            } else {
                return ss[0]
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
                            this.addMultipleSprites(col, row);
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

        private addMultipleSprites(col: number, row: number) {
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