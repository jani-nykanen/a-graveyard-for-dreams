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
import { Boomerang } from "./boomerang.js";


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

        this.sliderTimer = 0;

        this.attackTimer = 0;
        this.swordAttack = false;
        this.canAttack = false;

        this.downAttack = false;
        this.downAttackWaitTimer = 0;

        this.touchWall = false;
        this.wallJumpMargin = 0;
        this.wallDir = 0;

        this.boomerang = null;
    }


    handleAttack(ev) {

        const EPS = 0.1;

        const ATTACK_TIME = 20;
        const DOWN_ATTACK_GRAVITY = 4.0;
        const DOWN_ATTACK_INITIAL_SPEED = -3.0;
        const DOWN_ATTACK_FRICTION = 0.35;

        // Attacking
        if (ev.input.actions["fire2"].state == State.Pressed) {

            // Down attack
            if (!this.climbing && !this.swimming &&
                !this.canJump && ev.input.stick.y > EPS) {
                
                this.stopMovement();
                this.speed.y = DOWN_ATTACK_INITIAL_SPEED;
                this.target.y = DOWN_ATTACK_GRAVITY;
                this.friction.y = DOWN_ATTACK_FRICTION;

                this.downAttack = true;
                this.downAttackWaitTimer = 0;

                return true;
            }

            // Base attack
            if (this.canAttack) {

                this.canAttack = false;
                this.attackTimer = ATTACK_TIME;
                this.stopMovement();

                this.jumpTimer = 0;
                this.sliderTimer = 0;

                this.swordAttack = true;

                return true;
            }
        }
        return false;
    }


    handleSwimming(ev) {

        const SWIMMING_MOD_X = 0.5;
        const SWIMMING_MOD_Y = 0.25;

        // If swimming, lower the friction (and target speeds)
        if (this.swimming) {

            this.friction.x *= SWIMMING_MOD_X;
            this.friction.y *= SWIMMING_MOD_Y;

            this.target.x *= SWIMMING_MOD_X;
            this.target.y *= SWIMMING_MOD_Y;

            this.touchWall = false;
            this.wallJumpMargin = 0;
        }

    }


    handleClimbing(ev) {

        const EPS = 0.1;

        const CLIMB_SPEED = 0.5;
        const JUMP_TIME = 14.0;

        let jumpButtonState = ev.input.actions["fire1"].state;

        // Climbing
        if (this.climbing) {

            if (ev.input.stick.x > EPS) 
                this.flip = Flip.None;
            else if (ev.input.stick.x < -EPS)
                this.flip = Flip.Horizontal;

            this.target.y = CLIMB_SPEED * ev.input.stick.y;
            this.target.x = 0.0;

            if (jumpButtonState == State.Pressed) {

                if (ev.input.stick.y < EPS)
                    this.jumpTimer = JUMP_TIME;

                this.doubleJump = false;

                this.climbing = false;
                this.climbingBegun = false;
            }
            return true;
        }
        return false;
    }


    handleJump(ev) {

        const EPS = 0.1;
        
        const JUMP_TIME = 14.0;
        const DOUBLE_JUMP_TIME = 8.0;
        const SLIDE_TIME = 20;
        const WALL_JUMP_BONUS = -2.0;

        let jumpButtonState = ev.input.actions["fire1"].state;

        // Jumping and related actions
        if (jumpButtonState == State.Pressed) {

            if (this.canJump && ev.input.stick.y > EPS) {

                this.sliderTimer = SLIDE_TIME;
            }
            else if (this.canJump || this.jumpMargin > 0 || 
                !this.doubleJump ||
                this.wallJumpMargin > 0) {

                this.doubleJump = !this.canJump && 
                    this.jumpMargin <= 0 && 
                    this.wallJumpMargin <= 0;

                this.jumpTimer = this.doubleJump ? DOUBLE_JUMP_TIME : JUMP_TIME;
                this.canJump = false;
                this.jumpMargin = 0;  

                // Horizontal bonus for the wall jump
                if (this.wallJumpMargin > 0) {

                    this.speed.x = WALL_JUMP_BONUS * this.wallDir; 
                }
                this.touchWall = false;
                this.wallJumpMargin = 0;
            }
        }
        else if (jumpButtonState == State.Released ) {

            if (this.jumpTimer > 0)
                this.jumpTimer = 0.0;

            else if (this.sliderTimer > 0)
                this.sliderTimer = 0.0;
        }
    }


    handleBoomerang(ev) {

        const THROW_SPEED = 2.0;
        const THROW_TIME = 15;
        const RETURN_TIME = 24;

        if (this.boomerang != null && this.boomerang.exist)
            return false;

        let dir = this.flip == Flip.None ? 1 : -1;
        
        if (ev.input.actions["fire3"].state == State.Pressed) {

            this.boomerang = new Boomerang(
                this.pos.x+4*dir, this.pos.y+2,
                THROW_SPEED*dir, 0, RETURN_TIME,
                this);

            // Required for collisions, when throwing the boomerang
            // next to a wall
            this.boomerang.oldPos.x = this.pos.x;

            this.stopMovement();
            this.attackTimer = THROW_TIME;
            this.swordAttack = false;

            this.jumpTimer = 0;
            this.sliderTimer = 0;

            return true;
        }
        return false;
    }


    control(ev) {

        const BASE_SPEED = 1.0;
        const BASE_GRAVITY = 2.0;
        const BASE_FRICTION_X = 0.1;
        const BASE_FRICTION_Y = 0.15;
        const WALL_RIDE_REDUCE_GRAVITY = 0.25;

        if (this.attackTimer > 0 || this.downAttack) return;

        this.target.x = BASE_SPEED * ev.input.stick.x;
        this.target.y = BASE_GRAVITY;
        if (this.touchWall)
            this.target.y *= WALL_RIDE_REDUCE_GRAVITY;

        this.friction = new Vector2(BASE_FRICTION_X, BASE_FRICTION_Y);

        // Pretty. 
        // TODO: Refactor this, please
        if (this.handleAttack(ev) ||
            this.handleBoomerang(ev))
            return;
        this.handleSwimming(ev);
        if (this.handleClimbing(ev))
            return;
        this.handleJump(ev);
    }


    animate(ev) {

        const EPS = 0.1;
        const JUMP_EPS = 0.5;
        const DOUBLE_JUMP_ANIM_SPEED = 4;

        let animSpeed = 0.0;
        let animFrame = 0;

        // Down attack
        if (this.downAttack) {

            this.spr.setFrame(1, 4);
            return;
        }

        // Attacking, obviously
        if (this.attackTimer > 0) {

            this.spr.setFrame(0, 4);
            return;
        }

        // Sliding
        if (this.sliderTimer > 0) {

            this.spr.setFrame(4, 1);
            return;
        }

        // Determine flipping first
        if (Math.abs(this.target.x) > EPS) {

            this.flip = this.target.x < 0 ? Flip.Horizontal : Flip.None;
        }

        // Wall-riding
        if (this.touchWall) {

            this.spr.setFrame(3, 1);
            return;
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

            if (this.spr.row != 3 ||
                Math.abs(this.target.y) > EPS) {

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
        const SLIDE_SPEED = 2.0;

        if (this.jumpTimer > 0) {

            this.speed.y = JUMP_SPEED;
            if (this.swimming)
                this.speed.y *= SWIMMING_MOD_Y;

            this.jumpTimer -= ev.step;
        }

        if (this.sliderTimer > 0) {

            this.speed.x = (this.flip == Flip.None ? 1 : -1) * SLIDE_SPEED;
            this.target.x = this.speed.x;

            this.sliderTimer -= ev.step;
        }

        if (this.jumpMargin > 0)
            this.jumpMargin -= ev.step;

        if (this.wallJumpMargin > 0)
            this.wallJumpMargin -= ev.step;   

        if (this.attackTimer > 0)
            this.attackTimer -= ev.step;      

        if (this.downAttackWaitTimer > 0) {

            if ((this.downAttackWaitTimer -= ev.step) <= 0) {

                this.downAttack = false;
            }
        }
    }


    updateLogic(ev) {

        if (this.climbingBegun && !this.climbing) {

            this.climbingBegun = false;
        }

        this.control(ev);
        this.updateTimers(ev);
        this.animate(ev);

        if (this.boomerang != null) {

            this.boomerang.update(ev);
        }

        this.climbing = false;
        this.swimming = false;
    }


    postUpdate(ev) {

        this.canJump = false;
        this.touchWall = false;
    }
    

    draw(c) {

        let px = Math.round(this.pos.x-8);
        let py = Math.round(this.pos.y-7);

        if (this.attackTimer > 0 && this.swordAttack) {

            this.spr.drawFrame(c, c.bitmaps["figure"], 
                2, 4,
                px+12 - 24*this.flip, 
                py+1, this.flip);
        }

        this.spr.draw(c, c.bitmaps["figure"], px, py, this.flip);

        if (this.downAttack) {

            this.spr.drawFrame(c, c.bitmaps["figure"], 
                3, 4,
                px+3 - 6*this.flip, 
                py+7, this.flip);
        }

        if (this.boomerang != null) {

            this.boomerang.draw(c);
        }
    }


    floorCollisionEvent(x, y, w, ev) {

        const JUMP_MARGIN = 12;
        const DOWN_ATTACK_WAIT = 20;
        const EPS = 0.1;

        this.canJump = true;
        this.doubleJump = false;

        this.jumpMargin = JUMP_MARGIN;

        if (this.speed.y > EPS) {

            this.climbing = false;
            this.climbingBegun = false;
        }

        this.canAttack = true;

        if (this.downAttack &&
            this.downAttackWaitTimer <= 0.0) {

            this.downAttackWaitTimer = DOWN_ATTACK_WAIT;
        }

        this.wallJumpMargin = 0;
        this.touchWall = false;
    }


    wallCollisionEvent(x, y, h, dir, ev) {

        const EPS = 0.1;
        const WALL_JUMP_MARGIN = 15.0;

        if (!this.climbing &&
            !this.downAttack &&
            this.attackTimer <= 0 &&
            !this.swimming &&
            this.speed.y > 0.0 &&
            ev.input.stick.x*dir > EPS) {

            this.touchWall = true;
            this.wallJumpMargin = WALL_JUMP_MARGIN;

            this.wallDir = dir;
        }
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

            this.canAttack = true;
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

            this.canAttack = true;
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
            this.sliderTimer = 0;

            this.canAttack = true;

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
