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
        this.doubleJump = false;

        this.jumpMargin = 0;

        this.climbing = false;
        this.climbingBegun = false;
    
        this.swimming = false;
    }


    control(ev) {

        const BASE_SPEED = 1.0;
        const CLIMB_SPEED = 0.5;
        const BASE_GRAVITY = 2.0;
        const JUMP_TIME = 14.0;
        const DOUBLE_JUMP_TIME = 8.0;
        const BASE_FRICTION_X = 0.1;
        const BASE_FRICTION_Y = 0.15;
        const SWIMMING_MOD_X = 0.5;
        const SWIMMING_MOD_Y = 0.25;

        this.target.x = BASE_SPEED * ev.input.stick.x;
        this.target.y = BASE_GRAVITY;

        let jumpButtonState = ev.input.actions["fire1"].state;

        // If swimming, lower the friction (and target speeds)
        this.friction = new Vector2(BASE_FRICTION_X, BASE_FRICTION_Y);
        if (this.swimming) {

            this.friction.x *= SWIMMING_MOD_X;
            this.friction.y *= SWIMMING_MOD_Y;

            this.target.x *= SWIMMING_MOD_X;
            this.target.y *= SWIMMING_MOD_Y;
        }

        // Climbing
        if (this.climbing) {

            this.target.y = CLIMB_SPEED * ev.input.stick.y;
            this.target.x = 0.0;

            if (jumpButtonState == State.Pressed) {

                this.jumpTimer = JUMP_TIME;
                this.doubleJump = false;

                this.climbing = false;
                this.climbingBegun = false;
            }
            return;
        }

        // Jumping and related actions
        if (jumpButtonState == State.Pressed) {

            if (this.canJump || this.jumpMargin > 0 || !this.doubleJump) {

                this.doubleJump = !this.canJump && this.jumpMargin <= 0;
                this.jumpTimer = this.doubleJump ? DOUBLE_JUMP_TIME : JUMP_TIME;
                this.canJump = false;
                this.jumpMargin = 0;
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
        const DOUBLE_JUMP_ANIM_SPEED = 4;

        let animSpeed = 0.0;
        let animFrame = 0;

        // Determine flipping first
        if (Math.abs(this.target.x) > EPS) {

            this.flip = this.target.x < 0 ? Flip.Horizontal : Flip.None;
        }

        // Swimming
        if (this.swimming) {

            if (this.speed.y >= 0 &&
                Math.abs(this.target.x) > EPS) {

                this.spr.animate(3, 0, 1, 10, ev.step);
            }
            else {

                animFrame = this.speed.y < 0 ? 2 : 0;
                this.spr.setFrame(animFrame, 3);
            }

            return;
        }

        // Climbing
        if (this.climbing) {

            if (Math.abs(this.target.y) > EPS) {

                this.spr.animate(3, 3, 4, 10, ev.step);
            }
            return;
        }

        // Jumping & walking
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

            if (this.doubleJump && this.speed.y < 0) {

                this.spr.animate(2, 0, 4, DOUBLE_JUMP_ANIM_SPEED, ev.step);
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
    }


    updateTimers(ev) {

        const JUMP_SPEED = -2.0;
        const SWIMMING_MOD_Y = 0.5;

        if (this.jumpTimer > 0) {

            this.speed.y = JUMP_SPEED;
            if (this.swimming)
                this.speed.y *= SWIMMING_MOD_Y;

            this.jumpTimer -= ev.step;
        }

        if (this.jumpMargin > 0)
            this.jumpMargin -= ev.step;
    }


    updateLogic(ev) {

        if (this.climbingBegun && !this.climbing) {

            this.climbingBegun = false;
        }

        this.control(ev);
        this.updateTimers(ev);
        this.animate(ev);

        this.climbing = false;
        this.swimming = false;
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

        const JUMP_MARGIN = 12;

        this.canJump = true;
        this.doubleJump = false;

        this.jumpMargin = JUMP_MARGIN;

        this.climbing = false;
        this.climbingBegun = false;
    }


    wallCollisionEvent(x, y, h, dir, ev) {


    }


    ceilingCollisionEvent(x, y, w, ev) {

        this.jumpTimer = 0;
    }


    ladderCollision(x, y, w, h, ev, yjump) {

        const EPS = 0.25;
        const MINUS_MARGIN = 8;

        // ...this looks a bit... ugly?
        if (!this.overlay(x+MINUS_MARGIN/2, y, w-MINUS_MARGIN, h)) {

            return false;
        }
        
        if (this.climbingBegun) {

            if (yjump == undefined)
                this.climbing = true;
                
            return true;
        }

        let up = ev.input.stick.y < 0 && 
            ev.input.oldStick.y >= -EPS &&
            ev.input.stickDelta.y < -EPS;

        let down = ev.input.stick.y > 0 && 
            ev.input.oldStick.y <= EPS &&
            ev.input.stickDelta.y > EPS;

        if (up || down) {

            this.climbing = true;
            this.climbingBegun = true;

            this.pos.x = x + 8;
            if (yjump != undefined)
                this.pos.y = y + yjump;

            this.stopMovement();

            return true;
        }
        return false;
    }


    waterCollision(x, y, w, h, ev) {

        if (this.overlay(x, y, w, h)) {

            this.swimming = true;
            this.jumpMargin = 1;
            this.doubleJump = false;

            return true;
        }
        return false;
    }


    cameraEvent(cam, ev) {

        const CAM_SPEED = 1.0 / 20.0;
        const MARGIN = 2;

        let cx = cam.pos.x * cam.width;
        let cy = cam.pos.y * cam.height;

        let dx = cam.target.x - cam.pos.x;
        let dy = cam.target.y - cam.pos.y;

        let moveSpeedX = (this.hitbox.x+MARGIN) * cam.moveSpeed;
        let moveSpeedY = (this.hitbox.y+MARGIN) * cam.moveSpeed;

        let mx = 0;
        let my = 0;

        if (cam.moving) {

            this.pos.x += dx * moveSpeedX * ev.step;
            this.pos.y += dy * moveSpeedY * ev.step;
        }
        else {

            if (this.speed.x > 0 &&
                this.pos.x+this.center.x+this.hitbox.x/2 > cx+cam.width)
                mx = 1;
            else if (this.speed.x < 0 &&
                this.pos.x+this.center.x-this.hitbox.x/2 < cx)
                mx = -1;
            else if (this.speed.y > 0 &&
                this.pos.y+this.center.y+this.hitbox.y/2 > cy+cam.height)
                my = 1;
            else if (this.speed.y < 0 &&
                this.pos.y+this.center.y-this.hitbox.y/2 < cy)
                my = -1;

            if (mx != 0 || my != 0)
                cam.move(mx, my, CAM_SPEED);

            // TODO: Check looping
        }
    }
}
