namespace tilesprite {

    // which direction is the sprite moving
    export enum MoveDirection { None, Left, Right, Up, Down }

    // a sprite that moves by tiles
    export class TileSprite {
        tileSize: number;
        sprite: Sprite;
        // true iff the user is requesting motion and nothing has stopped
        // the sprite from moving
        private moving: boolean = false
        // which direction is the target 
        private dir: MoveDirection;
        // the target
        private next_x: number
        private next_y: number
        // notifications: should separate entering the tile from
        // arriving at the center of the tile??
        private onEnter: (ts: TileSprite, x: number, y: number) => void

        constructor(s: Sprite, size: number = 16) {
            this.tileSize = size
            this.sprite = s;
            this.moving = false
            this.dir = MoveDirection.None
            this.onEnter = undefined
        }

        // request sprite to move in specified direction
        move(dir: MoveDirection, onlyOne: boolean = false) {
            if (dir == MoveDirection.Left || dir == MoveDirection.Right)
                this.moveInX(dir, onlyOne)
            else if (dir == MoveDirection.Up || dir == MoveDirection.Down)
                this.moveInY(dir, onlyOne)
        }
        getDirection() { return this.dir; }
        deadStop() { this.stopSprite() }
        // request sprite to stop moving
        stop(dir: MoveDirection) {
            this.moving = false;
        }
        onTileEnter(handler: (ts: TileSprite, col: number, row: number) => void) {
            this.onEnter = handler
        }
        // call from game update loop
        update() {
            // have we reached the target?
            if (this.dir == MoveDirection.Left && this.sprite.x <= this.next_x) {
                this.reachedTargetX(this.next_x, -this.tileSize)
            } else if (this.dir == MoveDirection.Right && this.sprite.x >= this.next_x) {
                this.reachedTargetX(this.next_x, this.tileSize)
            } else if (this.dir == MoveDirection.Up && this.sprite.y <= this.next_y) {
                this.reachedTargetY(this.next_y, -this.tileSize)
            } else if (this.dir == MoveDirection.Down && this.sprite.y >= this.next_y) {
                this.reachedTargetY(this.next_y, this.tileSize)
            }
        }
        private moveInX(dir: MoveDirection, onlyOne: boolean) {
            let opDir = dir == MoveDirection.Left ? MoveDirection.Right : MoveDirection.Left
            let sign = dir == MoveDirection.Left ? -1 : 1
            if (this.dir == dir || this.dir == opDir) {
                // next_x is defined, so use it
                this.next_x += sign * this.tileSize
            } else if (this.dir == MoveDirection.None) {
                // player.x is aligned, so use it
                this.next_x = this.sprite.x + sign * this.tileSize;
            } else {
                // we are moving in y (snap to current row)
                let row = this.sprite.y >> 4
                this.sprite.y = (row << 4) + 8
                this.sprite.vy = 0
            }
            this.dir = dir
            this.moving = !onlyOne
            this.sprite.vx = sign * 100
        }
        private moveInY(dir: MoveDirection, onlyOne: boolean) {
            let opDir = dir == MoveDirection.Up ? MoveDirection.Down : MoveDirection.Up
            let sign = dir == MoveDirection.Up ? -1 : 1
            if (this.dir == dir || this.dir == opDir) {
                // next_x is defined, so use it
                this.next_y += sign * this.tileSize
            } else if (this.dir == MoveDirection.None) {
                // player.x is aligned, so use it
                this.next_y = this.sprite.y + sign * this.tileSize;
            } else {
                // we are moving in x (snap to current col)
                let col = this.sprite.x >> 4
                this.sprite.x = (col << 4) + 8
                this.sprite.vx = 0
            }
            this.dir = dir
            this.moving = !onlyOne
            this.sprite.vy = sign * 100
        }
        private reachedTargetX(x: number, step: number = 0) {
            // determine what comes next
            if (this.moving) {
                this.next_x += step
            } else {
                this.dir = MoveDirection.None
                this.sprite.x = x
                this.sprite.vx = 0
            }
            // notify
            if (this.onEnter) {
                this.onEnter(this, x >> 4, this.sprite.y >> 4)
            }
        }
        private reachedTargetY(y: number, step: number = 0) {
            if (this.moving) {
                this.next_y += step
            } else {
                this.dir = MoveDirection.None
                this.sprite.y = y
                this.sprite.vy = 0
            }
            // notify
            if (this.onEnter) {
                this.onEnter(this, this.sprite.x >> 4, y >> 4)
            }
        }
        private stopSprite() {
            this.moving = false
            if (this.dir == MoveDirection.Left) {
                this.reachedTargetX(this.next_x + this.tileSize)
            } else if (this.dir == MoveDirection.Right) {
                this.reachedTargetX(this.next_x - this.tileSize)
            } else if (this.dir == MoveDirection.Up) {
                this.reachedTargetY(this.next_y + this.tileSize)
            } else if (this.dir == MoveDirection.Down) {
                this.reachedTargetY(this.next_y - this.tileSize)
            }
        }
    }
}