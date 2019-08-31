namespace tilesprite {

    // which direction is the sprite moving
    export enum MoveDirection { None, Left, Right, Up, Down }

    // a sprite that moves by tiles
    export class TileSprite {
        tileBits: number;
        // TODO: abstract over sprite for movement
        sprite: Sprite;
        // < 0 iff the user is requesting motion and nothing has stopped
        // the sprite from moving
        // > 0 to count number of tiles
        private moving: boolean;
        // which direction is the target 
        private dir: MoveDirection;
        // previous sprite coord value
        private old: number;
        // the target
        private next: number
        // the next direction to go
        private queue_dir: MoveDirection;
        private queue_moving: boolean;
        // notification
        private onArrived: (ts: TileSprite) => void
        private onTransition: (ts: TileSprite, prevCol: number, prevRow: number) => void

        constructor(s: Sprite, bits: number = 4) {
            this.tileBits = bits;
            this.sprite = s
            this.moving = false
            this.dir = MoveDirection.None
            this.queue_dir = MoveDirection.None
            this.onArrived = undefined
            this.onTransition = undefined
        }

        getColumn() { return this.sprite.x >> this.tileBits }
        getRow() { return this.sprite.y >> this.tileBits }

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
            if (this.dir == MoveDirection.Left && this.sprite.x <= this.next) {
                this.reachedTargetX(this.next, -size)
            } else if (this.dir == MoveDirection.Right && this.sprite.x >= this.next) {
                this.reachedTargetX(this.next, size)
            } else if (this.dir == MoveDirection.Up && this.sprite.y <= this.next) {
                this.reachedTargetY(this.next, -size)
            } else if (this.dir == MoveDirection.Down && this.sprite.y >= this.next) {
                this.reachedTargetY(this.next, size)
            }
        }
        private moveInX(dir: MoveDirection, moving: boolean) {
            let size = 1 << this.tileBits
            let opDir = dir == MoveDirection.Left ? MoveDirection.Right : MoveDirection.Left
            let sign = dir == MoveDirection.Left ? -1 : 1
            if (this.dir == opDir) {
                // switching 180 doesn't require queuing
                // next_x is defined, so use it
                this.next += sign * size
            } else if (this.dir == MoveDirection.None) {
                // player.x is aligned, so use it
                this.next = this.sprite.x + sign * size;
            } else {
                this.queue_dir = dir;
                this.queue_moving = moving
                return;
            }
            this.old = this.getColumn()
            this.dir = dir
            this.moving = moving
            this.sprite.vx = sign * 100
        }
        private moveInY(dir: MoveDirection, moving: boolean) {
            let size = 1 << this.tileBits
            let opDir = dir == MoveDirection.Up ? MoveDirection.Down : MoveDirection.Up
            let sign = dir == MoveDirection.Up ? -1 : 1
            if (this.dir == opDir) {
                // next_x is defined, so use it
                this.next += sign * size
            } else if (this.dir == MoveDirection.None) {
                // player.x is aligned, so use it
                this.next = this.sprite.y + sign * size;
            } else {
                this.queue_dir = dir;
                this.queue_moving = moving
                return;
            }
            this.old = this.getRow()
            this.dir = dir
            this.moving = moving
            this.sprite.vy = sign * 100
        }
        private reachedTargetX(x: number, step: number, reentrant: boolean = true) {
            // determine what comes next
            if (this.moving) {
                this.next += step
            } else {
                this.dir = MoveDirection.None
                this.sprite.x = x
                this.sprite.vx = 0
            }
            // notify
            if (this.onArrived && reentrant) {
                this.onArrived(this)
            }
            this.queue_dir = MoveDirection.None
            this.old = this.getColumn()
        }
        private reachedTargetY(y: number, step: number, reentrant: boolean = true) {
            if (this.moving) {
                this.next += step
            } else {
                this.dir = MoveDirection.None
                this.sprite.y = y
                this.sprite.vy = 0
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
            this.queue_dir = MoveDirection.None
            if (this.dir == MoveDirection.Left || this.dir == MoveDirection.Right) {
                this.reachedTargetX(this.centerIt(this.sprite.x), 0, reentrant)
            } else {
                this.reachedTargetY(this.centerIt(this.sprite.y), 0, reentrant)
            }
        }
    }
}