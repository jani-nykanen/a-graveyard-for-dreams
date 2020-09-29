/**
 * The End of Journey
 * 
 * (c) 2020 Jani Nykänen
 */

import { CollisionObject } from "./collisionobject.js";
import { Sprite } from "./core/sprite.js";
import { Vector2 } from "./core/vector.js";
import { Flip } from "./core/canvas.js";
import { State } from "./core/input.js";


export class Player extends CollisionObject {


    constructor(x, y) {

        super(x, y);

        this.spr = new Sprite(16, 16);
        this.flip = Flip.None;

        this.friction = new Vector2(0.1, 0.15);
        this.center = new Vector2(0, 2);
        this.hitbox = new Vector2(8, 12);
        this.collisionBox = new Vector2(6, 12);

        this.canJump = false;
        this.jumpTimer = 0;
    }


    control(ev) {

        const BASE_SPEED = 1.0;
        const BASE_GRAVITY = 2.0;
        const JUMP_TIME = 14.0;

        this.target.x = BASE_SPEED * ev.input.stick.x;
        this.target.y = BASE_GRAVITY;

        let jumpButtonState = ev.input.actions["fire1"].state;

        if (jumpButtonState == State.Pressed) {

            if (this.canJump) {

                this.jumpTimer = JUMP_TIME;
                this.canJump = false;
            }
            // Else: double jump etc.
        }
        else if (jumpButtonState == State.Released &&
                this.jumpTimer > 0) {

            this.jumpTimer = 0.0;
        }
    }


    animate(ev) {

        const EPS = 0.1;
        const JUMP_EPS = 0.5;

        let animSpeed = 0.0;
        let animFrame = 0;

        // Determine flipping first
        if (Math.abs(this.target.x) > EPS) {

            this.flip = this.target.x < 0 ? Flip.Horizontal : Flip.None;
        }

        if (this.canJump) {

            if (Math.abs(this.speed.x) < EPS &&
                Math.abs(this.target.x) < EPS) {
                
                this.spr.setFrame(0, 0);
            }
            else {

                animSpeed = 12 - 6 *Math.abs(this.speed.x);
                this.spr.animate(0, 1, 4, animSpeed, ev.step);
            }
        }
        else {

            animFrame = 0;
            if (Math.abs(this.speed.y) < JUMP_EPS)
                animFrame = 1;
            else if (this.speed.y > 0)
                animFrame = 2;

            this.spr.setFrame(animFrame, 1);
        }
    }


    updateTimers(ev) {

        const JUMP_SPEED = -2.0;

        if (this.jumpTimer > 0) {

            this.speed.y = JUMP_SPEED;
            this.jumpTimer -= ev.step;
        }
    }


    updateLogic(ev) {

        this.control(ev);
        this.updateTimers(ev);
        this.animate(ev);
    }


    postUpdate(ev) {

        this.canJump = false;
    }
    

    draw(c) {

        let px = Math.round(this.pos.x-8);
        let py = Math.round(this.pos.y-7);

        this.spr.draw(c, c.bitmaps["figure"], px, py, this.flip);
    }


    floorCollisionEvent(x, y, w, ev) {

        this.canJump = true;
    }


    wallCollisionEvent(x, y, h, dir, ev) {


    }


    ceilingCollisionEvent(x, y, w, ev) {


    }
}
