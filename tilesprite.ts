namespace tilesprite {

    // which direction is the sprite moving
    export enum MoveDirection { None, Left, Right, Up, Down }

    // a sprite that moves by tiles, but only in one of four directions
    export class TileSprite extends Sprite {
        private tileBits: number;
        // trie iff the user is requesting motion and nothing has stopped
        // the sprite from moving
        private moving: boolean;
        // which direction is the target 
        private dir: MoveDirection;
        // previous sprite coord value
        private old: number;
        // the target
        private next: number
        // the final target
        private final: number;
        // the next direction to go
        private queue_dir: MoveDirection;
        private queue_moving: boolean;
        // notification
        private onArrived: (ts: TileSprite) => void
        private onTransition: (ts: TileSprite, prevCol: number, prevRow: number) => void

        // TODO: have we shadowed something in Sprite?
        constructor(image: Image, sk: number, bits: number = 4) {
            super(image)
            this.setKind(sk)
            const scene = game.currentScene();
            scene.physicsEngine.addSprite(this);
            this.tileBits = bits;
            this.moving = false
            this.dir = MoveDirection.None
            this.queue_dir = MoveDirection.None
            this.onArrived = undefined
            this.onTransition = undefined
        }

        getColumn() { return this.x >> this.tileBits }
        getRow() { return this.y >> this.tileBits }

        // request sprite to move in specified direction
        move(dir: MoveDirection, moving: boolean = true) {
            if (dir == MoveDirection.Left || dir == MoveDirection.Right)
                this.moveInX(dir, moving)
            else if (dir == MoveDirection.Up || dir == MoveDirection.Down)
                this.moveInY(dir, moving)
        }
        getDirection() { return this.dir; }

        // stop at current tile
        deadStop(rentrant: boolean = false) { this.stopSprite(rentrant) }
        // request sprite to stop moving when it reaches destination
        stop(dir: MoveDirection) {
            if (dir == this.dir) {
                this.moving = false;
                this.final = 0;
            } else if (dir == this.queue_dir) {
                this.queue_moving = false;
            }
        }
        // process queued movement (client must invoke)
        doQueued() {
            if (this.queue_dir != MoveDirection.None) {
                this.move(this.queue_dir, this.queue_moving)
            }
            this.queue_dir = MoveDirection.None;
        }
        clearQueue() { this.queue_dir = MoveDirection.None }
        // notify client on entering tile
        onTileArrived(handler: (ts: TileSprite) => void) {
            this.onArrived = handler
        }
        onTileTransition(handler: (ts: TileSprite, col: number, row: number) => void) {
            this.onTransition = handler
        }
        // call from game update loop
        update() {
            // have we crossed into a new tile?
            if (this.onTransition) {
                if (this.dir == MoveDirection.Left || this.dir == MoveDirection.Right) {
                    if (this.old != this.getColumn()) {
                        this.onTransition(this, this.old, this.getRow())
                    }
                    this.old = this.getColumn()
                } else if (this.dir == MoveDirection.Up || this.dir == MoveDirection.Down) {
                    if (this.old != this.getRow()) {
                        this.onTransition(this, this.getColumn(), this.old)
                    }
                    this.old = this.getRow()
                }
            }
            // have we reached the target?
            let size = 1 << this.tileBits
            if (this.dir == MoveDirection.Left && this.x <= this.next) {
                this.reachedTargetX(this.next, -size)
            } else if (this.dir == MoveDirection.Right && this.x >= this.next) {
                this.reachedTargetX(this.next, size)
            } else if (this.dir == MoveDirection.Up && this.y <= this.next) {
                this.reachedTargetY(this.next, -size)
            } else if (this.dir == MoveDirection.Down && this.y >= this.next) {
                this.reachedTargetY(this.next, size)
            }
        }
        private moveInX(dir: MoveDirection, moving: boolean) {
            let size = 1 << this.tileBits
            let opDir = dir == MoveDirection.Left ? MoveDirection.Right : MoveDirection.Left
            let sign = dir == MoveDirection.Left ? -1 : 1
            if (this.dir == dir && !moving) {
                this.final += sign * size;
                return;
            } else if (this.dir == opDir) {
                // switching 180 doesn't require queuing
                // next_x is defined, so use it
                this.next += sign * size
            } else if (this.dir == MoveDirection.None) {
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
        private moveInY(dir: MoveDirection, moving: boolean) {
            let size = 1 << this.tileBits
            let opDir = dir == MoveDirection.Up ? MoveDirection.Down : MoveDirection.Up
            let sign = dir == MoveDirection.Up ? -1 : 1
            if (this.dir == dir && !moving) {
                this.final += sign * size;
                return;
            } else if (this.dir == opDir) {
                // next_x is defined, so use it
                this.next += sign * size
            } else if (this.dir == MoveDirection.None) {
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
                this.dir = MoveDirection.None
                this.vx = 0
            }
            // notify
            if (this.onArrived && reentrant) {
                this.onArrived(this)
            }
            this.queue_dir = MoveDirection.None
            this.old = this.getColumn()
        }
        private reachedTargetY(y: number, step: number, reentrant: boolean = true) {
            this.y = y
            if (this.moving || this.final && this.next != this.final) {
                this.next += step
            } else {
                this.dir = MoveDirection.None
                this.vy = 0
            }
            // notify
            if (this.onArrived && reentrant) {
                this.onArrived(this)
            }
            this.queue_dir = MoveDirection.None
            this.old = this.getRow()
        }
        private centerIt(n: number) {
            return ((n >> this.tileBits) << this.tileBits) + (1 << (this.tileBits - 1))
        }
        private stopSprite(reentrant: boolean) {
            this.moving = false
            this.final = 0
            this.queue_dir = MoveDirection.None
            if (this.dir == MoveDirection.Left || this.dir == MoveDirection.Right) {
                this.reachedTargetX(this.centerIt(this.x), 0, reentrant)
            } else {
                this.reachedTargetY(this.centerIt(this.y), 0, reentrant)
            }
        }
    }

    // basic movement for player sprite
    export function bindToController(sprite: TileSprite, canMove: (s: TileSprite, dir: MoveDirection) => boolean) {
        controller.left.onEvent(ControllerButtonEvent.Pressed, function () {
            if (canMove(sprite, MoveDirection.Left))
                sprite.move(MoveDirection.Left)
        })
        controller.left.onEvent(ControllerButtonEvent.Released, function () {
            sprite.stop(MoveDirection.Left)
        })
        controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
            if (canMove(sprite, MoveDirection.Right))
                sprite.move(MoveDirection.Right)
        })
        controller.right.onEvent(ControllerButtonEvent.Released, function () {
            sprite.stop(MoveDirection.Right)
        })
        controller.up.onEvent(ControllerButtonEvent.Pressed, function () {
            if (canMove(sprite, MoveDirection.Up))
                sprite.move(MoveDirection.Up)
        })
        controller.up.onEvent(ControllerButtonEvent.Released, function () {
            sprite.stop(MoveDirection.Up)
        })
        controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
            if (canMove(sprite, MoveDirection.Down))
                sprite.move(MoveDirection.Down)
        })
        controller.down.onEvent(ControllerButtonEvent.Released, function () {
            sprite.stop(MoveDirection.Down)
        })
    }

    // this is now generic
    export type GameState = {
        [key: number]: ts.TileSprite[];
        tileMap: Image;
        spritesMap: Image;
    }

    // description of sprites
    export type Description = { c: number, a: Image, sk: number, t: number }

    // ready to move out...
    export function setScene(img: Image, spriteDescriptions: Description[]): GameState {
        // copy it, as it will be updated
        let tileMap = img.clone()
        // convert image to tile map
        scene.setTileMap(tileMap)

        let gameState: GameState = {
            tileMap: tileMap,
            spritesMap: tileMap.clone()
        }

        for (let sd of spriteDescriptions) {
            let tiles = scene.getTilesByType(sd.c)
            scene.setTile(sd.c, sd.sk == undefined ? sd.a : spriteDescriptions.find(s => sd.t == s.c).a)
            if (sd.sk != undefined) {
                gameState[sd.c] = []
                for (let value of tiles) {
                    let tileSprite = new ts.TileSprite(sd.a, sd.sk)
                    gameState[sd.c].push(tileSprite)
                    value.place(tileSprite)
                }
            }
        }

        // now that we have created sprites, remove them from the tile map
        for (let y = 0; y < tileMap.height; y++) {
            for (let x = 0; x < tileMap.width; x++) {
                let pixel = tileMap.getPixel(x, y)
                let r = spriteDescriptions.find(r => r.c == pixel)
                if (r && r.sk) tileMap.setPixel(x, y, r.t)
            }
        }
        return gameState
    }
}