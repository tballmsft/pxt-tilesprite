// which direction is the sprite moving
enum TileDir {
    //% block="None"
    None,
    //% block="Left"
    Left,
    //% block="Right"
    Right,
    //% block="Up"
    Up,
    //% block="Down"
    Down
}

//% blockId=tiledir block="$dir"
function _tileDir(dir: TileDir): number {
    return dir;
}

enum ResultSet {
    //% block="has no"
    Zero,
    //% block="has one"
    One,
}

enum Membership {
    //% block="one of"
    OneOf,
    //% block="not one of"
    NotOneOf
}

enum Spritely {
    //% block="fixed"
    Fixed,
    //% block="movable"
    Movable
}

//% weight=1000 color="#442255" icon="\uf45c"
//% groups='["Tiles", "Events", "Tests", "Actions"]'
//% blockGap=8
namespace TileWorld {

    // a sprite that moves by tiles, but only in one of four directions
    //%
    class TileSprite extends Sprite implements Tile {
        public tileBits: number;
        private code: number;
        private parent: TileWorld;
        // which direction is the target 
        private dir: TileDir;
        // previous sprite coord value
        private old: number;
        // the next tile target
        private next: number
        // the final tile target
        private final: number;
        // the next direction to go
        private queue_dir: TileDir;
        // notification
        private onArrived: (ts: TileSprite, d: TileDir) => void
        private onStationary: (ts: TileSprite) => void
        private onTransition: (ts: TileSprite, prevCol: number, prevRow: number) => void

        constructor(world: TileWorld, code: number, image: Image, kind: number, bits: number = 4) {
            super(image);
            const scene = game.currentScene();
            scene.physicsEngine.addSprite(this);
            this.setKind(kind)
            this.parent = world;
            this.code = code
            this.tileBits = bits;
            this.dir = TileDir.None;
            this.queue_dir = TileDir.None;
            this.onArrived = undefined;
            this.onStationary = undefined;
            this.onTransition = undefined;
        } 
   
        moveOne(dir: number) {
            if (dir == TileDir.Left || dir == TileDir.Right)
                this.moveInX(dir)
            else if (dir == TileDir.Up || dir == TileDir.Down)
                this.moveInY(dir)
        }

        // request sprite to stop moving when it reaches destination
        requestStop() { this.final = 0; }
        // stop at current tile
        deadStop() { this.stopSprite(false) }
        // back to previous tile
        knockBack() {
            if ((this.dir == TileDir.Left || this.dir == TileDir.Right) &&
                this.old != this.getColumn()) {
                this.x = this.centerIt(this.old << this.tileBits)
            } else if ((this.dir == TileDir.Up || this.dir == TileDir.Down) &&
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
        onTileArrived(handler: (ts: TileSprite, d: TileDir) => void) {
            this.onArrived = handler
        }
        notifyArrived(d: TileDir) {
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
            if (this.dir == TileDir.None)
                return;
            // have we crossed into a new tile?
            if (this.onTransition) {
                if (this.dir == TileDir.Left || this.dir == TileDir.Right) {
                    if (this.old != this.getColumn()) {
                        this.onTransition(this, this.old, this.getRow())
                    }
                    this.old = this.getColumn()
                } else if (this.dir == TileDir.Up || this.dir == TileDir.Down) {
                    if (this.old != this.getRow()) {
                        this.onTransition(this, this.getColumn(), this.old)
                    }
                    this.old = this.getRow()
                }
            }
            // have we reached the target?
            let size = 1 << this.tileBits
            if (this.dir == TileDir.Left && this.x <= this.next) {
                this.reachedTargetX(this.next, -size)
            } else if (this.dir == TileDir.Right && this.x >= this.next) {
                this.reachedTargetX(this.next, size)
            } else if (this.dir == TileDir.Up && this.y <= this.next) {
                this.reachedTargetY(this.next, -size)
            } else if (this.dir == TileDir.Down && this.y >= this.next) {
                this.reachedTargetY(this.next, size)
            }
        }
        updateStationary() {
            if (this.onStationary && this.dir == TileDir.None) {
                this.onStationary(this)
            }
        }
        private moveInX(dir: TileDir) {
            let size = 1 << this.tileBits
            let opTileDir = dir == TileDir.Left ? TileDir.Right : TileDir.Left
            let sign = dir == TileDir.Left ? -1 : 1
            if (this.dir == dir) {
                this.final += sign * size;
                return;
            } else if (this.dir == opTileDir) {
                // switching 180 doesn't require queuing
                // next_x is defined, so use it
                this.next += sign * size
            } else if (this.dir == TileDir.None) {
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
        private moveInY(dir: TileDir) {
            let size = 1 << this.tileBits
            let opTileDir = dir == TileDir.Up ? TileDir.Down : TileDir.Up
            let sign = dir == TileDir.Up ? -1 : 1
            if (this.dir == dir) {
                this.final += sign * size;
                return;
            } else if (this.dir == opTileDir) {
                // next_x is defined, so use it
                this.next += sign * size
            } else if (this.dir == TileDir.None) {
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
            if (this.dir == TileDir.None) {
                if (this.queue_dir != TileDir.None) {
                    this.moveOne(this.queue_dir)
                }
                this.queue_dir = TileDir.None;
            }
        }
        private reachedTargetX(x: number, step: number, reentrant: boolean = true) {
            // determine what comes next
            this.x = x
            let keepTileDir = TileDir.None
            if (this.final && this.next != this.final) {
                this.next += step
            } else {
                if (this.final) keepTileDir = this.dir
                this.dir = TileDir.None
                this.vx = 0
            }
            // notify
            if (this.onArrived && reentrant) {
                this.onArrived(this, keepTileDir)
            }
            this.doQueued()
            this.old = this.getColumn()
        }
        private reachedTargetY(y: number, step: number, reentrant: boolean = true) {
            this.y = y
            let keepTileDir = TileDir.None
            if (this.final && this.next != this.final) {
                this.next += step
            } else {
                if (this.final) keepTileDir = this.dir
                this.dir = TileDir.None
                this.vy = 0
            }
            // notify
            if (this.onArrived && reentrant) {
                this.onArrived(this, keepTileDir)
            }
            this.doQueued()
            this.old = this.getRow()
        }
        private centerIt(n: number) {
            return ((n >> this.tileBits) << this.tileBits) + (1 << (this.tileBits - 1))
        }
        private stopSprite(reentrant: boolean) {
            this.final = 0
            this.queue_dir = TileDir.None
            if (this.dir == TileDir.Left || this.dir == TileDir.Right) {
                this.reachedTargetX(this.centerIt(this.x), 0, reentrant)
            } else {
                this.reachedTargetY(this.centerIt(this.y), 0, reentrant)
            }
        }
    }

    // the tile world manages tile sprites
    class TileWorld {
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
        private arrivalHandlers: { [index:number]: ((ts: TileSprite, d: TileDir) => void)[] };
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

        addTiles(code: number, art: Image, kind: number) {
            let tiles = scene.getTilesByType(code)
            this.codeToKind[code] = kind;
            scene.setTile(code, art);
        }

        addTileSprites(code: number, art:Image, kind: number) {
            let tiles = scene.getTilesByType(code)
            scene.setTile(code, art);
            this.sprites[code] = []
            this.spriteCodes.push(code);
            this.codeToKind[code] = kind;
            this.initHandlers(kind)
            for (let value of tiles) {
                let tileSprite = new TileSprite(this, code, art, kind)
                this.hookupHandlers(tileSprite)
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

        onTileStationary(kind: number, h: (ts: TileSprite) => void) {
            if (!this.stationaryHandlers[kind]) {
                this.stationaryHandlers[kind] = []
            }
            this.stationaryHandlers[kind].push(h);
        }

        onTileArrived(kind: number, h: (ts: TileSprite, d: TileDir) => void) {
            if (!this.arrivalHandlers[kind]) {
                this.arrivalHandlers[kind] = [];
            }
            this.arrivalHandlers[kind].push(h);
        }

        onTileTransition(kind: number, h: (ts: TileSprite, r: number, c: number) => void) {
            if (!this.transitionHandlers[kind]) {
                this.transitionHandlers[kind] = [];          }
            this.transitionHandlers[kind].push(h);
        }

        isOneOf(d: TileDir, c1: TileDir, c2: TileDir = 0xff, c3: TileDir = 0xff) {
            this.check(d == c1 || (c2 != 0xff && d == c2) || (c3 != 0xff && d==c3) )
        }

        isNotOneOf(d: TileDir, c1: TileDir, c2: TileDir = 0xff, c3: TileDir = 0xff) {
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

        containsAt(codeKind: number, orig: Tile, dir: TileDir = TileDir.None, dir2: TileDir = TileDir.None, dir3: TileDir = TileDir.None) {
            if (codeKind < this.tileKind)
                return this.hasCode(codeKind, orig, dir, dir2, dir3)
            else
                return this.hasKind(codeKind, orig, dir, dir2, dir3)
        }

        // are there more than 1 sprite of kind at tile
        hasMultiple(codeKind: number, orig: Tile, dir: TileDir = TileDir.None, dir2: TileDir = TileDir.None, dir3: TileDir = TileDir.None) {
            if (codeKind < this.tileKind && this.spriteCodes.indexOf(codeKind) != -1) {
                let cnt = 0
                this.sprites[codeKind].forEach((s) => {
                    if (s.getColumn() == orig.getColumn() && s.getRow() == orig.getRow())
                        cnt++
                })
                return cnt > 1
            } else if (codeKind > this.tileKind) {
                let ss = game.currentScene().spritesByKind[codeKind].sprites()
                let cnt = 0
                ss.forEach(function (s) {
                    let ts = <TileSprite>s
                    if (ts.getColumn() == orig.getColumn() && ts.getRow() == orig.getRow())
                        cnt++
                })
                return cnt
            }
            return false;
        }

        // check the code for the underlying tile
        tileIs(codeKind: number, orig: Tile, dir: TileDir = TileDir.None, dir2: TileDir = TileDir.None, dir3: TileDir = TileDir.None) {
            let cursor = new Cursor(this, orig, dir, dir2, dir3);
            if (codeKind < this.tileKind && this.spriteCodes.indexOf(codeKind) == -1) 
                return this.tileMap.getPixel(cursor.getColumn(), cursor.getRow()) == codeKind
            else
                return false
        }

        private hasCode(code:number, orig: Tile, dir: TileDir, dir2: TileDir, dir3: TileDir) {
            let cursor = new Cursor(this, orig, dir, dir2, dir3);
            return this.checkTile(code,cursor)
        }

        private hasKind(kind: number, orig: Tile, dir: TileDir, dir2: TileDir, dir3: TileDir) {
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

        getSprite(code: number, orig: Tile = null, dir: TileDir = TileDir.None, dir2: TileDir = TileDir.None, dir3: TileDir = TileDir.None) {
            if (code < this.tileKind)
                return this.getSpriteByCode(code, orig, dir, dir2, dir3)
            else
                return this.getSpriteByKind(code, orig, dir, dir2, dir3)
        }

        private getSpriteByCode(code: number, orig: Tile = null, dir: TileDir, dir2: TileDir, dir3: TileDir) {
            if (orig) {
                let cursor = new Cursor(this, orig, dir, dir2, dir3);
                return this.sprites[code].find((t: Tile) =>
                    t.getColumn() == cursor.getColumn() && t.getRow() == cursor.getRow())
            } else {
                return this.sprites[code][0]
            }
        }

        private getSpriteByKind(kind: number, orig: Tile = null, dir: TileDir, dir2: TileDir, dir3: TileDir) {
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

        private initHandlers(kind: number) {
            if (!this.stationaryHandlers[kind]) this.stationaryHandlers[kind] = []
            if (!this.arrivalHandlers[kind]) this.arrivalHandlers[kind] = []
            if (!this.transitionHandlers[kind]) this.transitionHandlers[kind] = []
        }
        private hookupHandlers(s: TileSprite) {
            this.hookupArrival(s)
            this.hookupStationary(s)
            this.hookupTransition(s)
        }
        private hookupStationary(s: TileSprite) {
            let process = (s: TileSprite) =>
                this.stationaryHandlers[s.kind()].forEach((h) => tryCatch(h, s));
            s.onTileStationary(process);
        }
        private hookupArrival(s: TileSprite) {
            let process = (s: TileSprite, d: TileDir) =>
                this.arrivalHandlers[s.kind()].forEach((h) => tryCatchTileDir(h, s, d));
            s.onTileArrived(process);
        }
        private hookupTransition(s: TileSprite) {
            let process = (s: TileSprite, c: number, r: number) =>
                this.transitionHandlers[s.kind()].forEach((h) => tryCatchColRow(h, s, c, r));
            s.onTileTransition(process);
        }
    }

    // basic movement for tile sprite
    function bindToController(sprite: TileSprite) {
        controller.left.onEvent(ControllerButtonEvent.Pressed, function () {
            sprite.notifyArrived(TileDir.Left)
        })
        controller.left.onEvent(ControllerButtonEvent.Released, function () {
            sprite.requestStop()
        })
        controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
            sprite.notifyArrived(TileDir.Right)
        })
        controller.right.onEvent(ControllerButtonEvent.Released, function () {
            sprite.requestStop()
        })
        controller.up.onEvent(ControllerButtonEvent.Pressed, function () {
            sprite.notifyArrived(TileDir.Up)
        })
        controller.up.onEvent(ControllerButtonEvent.Released, function () {
            sprite.requestStop()
        })
        controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
            sprite.notifyArrived(TileDir.Down)
        })
        controller.down.onEvent(ControllerButtonEvent.Released, function () {
            sprite.requestStop()
        })
    }

    // helpers

    export interface Tile {
        getColumn(): number;
        getRow(): number;
    }

    // a cursor is just a coordinate
    class Cursor implements Tile {
        private world: TileWorld;
        private col: number;
        private row: number;
        constructor(w: TileWorld, s: Tile, dir: TileDir, dir2: TileDir = TileDir.None, dir3: TileDir = TileDir.None) {
            this.world = w;
            this.col = s.getColumn();
            this.row = s.getRow();
            this.move(dir); this.move(dir2); this.move(dir3)
        }
        private move(dir: TileDir) {
            switch (dir) {
                case TileDir.Left: this.col--; break;
                case TileDir.Right: this.col++; break;
                case TileDir.Up: this.row--; break;
                case TileDir.Down: this.row++; break;
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

    let tryCatchTileDir = (h: (s: TileSprite, d: TileDir) => void, s: TileSprite, d: TileDir) => {
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


    let myWorld = new TileWorld();
    // keep track of sprites passed down through active handler
    // so user code doesn't need to refer to it.
    let active: TileSprite[] = [];

    /**
     * Set the map for placing tiles in the scene
     * @param map
     */
    //% blockId=TWsettilemap block="set tile map to %map=tilemap_image_picker"
    //% group="Tiles"
    export function setTileMap(map: Image) {
        myWorld.setMap(map)
    }

    /**
     * Set the background tile for sprites
     * @param color
     */
    //% group="Tiles"
    //% blockId=TWsetbackgroundtile block="set background tile to %color=colorindexpicker"
    export function setBackgroundTile(code: number) {
        myWorld.setBackgroundTile(code)
    }

    /**
     * Set an image as a tile at the given index. Tiles should be a 16x16 image
     * @param index
     * @param img
     */
    //% blockId=TWaddsprite block="set $code=colorindexpicker to $kk sprite $image=tile_image_picker with $kind=spritekind"
    //% group="Tiles"
    //% inlineInputMode=inline
    export function addSprite(code: number, image: Image, moving: Spritely, kind: number) {
        if (moving == Spritely.Fixed)
            myWorld.addTiles(code, image, kind)
        else
            myWorld.addTileSprites(code, image, kind)
    }

    /**	
    * Move sprite with buttons	
    * @param color	
    */
    //% group="Tiles"	
    //% blockId=TWmoveButtons block="move $kind=spritekind with buttons"	
    export function moveWithButtons(kind: number) {
        let sprites = game.currentScene().spritesByKind[kind].sprites()
        sprites.forEach((s) => {
            if (s instanceof TileSprite) {
                bindToController(<TileSprite>s)
            }
        }
        )
    }

    // notifications

    /**
     * Act on a sprite that is resting on a tile
     * @param body code to execute
     */
    //% group="Events" color="#444488"
    //% blockId=TWontilestationary block="on change around $kind=spritekind"
    //% blockAllowMultiple=1 draggableParameters="reporter"
    export function onTileStationary(kind: number, h: () => void) {
        myWorld.onTileStationary(kind, (t) => {
            active.push(t)
            h() 
            active.pop()
        });
    }

    /**
     * Sprite is at center of tile and received request to move
     * @param body code to execute
     */
    //% group="Events" color="#444488"
    //% blockId=TWontilearrived block="on request of $kind=spritekind to move $direction"
    //% blockAllowMultiple=1 draggableParameters="reporter"
    export function onTileArrived(kind: number, h: (irection: TileDir) => void) {
        myWorld.onTileArrived(kind, (t, d) => {
            active.push(t)
            h(d)
            active.pop()
        })
    }

    /**
     * Sprite has just move into (entered) a tile
     * @param body code to execute
     */
    //% group="Events" color="#444488"
    //% blockId=TWontiletransition block="on $kind=spritekind moved into tile"
    //% blockAllowMultiple=1 draggableParameters="reporter"
    export function onTileTransition(kind: number, h: () => void) {
        myWorld.onTileTransition(kind, (t) => {
            active.push(t)
            h()
            active.pop()
        })
    }

    // tests

    // TODO - need to take account of the self sprite - that is, to not acount it
    // TODO - in the following methods

    //% blockId=TWhascode block="test $dir=tiledir $dir2=tiledir $size $code=colorindexpicker"
    //% group="Tests" color="#448844" inlineInputMode=inline
    export function hasCode(code: number, dir: number = TileDir.None, dir2: number = TileDir.None, size: ResultSet = ResultSet.Zero) {
        let tile = active[0]
        if (size == ResultSet.One)
            myWorld.check(myWorld.containsAt(code, tile, dir, dir2))
        else if (size == ResultSet.Zero)
            myWorld.check(!myWorld.containsAt(code, tile, dir, dir2))
    }

    //% blockId=TWhaskind block="test $dir=tiledir $dir2=tiledir $size $kind=spritekind"
    //% group="Tests" color="#448844" inlineInputMode=inline
    export function hasKind(kind: number, dir: number = TileDir.None, dir2: number = TileDir.None, size: ResultSet = ResultSet.Zero) {
        let tile = active[0]
        if (size == ResultSet.One)
            myWorld.check(myWorld.containsAt(kind, tile, dir, dir2))
        else if (size == ResultSet.Zero)
            myWorld.check(!myWorld.containsAt(kind, tile, dir, dir2))
    }

    /**
     * Check if a direction is one of several values.
     */
    //% group="Tests" color="#448844"
    //% blockId=TWisoneof block="test %dir=variables_get(direction) $cmp %c1 %c2"
    //% inlineInputMode=inline
    export function isOneOf(dir: number, cmp: Membership = Membership.OneOf, c1: TileDir, c2: TileDir) {
        if (cmp == Membership.OneOf)
            myWorld.isOneOf(dir, c1, c2)
        else
            myWorld.isNotOneOf(dir, c1, c2)
    }

    // actions

    // tests - on tile, see, got, bumped

    // actions, move, turn, holding, shoot, color

    // identification of target is complicated:
    // (tile, dir) identifies tile that we want to act on
    // - code vs. spritekind

    // the action may also hav

    // block
    // get(code: number, dir: TileDir = TileDir.None, dir2: TileDir = TileDir.None, dir3: TileDir = TileDir.None) {
    //    return this.parent.getSprite(code, this, dir, dir2, dir3)
    // }
    //% blockId=TWsettilecode block="set code at $this(tile) to $code=colorindexpicker"
    //% group="Actions" color="#88CC44"
    //setCode(code: number) {
    //    this.parent.setCode(this, code)
    //}
    //% blockId=TWremove block="remove sprite at $this(tile)"
    //% group="Actions" color="#88CC44"
    //remove() {
    //    this.parent.removeSprite(this)
    //}    
    // request sprite to move in specified direction
    //% blockId=TWmove block="move sprite at $this(tile) $dir=tiledir"
    //% group="Actions" color="#88CC44"
}
