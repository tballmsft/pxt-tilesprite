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
    //% block="has a"
    One,
    //% block="has only"
    Only
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
//% groups='["Tiles", "Events", "Assertions", "Actions"]'
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
                return false;
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
                return this.reachedTargetX(this.next, -size)
            } else if (this.dir == TileDir.Right && this.x >= this.next) {
                return this.reachedTargetX(this.next, size)
            } else if (this.dir == TileDir.Up && this.y <= this.next) {
                return this.reachedTargetY(this.next, -size)
            } else if (this.dir == TileDir.Down && this.y >= this.next) {
                return this.reachedTargetY(this.next, size)
            }
            return false;
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
            let stops = false
            // determine what comes next
            this.x = x
            let keepTileDir = TileDir.None
            if (this.final && this.next != this.final) {
                this.next += step
            } else {
                stops = true
                if (this.final) keepTileDir = this.dir
                this.dir = TileDir.None
                this.vx = 0
            }
            // notify
            if (this.tileSpriteEvent && reentrant) {
                this.tileSpriteEvent(this, <number>keepTileDir)
            }
            this.old = this.getColumn()
            return stops
        }
        private reachedTargetY(y: number, step: number, reentrant: boolean = true) {
            let stops = false
            this.y = y
            let keepTileDir = TileDir.None
            if (this.final && this.next != this.final) {
                this.next += step
            } else {
                stops = true
                if (this.final) keepTileDir = this.dir
                this.dir = TileDir.None
                this.vy = 0
            }
            // notify
            if (this.tileSpriteEvent && reentrant) {
                this.tileSpriteEvent(this, <number>keepTileDir)
            }
            this.old = this.getRow()
            return stops
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
        // what tile code to put behind a sprite?
        private backgroundTile: number;
        private tileKind: number;
        // the current tile map (no sprites)  
        private tileMap: Image;
        // fill in with sprites
        private spriteMap: Image;
        // note tiles with more than one sprite
        private multiples: Image;
        // which codes map to sprites?
        private spriteCodes: number[];
        // map codes to kinds
        private codeToKind: number[];
        // the sprites, divided up by codes
        private sprites: TileSprite[][];
        // event handlers
        private arrivalHandlers: { [index:number]: ((ts: TileSprite, d: TileDir) => void)[] };
        private transitionHandlers: { [index:number]: ((ts: TileSprite) => void)[] };
        private stationaryHandlers: { [index:number]: ((ts: TileSprite) => void)[] };
        //
        constructor() {
            this.backgroundTile = -1
            this.sprites = []
            this.codeToKind = []
            this.spriteCodes = []
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
        getCode(curs: Tile) {
            return this.tileMap.getPixel(curs.getColumn(), curs.getRow())
        }
        getKindFromCode(code: number) {
            return this.codeToKind(code)
        }
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
        createTileSpriteAt(code: number, cursor: Tile) {
            //let tileSprite = new TileSprite(this, code, art, kind)
            //this.hookupHandlers(tileSprite)
            //this.sprites[code].push(tileSprite)
        }
        // register event handlers
        onTileStationary(kind: number, h: (ts: TileSprite) => void) {
            if (!this.stationaryHandlers[kind]) this.stationaryHandlers[kind] = []
            this.stationaryHandlers[kind].push(h);
        }
        onTileArrived(kind: number, h: (ts: TileSprite, d: TileDir) => void) {
            if (!this.arrivalHandlers[kind]) this.arrivalHandlers[kind] = [];
            this.arrivalHandlers[kind].push(h);
        }
        onTileTransition(kind: number, h: (ts: TileSprite) => void) {
            if (!this.transitionHandlers[kind]) this.transitionHandlers[kind] = [];
            this.transitionHandlers[kind].push(h);
        }

        public isFixedCode(codeKind: number) {
            return codeKind < this.tileKind && this.spriteCodes.indexOf(codeKind) == -1
        }
        // how many fixed/movable sprites of codeKind are at a location? 
        // returns -1 if result needs to consult actual sprite list at location
        countCodeKindAt(codeKind: number, cursor: Cursor) {
            let tileMapCode = this.tileMap.getPixel(cursor.getColumn(), cursor.getRow())
            let spriteMapCode = this.spriteMap.getPixel(cursor.getColumn(), cursor.getRow())
            if (this.isFixedCode(codeKind))
                return (codeKind == tileMapCode) ? 1 : 0
            else if (this.multiples.getPixel(cursor.getColumn(), cursor.getRow())) 
                return -1
            else if (codeKind < this.tileKind)
                return (codeKind == spriteMapCode) ? 1 : 0
            else {
                let tileMapKind = this.codeToKind[tileMapCode]
                let spriteMapKind = this.codeToKind[spriteMapCode]
                return (codeKind == tileMapKind ? 1 : 0) + (tileMapCode == spriteMapCode ? 0 : (codeKind == spriteMapKind ? 1 : 0))
            }
        }
        // is the underlying tile at a location of codeKind?
        tileIs(codeKind: number, cursor: Cursor) {
            let targetCodeKind = this.tileMap.getPixel(cursor.getColumn(), cursor.getRow())
            if (codeKind < this.tileKind) 
                return targetCodeKind == codeKind
            else
                return this.codeToKind[targetCodeKind] == codeKind
        }
        // get all the sprites of codeKind at an (optional) location
        getSprites(codeKind: number, cursor: Cursor = null) {
            if (cursor) {
                return this._getSpritesCursor(codeKind, cursor);
            } else
                return this._getSprites(codeKind)
        }
        //
        removeSprite(s: TileSprite) {
            // TODO: we may want to consider a two phase process where we
            // TODO: disable the TileSprite and leave Sprite intact
            this.sprites[s.getCode()].removeElement(s)
            s.destroy()
        }
        private _getSpritesCursor(codeKind: number, cursor: Cursor) {
            let ss = this._getSprites(codeKind)
            if (ss)
                return ss.filter((t: TileSprite) =>
                    t.getColumn() == cursor.getColumn() && t.getRow() == cursor.getRow())
            else
                return null
        }
        private _getSprites(codeKind: number): any[] {
            if (codeKind < this.tileKind && this.spriteCodes.indexOf(codeKind) != -1) {
                return this.sprites[codeKind]
            } else if (codeKind > this.tileKind) {
                if (game.currentScene().spritesByKind[codeKind])
                    return game.currentScene().spritesByKind[codeKind].sprites()
            }
            return null;
        }
        //
        private update() {
            // first recompute the map
            this.spriteMap.copyFrom(this.tileMap)
            this.multiples.fill(0)
            this.sprites.forEach((arr, code) => {
                if (arr) {
                    arr.forEach((sprite) => {
                        let col = sprite.getColumn(), row = sprite.getRow()
                        let here = this.spriteMap.getPixel(col, row)
                        if (this.spriteCodes.indexOf(here) != -1 && !this.multiples.getPixel(col, row)) {
                            // we have more than 1 sprite at (col,row)
                            this.multiples.setPixel(col, row, 1)
                        } else {
                            // no sprite at this tile yet
                            this.spriteMap.setPixel(col, row, code)
                        }
                    })
                }
            })

            let transitionToStopped: TileSprite[] = []
            // 1. update the moving sprites, keeping track of 
            //    which moving sprites transition to stationary
            this.sprites.forEach((arr) => {
                if (arr) arr.forEach((sprite) => { 
                    if (sprite.updateInMotion())
                        transitionToStopped.push(sprite)
                })
            })

            // 2. update the stationary sprites (that were not previously moving)
            this.sprites.forEach((arr) => {
                if (arr) { arr.forEach((sprite) => { 
                    if (transitionToStopped.indexOf(sprite) == -1)
                        sprite.updateStationary() 
                }) }
            })
        }

        private initHandlers(kind: number) {
            if (!this.stationaryHandlers[kind]) this.stationaryHandlers[kind] = []
            if (!this.arrivalHandlers[kind]) this.arrivalHandlers[kind] = []
            if (!this.transitionHandlers[kind]) this.transitionHandlers[kind] = []
        }
        private hookupHandlers(s: TileSprite) {
            let process = (s: TileSprite, dir: number) => {
                if (dir == CallBackKind.Stationary)
                    this.stationaryHandlers[s.kind()].forEach((h) => { h(s) });
                else if (dir == CallBackKind.Transition)
                    this.transitionHandlers[s.kind()].forEach((h) => { h(s) });
                else
                    this.arrivalHandlers[s.kind()].forEach((h) => { h(s, dir) });
            }
            s.onTileSpriteEvent(process)
        }
    }

    // queue is of size one
    class BindController {
        private sprite: TileSprite;
        constructor() { }
        private requestMove(dir: TileDir) {
            let sdir = this.sprite.getDirection()
            if (sdir != TileDir.None) {
                let sDirWhich = sdir == TileDir.Left || sdir == TileDir.Right
                let dirWhich = dir == TileDir.Left || dir == TileDir.Right
                if (sDirWhich != dirWhich)
                    this.sprite.deadStop()   // TODO: creates jitter
            }
            this.sprite.notifyArrived(dir)
        }
        private requestStop(dir: TileDir) {
            if (dir == this.sprite.getDirection()) {
                this.sprite.requestStop()
            }
        }
        // basic movement for tile sprite
        bindToController(s: TileSprite) {
            this.sprite = s;
            scene.cameraFollowSprite(s)
            controller.left.onEvent(ControllerButtonEvent.Pressed, () => {
                this.requestMove(TileDir.Left)
            })
            controller.left.onEvent(ControllerButtonEvent.Released, () => {
                this.requestStop(TileDir.Left)
            })
            controller.right.onEvent(ControllerButtonEvent.Pressed, () => {
                this.requestMove(TileDir.Right)
            })
            controller.right.onEvent(ControllerButtonEvent.Released, () => {
                this.requestStop(TileDir.Right)
            })
            controller.up.onEvent(ControllerButtonEvent.Pressed, () => {
                this.requestMove(TileDir.Up)
            })
            controller.up.onEvent(ControllerButtonEvent.Released, () => {
                this.requestStop(TileDir.Up)
            })
            controller.down.onEvent(ControllerButtonEvent.Pressed, () => {
                this.requestMove(TileDir.Down)
            })
            controller.down.onEvent(ControllerButtonEvent.Released, () => {
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

    function check(expr: boolean) {
        if (!expr) {
            throw checkFailed;
        }
    }

    // state here supports blocks

    let myWorld = new TileWorld();
    let myPlayerController = new BindController()
    // keep track of sprites passed down through active handler
    // so user code doesn't need to refer to it.
    let active: TileSprite[] = [];
    let targets: { [index:number]: TileSprite } = {} 

    function getTargetSprite(dir: TileDir) {
        return targets[dir]
    }

    function enterHandler(t: TileSprite) {
        active.push(t)
        targets = {}
    }

    function exitHandler(t: TileSprite) {
        active.pop();
    }

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
     * Set the background tile
     * @param color
     */
    //% group="Tiles"
    //% blockId=TWsetbackgroundtile block="set background tile to %color=colorindexpicker"
    export function setBackgroundTile(code: number) {
        myWorld.setBackgroundTile(code)
    }

    /**
     * Map a color to a 16x16 tile image and sprite kind. 
     * @param code
     * @param moving
     * @param image
     * @param kind
     */
    //% blockId=TWaddsprite block="map $code=colorindexpicker to $moving sprite $image=tile_image_picker as $kind=spritekind"
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
    //% blockId=TWmoveButtons block="notify $kind=spritekind on dpad"
    export function moveWithButtons(kind: number) {
        let sprites = game.currentScene().spritesByKind[kind].sprites()
        if (sprites && sprites.length > 0) {
            let first = sprites[0]
            if (first instanceof TileSprite) {
                myPlayerController.bindToController(first)
            }
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
            try {
                enterHandler(t)
                h() 
            } catch (e) {

            } finally {
                exitHandler(t)
            }
        });
    }

    /**
     * Sprite is at center of tile and received request to move
     * @param body code to execute
     */
    //% group="Events" color="#444488"
    //% blockId=TWontilearrived block="on request of $kind=spritekind to move $dir"
    //% blockAllowMultiple=1 draggableParameters="reporter"
    export function onMoveRequest(kind: number, h: (dir: TileDir) => void) {
        myWorld.onTileArrived(kind, (t, d) => {
            try {
                enterHandler(t)
                h(d)
            } catch (e) {
            } finally {
                exitHandler(t)
            }
        })
    }

    /**
     * Sprite is moving into a tile
     * @param body code to execute
     */
    //% group="Events" color="#444488"
    //% blockId=TWontiletransition block="on $kind=spritekind moving into tile"
    //% blockAllowMultiple=1 draggableParameters="reporter"
    export function onMovedInto(kind: number, h: () => void) {
        myWorld.onTileTransition(kind, (t) => {
            try {
                enterHandler(t)
                h()
            } catch (e) {
            } finally {
                exitHandler(t)
            }
        })
    }

    /**	
    * Get the currently active sprite	
    */
    //% group="Tiles"	
    //% blockId=TWgetsprite block="get current sprite"
    export function getCurrentSprite(): TileSprite {
        if (active.length > 0)
            return active[active.length-1]
        else
            return null
    }

    // Assertions!

    //% blockId=TWhascode block="tile $dir=tiledir $dir2=tiledir $size $code=colorindexpicker"
    //% group="Assertions" color="#448844" inlineInputMode=inline
    export function hasCode(code: number, dir: number = TileDir.None, dir2: number = TileDir.None, size: ResultSet = ResultSet.Zero) {
        let sprite = getCurrentSprite()
        if (sprite) {
            let delta = code == sprite.getCode() ? -1 : 0
            supportHas(code, true, dir, dir2, size, sprite, delta)
        }
    }

    //% blockId=TWhaskind block="tile $dir=tiledir $dir2=tiledir $size $kind=spritekind"
    //% group="Assertions" color="#448844" inlineInputMode=inline
    export function hasKind(kind: number, dir: number = TileDir.None, dir2: number = TileDir.None, size: ResultSet = ResultSet.Zero) {
        let sprite = getCurrentSprite()
        if (sprite) {
            let delta = kind == sprite.kind() ? -1 : 0
            supportHas(kind, false, dir, dir2, size, sprite, delta)
        }
    }

    // record the sprite, but not two steps away
    function recordSprite(sprites: TileSprite[], dir: TileDir, dir2: TileDir) {
        if (sprites) {
            if (dir == TileDir.None || dir2 == TileDir.None) {
                let theDir = (dir == TileDir.None) ? dir2 : dir
                targets[theDir] = sprites[0]
            }
        }
    }

    function supportHas(codeKind: number, code: boolean, dir: TileDir, dir2: TileDir, 
                        size: ResultSet, sprite: TileSprite, delta: number) {
        let cursor = new Cursor(myWorld, sprite, dir, dir2)
        function checkIt(c: number) {
            if (size == ResultSet.Zero && c >= 0) {
                check(c - delta == 0)
                return true;
            } else if (size == ResultSet.One && c >= 0) {
                check(c + delta > 0)
                recordSprite(myWorld.getSprites(codeKind, cursor), dir, dir2)
                return true;
            } else if (size == ResultSet.Only && c >= 0) {
                check(c + delta == 1)
                recordSprite(myWorld.getSprites(codeKind, cursor), dir, dir2)
                return true;
            }
            return false;
        }
        let approxCount = myWorld.countCodeKindAt(codeKind, cursor)
        if (checkIt(approxCount))
            return
        // assert(!myWorld.isFixedCode(codeKind))
        let sprites = myWorld.getSprites(codeKind, cursor)
        let kindOfFixed = myWorld.getKindFromCode(myWorld.getCode(cursor))
        let count = sprites.length + (code ? 0 : (kindOfFixed == codeKind ? 1 : 0))
        checkIt(count)
    }

    /**
     * Check if a direction is one of several values.
     */
    //% group="Assertions" color="#448844"
    //% blockId=TWisoneof block="assert %dir=variables_get(direction) $cmp %c1 %c2"
    //% inlineInputMode=inline
    export function _isOneOf(dir: number, cmp: Membership = Membership.OneOf, c1: TileDir, c2: TileDir) {
        if (cmp == Membership.OneOf)
            check(dir == c1 || dir == c2) 
        else
            check(dir != c1 && dir != c2)
    }             

    // actions

    // default: works on current tile, self-sprite
    // Action: what to do: move, remove, 
    // Parameter: depends on the action


    // other-and-self
    
    // request sprite to move in specified direction
    //% blockId=TWmoveself block="move $dir=tiledir self"
    //% group="Actions" color="#88CC44"
    export function moveSelf(dir: number) {
        let sprite = getCurrentSprite()
        if (sprite) {
            sprite.moveOne(dir)
        }
    }

    // request sprite to move in specified direction
    //% blockId=TWmoveother block="move $dir=tiledir other at $otherdir=tiledir"
    //% group="Actions" color="#88CC44"
    export function moveOther(otherdir: number, dir: number) {
        let sprite = getTargetSprite(otherdir)
        if (sprite) {
            sprite.moveOne(dir)
        }
    }
    
    //% blockId=TWremoveSelf block="remove self"
    //% group="Actions" color="#88CC44"
    export function removeSelf() {
        let sprite = getCurrentSprite()
        if (sprite) {
            myWorld.removeSprite(sprite)
        }
    }

    //% blockId=TWremoveother block="remove other at $otherdir=tiledir"
    //% group="Actions" color="#88CC44"
    export function removeOther(otherdir: number) {
        let sprite = getTargetSprite(otherdir)
        if (sprite) {
            myWorld.removeSprite(sprite)
        }
    }

    // direction-based 
    // - set tile code
    // - create sprite

    //% blockId=TWsettilecode block="set code $code=colorindexpicker at $dir=tiledir"
    //% group="Actions" color="#88CC44"
    export function setCode(code: number, dir: number) {
        let sprite = getCurrentSprite()
        if (sprite) {
            let cursor = new Cursor(myWorld, sprite, dir);
            myWorld.setCode(cursor, code)
        }
    }

    /*
    
    //% blockId=TWaddsprite block="map $code=colorindexpicker to $moving sprite $image=tile_image_picker as $kind=spritekind"
    //% group="Tiles"
    //% inlineInputMode=inline
    export function addSprite(code: number, image: Image, moving: Spritely, kind: number) {

    */

    //% blockId=TWcreatesprite block="create sprite $code=colorindexpicker at $dir=tiledir"
    //% group="Actions" color="#88CC44"
    export function createSprite(code: number, dir: number) {
        let sprite = getCurrentSprite()
        if (sprite) {
            myWorld.createTileSpriteAt(code, new Cursor(myWorld, sprite, dir))    
        }
    }
}
