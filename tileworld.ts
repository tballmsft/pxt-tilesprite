//% weight=1000 color="#442255" icon="\uf45c"
//% groups='["Tiles", "Events", "Logic"]'
//% blockGap=8
namespace TileWorld {

    // which direction is the sprite moving
    export enum Dir { 
        None, 
        Left, 
        Right, 
        Up, 
        Down 
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

        constructor(world: TileWorld, code: number, image: Image, bits: number = 4) {
            super(image);
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
        // block
        has(code: number, dir: Dir = Dir.None, dir2: Dir = Dir.None, dir3: Dir = Dir.None) {
            this.parent.check(this.parent.containsAt(code, this, dir, dir2, dir3))
        }
        // block
        hasMultiple(code: number, dir: Dir = Dir.None, dir2: Dir = Dir.None, dir3: Dir = Dir.None) {
            this.parent.check(this.parent.hasMultiple(code, this, dir, dir2, dir3))
        }
        // block
        get(code: number, dir: Dir = Dir.None, dir2: Dir = Dir.None, dir3: Dir = Dir.None) {
            return this.parent.getSprite(code, this, dir, dir2, dir3)
        }
        // block
        hasNo(code: number, dir: Dir = Dir.None, dir2: Dir = Dir.None, dir3: Dir = Dir.None) {
            this.parent.check(!this.parent.containsAt(code, this, dir, dir2, dir3))
        }        
        // block
        remove() {
            this.parent.removeSprite(this)
        }
        // request sprite to move in specified direction
        // block
        moveOne(dir: Dir) {
            if (dir == Dir.Left || dir == Dir.Right)
                this.moveInX(dir)
            else if (dir == Dir.Up || dir == Dir.Down)
                this.moveInY(dir)
        }
        // request sprite to stop moving when it reaches destination
        // block
        requestStop() { this.final = 0; }
        // stop at current tile
        // block
        deadStop() { this.stopSprite(false) }
        // back to previous tile
        // block
        knockBack() {
            if ((this.dir == Dir.Left || this.dir == Dir.Right) &&
                this.old != this.getColumn()) {
                this.x = this.centerIt(this.old << this.tileBits)
            } else if ((this.dir == Dir.Up || this.dir == Dir.Down) &&
                this.old != this.getRow()) {
                this.y = this.centerIt(this.old << this.tileBits)
            }
            this.stopSprite(false)
        }

        // most of the rest is for internal use
        getCode() { return this.code }
        getColumn() { return this.x >> this.tileBits }
        getRow() { return this.y >> this.tileBits }

        // notify client on entering tile
        onTileArrived(handler: (ts: TileSprite, d: Dir) => void) {
            this.onArrived = handler
        }
        notifyArrived(d: Dir) {
            if (this.onArrived) {
                this.onArrived(this, d)
            }
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

    // the tile world manages tile sprites
    export class TileWorld {
        // which codes map to sprites?
        private spriteCodes: number[];
        // map codes to kinds
        private codeToKind: number[];
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
        private arrivalHandlers: { [index:number]: ((ts: TileSprite, d: Dir) => void)[] };
        private transitionHandlers: { [index:number]: ((ts: TileSprite, prevCol: number, prevRow: number) => void)[] };
        private stationaryHandlers: { [index:number]: ((ts: TileSprite) => void)[] };
        private backgroundTile: number;
        private tileKind: number;

        constructor() {
            this.backgroundTile = 0
            this.sprites = []
            this.codeToKind = []
            this.spriteCodes = []
            this.multipleSprites = [];
            this.tileHandler = undefined;
            this.arrivalHandlers = {}
            this.transitionHandlers = {}
            this.stationaryHandlers = {}
            this.tileKind = SpriteKind.create()
        }

        setMap(tileMap: Image) {
            this.tileMap = tileMap.clone();
            this.spriteMap = tileMap.clone();
            this.multiples = tileMap.clone();
            scene.setTileMap(this.tileMap)
            game.onUpdate(() => { this.update(); })
        }

        setBackgroundTile(backgroundTile: number) {
            this.backgroundTile = backgroundTile
        }

        addTiles(code: number, art: Image) {
            let tiles = scene.getTilesByType(code)
            scene.setTile(code, art);
        }

        addTileSprites(code: number, art:Image) {
            let tiles = scene.getTilesByType(code)
            scene.setTile(code, art);
            this.sprites[code] = []
            this.spriteCodes.push(code);
            for (let value of tiles) {
                let tileSprite = new TileSprite(this, code, art)
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

        private setKind(code: number, kind: number) {
            if (this.spriteCodes.find(c => c == code)) {
                this.sprites[code].forEach((s) => { s.setKind(kind) })
            }
        }

        makeGroup(code: number, code2: number, code3: number = 0xff, code4: number = 0xff) {
            let kind = SpriteKind.create()
            this.codeToKind[code] = kind;
            this.codeToKind[code2] = kind;
            this.setKind(code, kind); this.setKind(code2, kind)
            if (code3 != 0xff) {
                this.codeToKind[code3] = kind;
                this.setKind(code3, kind);
            }
            if (code4 != 0xff) {
                this.codeToKind[code4] = kind;
                this.setKind(code4, kind);
            }
            return kind;
        }

        onTileStationary(code: number, h: (ts: TileSprite) => void) {
            if (!this.stationaryHandlers[code]) {
                this.stationaryHandlers[code] = []
                if (code < this.tileKind) {
                    let process = (s: TileSprite) => 
                        this.stationaryHandlers[s.getCode()].forEach((h) => tryCatch(h,s));
                    this.sprites[code].forEach((spr) => spr.onTileStationary(process));
                } else {
                    let process = (s: TileSprite) => 
                        this.stationaryHandlers[s.kind()].forEach((h) => tryCatch(h,s));
                    let sprites = game.currentScene().spritesByKind[code].sprites()
                    sprites.forEach((spr) => (<TileSprite>spr).onTileStationary(process));
                }
            }
            this.stationaryHandlers[code].push(h);
        }

        onTileArrived(code: number, h: (ts: TileSprite, d: Dir) => void) {
            if (!this.arrivalHandlers[code]) {
                this.arrivalHandlers[code] = [];
                if (code < this.tileKind) {
                    let process = (s: TileSprite, d: Dir) => 
                        this.arrivalHandlers[s.getCode()].forEach((h) => tryCatchDir(h, s, d));
                    this.sprites[code].forEach((spr) => spr.onTileArrived(process))
                } else {
                    let process = (s: TileSprite, d: Dir) => 
                        this.arrivalHandlers[s.kind()].forEach((h) => tryCatchDir(h, s, d));
                    let sprites = game.currentScene().spritesByKind[code].sprites()
                    sprites.forEach((spr) => (<TileSprite>spr).onTileArrived(process));
                }
            }
            this.arrivalHandlers[code].push(h);
        }

        onTileTransition(code: number, h: (ts: TileSprite, r: number, c: number) => void) {
            if (!this.transitionHandlers[code]) {
                this.transitionHandlers[code] = [];
                if (code < this.tileKind) {
                    let process = (s: TileSprite, c: number, r: number) => 
                        this.transitionHandlers[s.getCode()].forEach((h) => tryCatchColRow(h, s, c, r));
                    this.sprites[code].forEach((spr) => spr.onTileTransition(process))
                } else {
                    let process = (s: TileSprite, c: number, r: number) => 
                        this.transitionHandlers[s.kind()].forEach((h) => tryCatchColRow(h, s, c, r));
                    let sprites = game.currentScene().spritesByKind[code].sprites()
                    sprites.forEach((spr) => (<TileSprite>spr).onTileTransition(process));
                }
            }
            this.transitionHandlers[code].push(h);
        }

        isOneOf(d: Dir, c1: Dir, c2: Dir = 0xff, c3: Dir = 0xff) {
            this.check(d == c1 || (c2 != 0xff && d == c2) || (c3 != 0xff && d==c3) )
        }

        isNotOneOf(d: Dir, c1: Dir, c2: Dir = 0xff, c3: Dir = 0xff) {
            this.check(d != c1 && (c2 == 0xff || d != c2) && (c3 == 0xff || d != c3))
        }

        check(expr: boolean) {
            if (!expr) {
                throw checkFailed;
            }
        }

        setCode(curs: Tile, code: number) {
            this.tileMap.setPixel(curs.getColumn(), curs.getRow(), code)
        }

        containsAt(codeKind: number, orig: Tile, dir: Dir = Dir.None, dir2: Dir = Dir.None, dir3: Dir = Dir.None) {
            if (codeKind < this.tileKind)
                return this.hasCode(codeKind, orig, dir, dir2, dir3)
            else
                return this.hasKind(codeKind, orig, dir, dir2, dir3)
        }

        hasMultiple(codeKind: number, orig: Tile, dir: Dir = Dir.None, dir2: Dir = Dir.None, dir3: Dir = Dir.None) {
            if (codeKind < this.tileKind && this.spriteCodes.find(c => c == codeKind)) {
                let cnt = 0
                this.sprites[codeKind].forEach((s) => {
                    if (s.getColumn() == orig.getColumn() && s.getRow() == orig.getRow())
                        cnt++
                })
                return cnt > 1
            }
            return false;
        }

        tileIs(codeKind: number, orig: Tile, dir: Dir = Dir.None, dir2: Dir = Dir.None, dir3: Dir = Dir.None) {
            let cursor = new Cursor(this, orig, dir, dir2, dir3);
            if (codeKind < this.tileKind) 
                return this.tileMap.getPixel(cursor.getColumn(), cursor.getRow()) == codeKind
            else
                return this.codeToKind[this.tileMap.getPixel(cursor.getColumn(), cursor.getRow())] == codeKind
        }

        private hasCode(code:number, orig: Tile, dir: Dir, dir2: Dir, dir3: Dir) {
            let cursor = new Cursor(this, orig, dir, dir2, dir3);
            return this.checkTile(code,cursor)
        }

        private hasKind(kind: number, orig: Tile, dir: Dir, dir2: Dir, dir3: Dir) {
            let cursor = new Cursor(this, orig, dir, dir2, dir3);
            return this.checkTileKind(kind, cursor)
        }

        private checkTile(code: number, curs: Cursor) {
            if (this.multiples.getPixel(curs.getColumn(), curs.getRow())) {
                if (this.spriteCodes.find(c => code == c))
                    return this.getSprite(code, curs) != null
                else 
                    return false
            } else {
                return this.spriteMap.getPixel(curs.getColumn(), curs.getRow()) == code
            }
        }

        private checkTileKind(kind: number, curs: Cursor) {
            if (this.multiples.getPixel(curs.getColumn(), curs.getRow())) {
                // TODO: need a similar check to check Tile?
                return this.getSprite(kind, curs) != null
            } else {
                return this.codeToKind[this.spriteMap.getPixel(curs.getColumn(), curs.getRow())] == kind
            }
        }

        removeSprite(s: TileSprite) {
            this.sprites[s.getCode()].removeElement(s)
            s.destroy()
        }

        getSprite(code: number, orig: Tile = null, dir: Dir = Dir.None, dir2: Dir = Dir.None, dir3: Dir = Dir.None) {
            if (code < this.tileKind)
                return this.getSpriteByCode(code, orig, dir, dir2, dir3)
            else
                return this.getSpriteByKind(code, orig, dir, dir2, dir3)
        }

        private getSpriteByCode(code: number, orig: Tile = null, dir: Dir, dir2: Dir, dir3: Dir) {
            if (orig) {
                let cursor = new Cursor(this, orig, dir, dir2, dir3);
                return this.sprites[code].find((t: Tile) =>
                    t.getColumn() == cursor.getColumn() && t.getRow() == cursor.getRow())
            } else {
                return this.sprites[code][0]
            }
        }

        private getSpriteByKind(kind: number, orig: Tile = null, dir: Dir, dir2: Dir, dir3: Dir) {
            let ss = game.currentScene().spritesByKind[kind].sprites()
            if (orig) {
                let cursor = new Cursor(this, orig, dir, dir2, dir3);
                return <TileSprite>ss.find(function (s: Sprite, index: number) {
                    return ((<TileSprite>s).getColumn() == cursor.getColumn()) &&
                           ((<TileSprite>s).getRow() == cursor.getRow())
                })
            } else {
                return <TileSprite>ss[0]
            }
        }

        private update() {
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

    // basic movement for tile sprite
    export function bindToController(sprite: TileSprite) {
        controller.left.onEvent(ControllerButtonEvent.Pressed, function () {
            sprite.notifyArrived(Dir.Left)
        })
        controller.left.onEvent(ControllerButtonEvent.Released, function () {
            sprite.requestStop()
        })
        controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
            sprite.notifyArrived(Dir.Right)
        })
        controller.right.onEvent(ControllerButtonEvent.Released, function () {
            sprite.requestStop()
        })
        controller.up.onEvent(ControllerButtonEvent.Pressed, function () {
            sprite.notifyArrived(Dir.Up)
        })
        controller.up.onEvent(ControllerButtonEvent.Released, function () {
            sprite.requestStop()
        })
        controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
            sprite.notifyArrived(Dir.Down)
        })
        controller.down.onEvent(ControllerButtonEvent.Released, function () {
            sprite.requestStop()
        })
    }

    // helpers

    interface Tile {
        getColumn(): number;
        getRow(): number;
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

    class CheckFailed {

    }

    let checkFailed = new CheckFailed();

    let tryCatch = (h: (s: TileSprite) => void, s: TileSprite) => {
        try {
            h(s)
        } catch (e) {
            // TODO
        }
    }

    let tryCatchDir = (h: (s: TileSprite, d: Dir) => void, s: TileSprite, d: Dir) => {
        try {
            h(s, d)
        } catch (e) {
            // TODO
        }
    }

    let tryCatchColRow = (h: (s: TileSprite, c: number, r: number) => void, s: TileSprite, c: number, r: number) => {
        try {
            h(s, c, r)
        } catch (e) {
            // TODO
        }
    }
}
