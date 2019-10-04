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

    enum CallBackKind {
        Stationary = TileDir.Down + 1,
        Transition
    }

    const tileBits = 4;

    // a sprite that moves by tiles, but only in one of four directions
    class TileSprite extends Sprite implements Tile {
        // which tile map code does this sprite represent?
        private code: number;
        // which direction is the target 
        private dir: TileDir;
        // previous sprite coord value
        private old: number;
        // the next tile target
        private next: number
        // the final tile target
        private final: number;
        // notification
        private tileSpriteEvent: (ts: TileSprite, n: CallBackKind) => void
        //
        constructor(world: TileWorld, code: number, image: Image, kind: number) {
            super(image);
            const scene = game.currentScene();
            scene.physicsEngine.addSprite(this);
            this.setKind(kind)
            this.code = code
            this.dir = TileDir.None;
            this.tileSpriteEvent = undefined;
        } 
        //
        moveOne(dir: number) {
            if (dir == TileDir.Left || dir == TileDir.Right)
                return this.moveInX(dir)
            else if (dir == TileDir.Up || dir == TileDir.Down)
                return this.moveInY(dir)
            return false;
        }
        // request sprite to stop moving when it reaches destination
        requestStop() { this.final = 0; }
        // stop at current tile
        deadStop() { this.stopSprite() }
        // back to previous tile
        knockBack() {
            if ((this.dir == TileDir.Left || this.dir == TileDir.Right) &&
                this.old != this.getColumn()) {
                this.x = this.centerIt(this.old << tileBits)
            } else if ((this.dir == TileDir.Up || this.dir == TileDir.Down) &&
                this.old != this.getRow()) {
                this.y = this.centerIt(this.old << tileBits)
            }
            this.stopSprite()
        }
        //
        getCode() { return this.code }
        getDirection() { return this.dir }
        getColumn() { return this.x >> tileBits }
        getRow() { return this.y >> tileBits }
        // notify client on entering tile
        onTileSpriteEvent(handler: (ts: TileSprite, d: number) => void) {
            this.tileSpriteEvent = handler
        }
        // 
        notifyArrived(d: TileDir) {
            if (this.tileSpriteEvent) {
                this.tileSpriteEvent(this, <number>d)
            }
        }
        // call from game update loop
        updateInMotion() {
            if (this.dir == TileDir.None)
                return;
            // have we crossed into a new tile?
            if (this.tileSpriteEvent) {
                if (this.dir == TileDir.Left || this.dir == TileDir.Right) {
                    if (this.old != this.getColumn()) {
                        this.tileSpriteEvent(this, CallBackKind.Transition)
                    }
                    this.old = this.getColumn()
                } else if (this.dir == TileDir.Up || this.dir == TileDir.Down) {
                    if (this.old != this.getRow()) {
                        this.tileSpriteEvent(this, CallBackKind.Transition)
                    }
                    this.old = this.getRow()
                }
            }
            // have we reached the target?
            let size = 1 << tileBits
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
        //
        updateStationary() {
            if (this.tileSpriteEvent && this.dir == TileDir.None) {
                this.tileSpriteEvent(this, CallBackKind.Stationary)
            }
        }
        //
        private moveInX(dir: TileDir) {
            let size = 1 << tileBits
            let opTileDir = dir == TileDir.Left ? TileDir.Right : TileDir.Left
            let sign = dir == TileDir.Left ? -1 : 1
            if (this.dir == dir) {
                this.final += sign * size;
                return true;
            } else if (this.dir == opTileDir) {
                // switching 180 doesn't require queuing
                // next_x is defined, so use it
                this.next += sign * size
            } else if (this.dir == TileDir.None) {
                // player.x is aligned, so use it
                this.next = this.x + sign * size;
            } else {
                // direction is 90 to current direction, so ignore
                return false;
            }
            this.old = this.getColumn()
            this.dir = dir
            this.final = this.next;
            this.vx = sign * 100
            return true;
        }
        private moveInY(dir: TileDir) {
            let size = 1 << tileBits
            let opTileDir = dir == TileDir.Up ? TileDir.Down : TileDir.Up
            let sign = dir == TileDir.Up ? -1 : 1
            if (this.dir == dir) {
                this.final += sign * size;
                return true;
            } else if (this.dir == opTileDir) {
                // next_x is defined, so use it
                this.next += sign * size
            } else if (this.dir == TileDir.None) {
                // player.x is aligned, so use it
                this.next = this.y + sign * size;
            } else {
                // direction is 90 to current direction, so ignore
                return false;
            }
            this.old = this.getRow()
            this.dir = dir
            this.final = this.next
            this.vy = sign * 100
            return true;
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
            if (this.tileSpriteEvent && reentrant) {
                this.tileSpriteEvent(this, <number>keepTileDir)
            }
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
            if (this.tileSpriteEvent && reentrant) {
                this.tileSpriteEvent(this, <number>keepTileDir)
            }
            this.old = this.getRow()
        }
        private centerIt(n: number) {
            return ((n >> tileBits) << tileBits) + (1 << (tileBits - 1))
        }
        private stopSprite() {
            this.final = 0
            if (this.dir == TileDir.Left || this.dir == TileDir.Right) {
                this.reachedTargetX(this.centerIt(this.x), 0, false)
            } else {
                this.reachedTargetY(this.centerIt(this.y), 0, false)
            }
        }
    }

    // the tile world manages tile sprites
    class TileWorld {
        // which codes map to sprites?
        private spriteCodes: number[];
        // map codes to kinds
        private codeToKind: number[];
        // the sprites, divided up by codes
        private sprites: TileSprite[][];
        // the current tile map (no sprites)  
        private tileMap: Image;
        // fill in with sprites
        private spriteMap: Image;
        // note tiles with more than one sprite
        private multiples: Image;
        private multipleSprites: TileSprite[];
        private arrivalHandlers: { [index:number]: ((ts: TileSprite, d: TileDir) => void)[] };
        private transitionHandlers: { [index:number]: ((ts: TileSprite) => void)[] };
        private stationaryHandlers: { [index:number]: ((ts: TileSprite) => void)[] };
        private backgroundTile: number;
        private tileKind: number;
        //
        constructor() {
            this.backgroundTile = -1
            this.sprites = []
            this.codeToKind = []
            this.spriteCodes = []
            this.multipleSprites = [];
            this.arrivalHandlers = {}
            this.transitionHandlers = {}
            this.stationaryHandlers = {}
            this.tileKind = SpriteKind.create()
        }
        // methods for defining map and sprites
        setMap(tileMap: Image) {
            this.tileMap = tileMap.clone();
            this.spriteMap = tileMap.clone();
            this.multiples = tileMap.clone();
            scene.setTileMap(this.tileMap)
            game.onUpdate(() => { this.update(); })
        }
        //
        setBackgroundTile(backgroundTile: number) {
            this.backgroundTile = backgroundTile
        }
        //
        setCode(curs: Tile, code: number) {
            this.tileMap.setPixel(curs.getColumn(), curs.getRow(), code)
        }
        //
        addTiles(code: number, art: Image, kind: number) {
            let tiles = scene.getTilesByType(code)
            this.codeToKind[code] = kind;
            scene.setTile(code, art);
        }
        //
        addTileSprites(code: number, art:Image, kind: number) {
            let tiles = scene.getTilesByType(code)
            scene.setTile(code, art);
            this.spriteCodes.push(code);
            this.codeToKind[code] = kind;
            this.initHandlers(kind)
            this.sprites[code] = []
            for (let value of tiles) {
                let tileSprite = new TileSprite(this, code, art, kind)
                this.hookupHandlers(tileSprite)
                this.sprites[code].push(tileSprite)
                value.place(tileSprite)
            }
            // remove from tile map
            if (this.backgroundTile != -1) {
                for (let y = 0; y < this.tileMap.height; y++) {
                    for (let x = 0; x < this.tileMap.width; x++) {
                        let pixel = this.tileMap.getPixel(x, y)
                        if (code == pixel) 
                            this.tileMap.setPixel(x, y, this.backgroundTile)
                    }
                }
            }
        }
        // register event handlers
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
        onTileTransition(kind: number, h: (ts: TileSprite) => void) {
            if (!this.transitionHandlers[kind]) {
                this.transitionHandlers[kind] = [];          }
            this.transitionHandlers[kind].push(h);
        }
        //
        numberAt(codeKind: number, orig: Tile, dir: TileDir = TileDir.None, dir2: TileDir = TileDir.None) {
            let curs = new Cursor(this, orig, dir, dir2);
            if (this.multiples.getPixel(curs.getColumn(), curs.getRow())) {
                return this._getSpritesCursor(codeKind, curs).length
            } else {
                // TODO: if the thing is a tile, this doesn't work
                if (codeKind < this.tileKind)
                    return (this.spriteMap.getPixel(curs.getColumn(), curs.getRow()) == codeKind) ? 1 : 0
                else
                    return (this.codeToKind[this.spriteMap.getPixel(curs.getColumn(), curs.getRow())] == codeKind) ? 1 : 0
            }
        }
        // check the code for the underlying tile
        tileIs(codeKind: number, orig: Tile, dir: TileDir = TileDir.None, dir2: TileDir = TileDir.None) {
            let cursor = new Cursor(this, orig, dir, dir2);
            if (codeKind < this.tileKind && this.spriteCodes.indexOf(codeKind) == -1) 
                return this.tileMap.getPixel(cursor.getColumn(), cursor.getRow()) == codeKind
            else
                return false
        }
        //
        getSprites(code: number, orig: Tile = null, dir: TileDir = TileDir.None, dir2: TileDir = TileDir.None) {
            if (orig) {
                return this._getSpritesCursor(code, new Cursor(this, orig, dir, dir2));
            } else
                return this._getSprites(code)
        }
        //
        removeSprite(s: TileSprite) {
            this.sprites[s.getCode()].removeElement(s)
            s.destroy()
        }
        private _getSpritesCursor(codeKind: number, cursor: Cursor) {
            let ss = this._getSprites(codeKind)
            return ss.filter((t: TileSprite) =>
                t.getColumn() == cursor.getColumn() && t.getRow() == cursor.getRow())
        }
        private _getSprites(codeKind: number): any[] {
            if (codeKind < this.tileKind && this.spriteCodes.indexOf(codeKind) != -1) {
                return this.sprites[codeKind]
            } else if (codeKind > this.tileKind) {
                return game.currentScene().spritesByKind[codeKind].sprites()
            }
            return [];
        }
        //
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

            // two main update steps (ordering issues to be addressed
            // by tracking which sprite is affected by which step and lot
            // 

            // 1. update the moving sprites
            this.sprites.forEach((arr) => {
                if (arr) arr.forEach((sprite) => { sprite.updateInMotion() })
            })

            // TODO: note that a sprite can be acted upon twice, if
            // TODO: it transitions from moving to stationary
            // TODO: we should detect this
            
            // 2. update the stationary sprites
            this.sprites.forEach((arr) => {
                if (arr) { arr.forEach((sprite) => { sprite.updateStationary() }) }
            })
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
            let process = (s: TileSprite, d: number) => {
                if (d == CallBackKind.Stationary)
                    this.stationaryHandlers[s.kind()].forEach((h) => tryCatch(h, s));
                else if (d == CallBackKind.Transition)
                    this.transitionHandlers[s.kind()].forEach((h) => tryCatch(h, s));
                else
                    this.arrivalHandlers[s.kind()].forEach((h,d) => tryCatchDir(h, s, d));
 
            }
            s.onTileSpriteEvent(process)
        }
    }

    // queue is of size one
    class BindController {
        private sprite: TileSprite;
        constructor() {
        }
        private requestMove(dir: TileDir) {
            if (!this.sprite.moveOne(dir)) {
                this.sprite.deadStop();
                this.sprite.moveOne(dir)
            }
        }
        private requestStop(dir: TileDir) {
            if (dir == this.sprite.getDirection()) {
                this.sprite.requestStop()
            }
        }
        // basic movement for tile sprite
        bindToController(s: TileSprite) {
            this.sprite = s;
            controller.left.onEvent(ControllerButtonEvent.Pressed, function () {
                this.requestMove(TileDir.Left)
            })
            controller.left.onEvent(ControllerButtonEvent.Released, function () {
                this.requestStop(TileDir.Left)
            })
            controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
                this.requestMove(TileDir.Right)
            })
            controller.right.onEvent(ControllerButtonEvent.Released, function () {
                this.requestStop(TileDir.Right)
            })
            controller.up.onEvent(ControllerButtonEvent.Pressed, function () {
                this.requestMove(TileDir.Up)
            })
            controller.up.onEvent(ControllerButtonEvent.Released, function () {
                this.requestStop(TileDir.Up)
            })
            controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
                this.requestMove(TileDir.Down)
            })
            controller.down.onEvent(ControllerButtonEvent.Released, function () {
                this.requestStop(TileDir.Down)
            })
        }
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
        constructor(w: TileWorld, s: Tile, dir: TileDir, dir2: TileDir = TileDir.None) {
            this.world = w;
            this.col = s.getColumn();
            this.row = s.getRow();
            this.move(dir); this.move(dir2)
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

    let tryCatchDir = (h: (s: TileSprite, d: TileDir) => void, s: TileSprite, d: TileDir) => {
        try {
            h(s, d)
        } catch (e) {
            // TODO
        }
    }

    function check(expr: boolean) {
        if (!expr) {
            throw checkFailed;
        }
    }

    // basic checking (TODO: can be lifted out)
    function isOneOf(d: TileDir, c1: TileDir, c2: TileDir = 0xff, c3: TileDir = 0xff) {
        check(d == c1 || (c2 != 0xff && d == c2) || (c3 != 0xff && d == c3))
    }

    function isNotOneOf(d: TileDir, c1: TileDir, c2: TileDir = 0xff, c3: TileDir = 0xff) {
        check(d != c1 && (c2 == 0xff || d != c2) && (c3 == 0xff || d != c3))
    }

    // state here supports blocks

    let myWorld = new TileWorld();
    let myPlayerController = new BindController()
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
        let first = sprites[0]
        if (first instanceof TileSprite) {
            myPlayerController(<TileSprite>first)
        }
    }

    // notifications

    /**
     * Act on a sprite that is resting on a tile
     * @param body code to execute
     */
    //% group="Events" color="#444488"
    //% blockId=TWontilestationary block="on change around $kind=spritekind"
    //% blockAllowMultiple=1 draggableParameters="reporter"
    export function onChangeAround(kind: number, h: () => void) {
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
    export function onMoveRequest(kind: number, h: (d: TileDir) => void) {
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
    export function onMovedInto(kind: number, h: () => void) {
        myWorld.onTileTransition(kind, (t) => {
            active.push(t)
            h()
            active.pop()
        })
    }

    /**	
    * Get the currently active sprite	
    */
    //% group="Tiles"	
    //% blockId=TWgetsprite block="get current sprite"
    export function getCurrentSprite(): TileSprite {
        if (active.length > 0) {
            return active[active.length-1]
        }
        return null
    }

    // tests

    // TODO - need to take account of the self sprite - that is, to not acount it
    // TODO - in the following methods

    //% blockId=TWhascode block="test $dir=tiledir $dir2=tiledir $size $code=colorindexpicker"
    //% group="Tests" color="#448844" inlineInputMode=inline
    export function hasCode(code: number, dir: number = TileDir.None, dir2: number = TileDir.None, size: ResultSet = ResultSet.Zero) {
        let tile = getCurrentSprite()
        check(tile != null) 
        let delta = code == tile.getCode() ? -1 : 0
        if (size == ResultSet.One) {
            check(myWorld.numberAt(code, tile, dir, dir2)+delta == 1)
        } else if (size == ResultSet.Zero)
            check(myWorld.numberAt(code, tile, dir, dir2)+delta == 0)
    }

    //% blockId=TWhaskind block="test $dir=tiledir $dir2=tiledir $size $kind=spritekind"
    //% group="Tests" color="#448844" inlineInputMode=inline
    export function hasKind(kind: number, dir: number = TileDir.None, dir2: number = TileDir.None, size: ResultSet = ResultSet.Zero) {
        let tile = active[0]
        check(tile != null)
        let delta = kind == tile.kind() ? -1 : 0
        if (size == ResultSet.One)
            check(myWorld.numberAt(kind, tile, dir, dir2)+delta == 1)
        else if (size == ResultSet.Zero)
            check(myWorld.numberAt(kind, tile, dir, dir2)+delta == 0)
    }

    /**
     * Check if a direction is one of several values.
     */
    //% group="Tests" color="#448844"
    //% blockId=TWisoneof block="test %dir=variables_get(direction) $cmp %c1 %c2"
    //% inlineInputMode=inline
    export function _isOneOf(dir: number, cmp: Membership = Membership.OneOf, c1: TileDir, c2: TileDir) {
        if (cmp == Membership.OneOf)
            isOneOf(dir, c1, c2)
        else
            isNotOneOf(dir, c1, c2)
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
