namespace tilesprite {
    
    // which direction is the sprite moving
    enum MoveDirection { None,Left, Right, Up, Down }

    // a sprite that moves by tiles
    export class TileSprite {
        tileSize: number;
        sprite: Sprite;
        // true iff the user is requesting motion and nothing has stopped
        // the sprite from moving
        private moving: boolean = false
        // which direction is the target 
        private target: MoveDirection;
        // the target
        private next_x: number
        private next_y: number
        // to track if we are moving
        private old_x: number;
        private old_y: number;
        // next request
        private queue: MoveDirection;
        private queue_moving: boolean;
        // notifcations
        private onExit:  (x: number, y: number) => void
        private onEnter: (x: number, y: number) => void

        constructor(s: Sprite, size: number = 16) {
            this.tileSize = size
            this.sprite = s;
            this.moving = false
            this.target = MoveDirection.None
            this.old_x = this.old_y = -1
            this.queue = MoveDirection.None
            this.onExit = undefined
            this.onEnter = undefined
        }
        // request sprite to move in specified direction
        move(dir: MoveDirection) {
            if (dir == MoveDirection.Left || dir == MoveDirection.Right)
                this.moveInX(dir)
            else if (dir == MoveDirection.Up || dir == MoveDirection.Down)
                this.moveInY(dir)
        }
        // request sprite to stop moving
        stop(dir: MoveDirection) {
            if (dir == this.queue) {
                this.queue_moving = false;
            } else {
                this.moving = false;
            }
        }
        onTileExit(handler: (col:number, row:number)=>void) {
            this.onExit = handler;
        }
        onTileEnter(handler: (col: number, row: number) => void) {
            this.onEnter = handler
        }
        // call from game update loop
        update() {
            // this is a hack until we get wall collision working
            let is_moving_x = true;
            let is_moving_y = true;
            if (this.old_x != -1) {
                is_moving_x = this.sprite.x != this.old_x
            }
            if (this.old_y != -1) {
                is_moving_y = this.sprite.y != this.old_y
            }
            this.old_x = this.sprite.x
            this.old_y = this.sprite.y
            if (!is_moving_x && !is_moving_y) {
                this.spriteStopped()
                return;
            }
            // have we reached the target?
            if (this.target == MoveDirection.Left && this.sprite.x <= this.next_x) {
                this.reachedTargetX(this.next_x, -this.tileSize)
            } else if (this.target == MoveDirection.Right && this.sprite.x >= this.next_x) {
                this.reachedTargetX(this.next_x, this.tileSize)
            } else if (this.target == MoveDirection.Up && this.sprite.y <= this.next_y) {
                this.reachedTargetY(this.next_y, -this.tileSize)
            } else if (this.target == MoveDirection.Down && this.sprite.y >= this.next_y) {
                this.reachedTargetY(this.next_y, this.tileSize)
            }
        }
        private moveInX(dir: MoveDirection) {
            let opDir = dir == MoveDirection.Left ? MoveDirection.Right : MoveDirection.Left
            let sign = dir == MoveDirection.Left ? -1 : 1
            if (this.target == opDir) {
                // next_x is defined, so use it
                this.next_x += sign * this.tileSize
            } else if (this.target == MoveDirection.None) {
                // player.x is aligned, so use it
                this.next_x = this.sprite.x + sign * this.tileSize;
            } else {
                this.moving = false
                this.queue = dir;
                this.queue_moving = true;
                return;
            }
            this.target = dir
            this.moving = true
            this.sprite.vx = sign * 100
        }
        private moveInY(dir: MoveDirection) {
            let opDir = dir == MoveDirection.Up ? MoveDirection.Down : MoveDirection.Up
            let sign = dir == MoveDirection.Up ? -1 : 1
            if (this.target == opDir) {
                // next_x is defined, so use it
                this.next_y += sign * this.tileSize
            } else if (this.target == MoveDirection.None) {
                // player.x is aligned, so use it
                this.next_y = this.sprite.y + sign * this.tileSize;
            } else {
                this.moving = false
                this.queue = dir;
                this.queue_moving = true;
                return;
            }
            this.target = dir
            this.moving = true
            this.sprite.vy = sign * 100
        }

        private reachedTargetX(x: number, step: number = 0) {
            // notify
            if (this.onExit) {
                this.onExit((x-step)/this.tileSize, this.sprite.y/this.tileSize)
            }
            if (this.onEnter) {
                this.onEnter(x / this.tileSize, this.sprite.y / this.tileSize)
            }
            // determine what comes next
            if (this.moving) {
                this.next_x += step
            } else {
                this.target = MoveDirection.None
                this.sprite.x = x
                this.sprite.vx = 0
                if (this.queue != MoveDirection.None) {
                    this.move(this.queue)
                    this.moving = this.queue_moving
                }
                this.queue = MoveDirection.None
            }
        }
        private reachedTargetY(y: number, step: number = 0) {
            // notify
            if (this.onExit) {
                this.onExit( this.sprite.x / this.tileSize, (y - step) / this.tileSize)
            }
            if (this.onEnter) {
                this.onEnter(this.sprite.x / this.tileSize, y / this.tileSize)
            }
            if (this.moving) {
                this.next_y += step
            } else {
                this.target = MoveDirection.None
                this.sprite.y = y
                this.sprite.vy = 0
                if (this.queue != MoveDirection.None) {
                    this.move(this.queue)
                    this.moving = this.queue_moving
                }
                this.queue = MoveDirection.None
            }
        }
        // we detected the sprite stopped moving (barrier)
        private spriteStopped() {
            this.moving = false
            if (this.target == MoveDirection.Left) {
                this.reachedTargetX(this.next_x + this.tileSize)
            } else if (this.target == MoveDirection.Right) {
                this.reachedTargetX(this.next_x - this.tileSize)
            } else if (this.target == MoveDirection.Up) {
                this.reachedTargetY(this.next_y + this.tileSize)
            } else if (this.target == MoveDirection.Down) {
                this.reachedTargetY(this.next_y - this.tileSize)
            }
        }
    }

    export function bindToController(sprite: TileSprite) {
        controller.left.onEvent(ControllerButtonEvent.Pressed, function () {
            sprite.move(MoveDirection.Left)
        })
        controller.left.onEvent(ControllerButtonEvent.Released, function () {
            sprite.stop(MoveDirection.Left)
        })
        controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
            sprite.move(MoveDirection.Right)
        })
        controller.right.onEvent(ControllerButtonEvent.Released, function () {
            sprite.stop(MoveDirection.Right)
        })
        controller.up.onEvent(ControllerButtonEvent.Pressed, function () {
            sprite.move(MoveDirection.Up)
        })
        controller.up.onEvent(ControllerButtonEvent.Released, function () {
            sprite.stop(MoveDirection.Up)
        })
        controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
            sprite.move(MoveDirection.Down)
        })
        controller.down.onEvent(ControllerButtonEvent.Released, function () {
            sprite.stop(MoveDirection.Down)
        })
    }

}