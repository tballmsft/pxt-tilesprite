namespace tilesprite {

    // which direction is the sprite moving
    export enum MoveDirection { None, Left, Right, Up, Down }

    // a sprite that moves by tiles
    export class TileSprite {
        tileBits: number;
        sprite: Sprite;
        // true iff the user is requesting motion and nothing has stopped
        // the sprite from moving
        private moving: boolean = false
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
        private onEnter: (ts: TileSprite, x: number, y: number) => void
        // TODO
        private onExit: (ts: TileSprite, x: number, y: number) => void

        constructor(s: Sprite, bits: number = 4) {
            this.tileBits = bits;
            this.sprite = s
            this.moving = false
            this.dir = MoveDirection.None
            this.queue_dir = MoveDirection.None
            this.onEnter = undefined
            this.onExit = undefined
        }

        // request sprite to move in specified direction
        move(dir: MoveDirection, moving: boolean = true) {
            if (dir == MoveDirection.Left || dir == MoveDirection.Right)
                this.moveInX(dir, moving)
            else if (dir == MoveDirection.Up || dir == MoveDirection.Down)
                this.moveInY(dir, moving)
        }
        getDirection() { return this.dir; }

        // stop at current tile
        deadStop() { this.stopSprite() }
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
        onTileEnter(handler: (ts: TileSprite, col: number, row: number) => void) {
            this.onEnter = handler
        }
        // call from game update loop
        update() {
            // have we crossed into a new tile?
            if (this.onExit) {
                if (this.dir == MoveDirection.Left || this.dir == MoveDirection.Right) {
                    if (this.old >> this.tileBits != this.sprite.x >> this.tileBits) {
                        this.onExit(this, this.old >> this.tileBits, this.sprite.y >> this.tileBits)
                    }
                    this.old = this.sprite.x
                } else if (this.dir == MoveDirection.Up || this.dir == MoveDirection.Down) {
                    if (this.old >> this.tileBits != this.sprite.y >> this.tileBits) {
                        this.onExit(this, this.sprite.x >> this.tileBits, this.old >> this.tileBits)
                    }
                    this.old = this.sprite.y
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
                this.old = this.sprite.x
            } else {
                // 90 degree turn, need to wait until arrived
                this.queue_dir = dir;
                this.queue_moving = moving
                return;
            }
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
                this.old = this.sprite.y
            } else {
                this.queue_dir = dir;
                this.queue_moving = moving
                return;
            }
            this.dir = dir
            this.moving = moving
            this.sprite.vy = sign * 100
        }
        private reachedTargetX(x: number, step: number = 0) {
            // determine what comes next
            if (this.moving) {
                this.next += step
            } else {
                this.dir = MoveDirection.None
                this.sprite.x = x
                this.sprite.vx = 0
            }
            // notify
            if (this.onEnter) {
                this.onEnter(this, x >> this.tileBits, this.sprite.y >> this.tileBits)
            }
            this.queue_dir = MoveDirection.None
        }
        private reachedTargetY(y: number, step: number = 0) {
            if (this.moving) {
                this.next += step
            } else {
                this.dir = MoveDirection.None
                this.sprite.y = y
                this.sprite.vy = 0
            }
            // notify
            if (this.onEnter) {
                this.onEnter(this, this.sprite.x >> this.tileBits, y >> this.tileBits)
            }
            this.queue_dir = MoveDirection.None
        }
        private stopSprite() {
            let size = 1 << this.tileBits
            this.moving = false
            this.queue_dir = MoveDirection.None
            if (this.dir == MoveDirection.Left) {
                this.reachedTargetX(this.next + size)
            } else if (this.dir == MoveDirection.Right) {
                this.reachedTargetX(this.next - size)
            } else if (this.dir == MoveDirection.Up) {
                this.reachedTargetY(this.next + size)
            } else if (this.dir == MoveDirection.Down) {
                this.reachedTargetY(this.next - size)
            }
        }
    }
}