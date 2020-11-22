/**
 * A Graveyard for Fools
 * 
 * (c) 2020 Jani Nykänen
 */

import { CollisionObject } from "./collisionobject.js";
import { Sprite } from "./core/sprite.js";
import { Vector2 } from "./core/vector.js";
import { Flip } from "./core/canvas.js";
import { State } from "./core/input.js";
import { Boomerang } from "./boomerang.js";
import { overlay } from "./core/util.js";
import { ItemType } from "./progress.js";
import { ROOM_HEIGHT, ROOM_WIDTH } from "./camera.js";


const ATTACK_TIME = 16;
// TODO: Make sure the number below is sufficient
const ATTACK_HIT_TIME = 5;
const SPC_RELEASE_TIME = 12;


export class Player extends CollisionObject {


    constructor(x, y, progress) {

        super(x, y);

        this.checkpoint = new Vector2(x, y);
        this.currentSavepoint = null;

        this.spr = new Sprite(16, 16);
        this.spr.setFrame(4, 4);
        this.swordSpr = new Sprite(16, 16);
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
        this.oxygenTime = 0;

        this.slideTimer = 0;

        this.attackTimer = 0;
        this.swordAttack = false;
        this.canAttack = false;
        this.charging = false;
        this.chargeTimer = 0;
        this.specialAttack = false;

        this.swordHitPos = new Vector2(0, 0);
        this.swordHitSize = new Vector2(0, 0);
        this.attackId = 0;

        this.downAttack = false;
        this.downAttackWaitTimer = 0;

        this.touchWall = false;
        this.wallJumpMargin = 0;
        this.wallDir = 0;

        this.boomerang = new Boomerang();
        this.boomerang.exist = false;

        this.dir = 1;

        this.hurtTimer = 0;
        this.knockBackTimer = 0;

        this.progress = progress;

        // hahah f(l)apping
        this.flapping = false;
        this.jumpReleased = false;

        this.inCamera = true;

        this.deathTimer = 0;

        this.showArrow = false;
        this.showArrowTimer = 0.0;

        this.obtainedItem = null;

        this.forceWaitTimer = 0.0;

        this.markRoomVisited();
    }


    markRoomVisited() {

        let x = (((this.pos.x / 16) | 0) / ROOM_WIDTH) | 0;
        let y = (((this.pos.y / 16) | 0) / ROOM_HEIGHT) | 0;

        this.progress.markRoomVisited(x, y);
    }


    respawnToCheckpoint(p) {

        this.checkpoint = p.clone();
        this.pos = this.checkpoint.clone();
    }


    setSwordHitbox(x, y, w, h) {

        this.swordHitPos.x = x;
        this.swordHitPos.y = y;

        this.swordHitSize.x = w;
        this.swordHitSize.y = h;

        ++ this.attackId;
    }


    startBaseAttack(special) {

        const SPECIAL_RUSH_SPEED = 1.25;

        // TODO: Make sure this happens only if
        // wall-riding has been learned!
        if (this.touchWall) {

            this.dir *= -1;
            this.flip = this.flip == Flip.None ? Flip.Horizontal : Flip.None;
        }

        this.canAttack = false;
        this.attackTimer = ATTACK_TIME;

        this.stopMovement();
        if (!special) {

            if (this.progress.hasItem(ItemType.ProteinBar))
                this.attackTimer += SPC_RELEASE_TIME;
        }
        else if (!this.climbing) {

            this.speed.x = this.dir * SPECIAL_RUSH_SPEED;
            this.target.x = this.speed.x;
        }
        this.specialAttack = special;

        this.jumpTimer = 0;
        this.slideTimer = 0;

        this.swordAttack = true;

        this.setSwordHitbox(
            this.pos.x + 13*this.dir,
            this.pos.y + 2, 
            12, special ? 10 : 4);
    }


    handleAttack(ev) {

        const EPS = 0.1;

        const DOWN_ATTACK_GRAVITY = 4.0;
        const DOWN_ATTACK_INITIAL_SPEED = -3.0;
        const DOWN_ATTACK_FRICTION = 0.35;

        if (!this.progress.hasItem(ItemType.Sword))
            return;
        
        let atkButtonState = ev.input.actions["fire2"].state;

        // Attacking
        if (atkButtonState == State.Pressed) {

            // Down attack
            if (this.progress.hasItem(ItemType.DownAttack) &&
                !this.climbing && !this.swimming &&
                !this.canJump && ev.input.stick.y > EPS) {
                
                this.stopMovement();
                this.speed.y = DOWN_ATTACK_INITIAL_SPEED;
                this.target.y = DOWN_ATTACK_GRAVITY;
                this.friction.y = DOWN_ATTACK_FRICTION;

                this.downAttack = true;
                this.downAttackWaitTimer = 0;

                this.setSwordHitbox(
                    this.pos.x,
                    this.pos.y + 16, 
                    8, 12);

                // Sound effect
                ev.audio.playSample(ev.assets.samples["downAttack"], 0.60);

                return true;
            }

            // Base attack
            if (this.canAttack) {

                this.startBaseAttack(false);

                // Sound effect
                ev.audio.playSample(ev.assets.samples["sword"], 0.50);

                return true;
            }
        }
        return false;
    }


    handleSwimming(ev) {

        const SWIMMING_MOD_X = 0.5;
        const SWIMMING_MOD_Y = 0.25;

        // If swimming, lower the friction (and target speeds)
        if (!this.swimming) 
            return;

        this.friction.x *= SWIMMING_MOD_X;
        this.friction.y *= SWIMMING_MOD_Y;

        this.target.x *= SWIMMING_MOD_X;
        this.target.y *= SWIMMING_MOD_Y;

        this.touchWall = false;
        this.wallJumpMargin = 0;
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

                // Sound effect
                ev.audio.playSample(ev.assets.samples["jump"], 0.50);
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
        const FLAP_SPEED = 0.5;

        let jumpButtonState = ev.input.actions["fire1"].state;

        // Jumping and related actions
        if (jumpButtonState == State.Pressed) {

            if (this.progress.hasItem(ItemType.Lubricant) &&
                !this.swimming && 
                this.canJump && ev.input.stick.y > EPS) {

                this.slideTimer = SLIDE_TIME;

                // Sound effect
                ev.audio.playSample(ev.assets.samples["jump"], 0.50);
            }
            else if (this.canJump || this.jumpMargin > 0 || 
                (this.progress.hasItem(ItemType.Beans) && !this.doubleJump) ||
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

                this.canAttack = true;

                this.jumpReleased = false;

                // Sound effect
                ev.audio.playSample(ev.assets.samples["jump"], 0.50);
            }
        }
        else if (jumpButtonState == State.Released ) {

            if (this.jumpTimer > 0)
                this.jumpTimer = 0.0;

            else if (this.slideTimer > 0)
                this.slideTimer = 0.0;

            this.jumpReleased = true;
        }
    
        // Flapping
        this.flapping = 
            this.progress.hasItem(ItemType.TinyWings) &&
            this.jumpReleased &&
            (!this.progress.hasItem(ItemType.Beans) || this.doubleJump) &&
            this.attackTimer <= 0 &&
            (jumpButtonState & State.DownOrPressed) == 1 &&
            this.jumpTimer <= 0;

        if (this.flapping) {

            this.target.y = FLAP_SPEED;
            this.speed.y = this.target.y;
        }
    }


    handleBoomerang(ev) {

        const THROW_SPEED = 2.0;
        const THROW_TIME = 30;
        const RETURN_TIME = 24;

        if (!this.progress.hasItem(ItemType.Boomerang) ||
            this.boomerang.exist)
            return false;

        // TODO: Make sure this happens only if
        // wall-riding has been learned!
        if (this.touchWall) {

            this.dir *= -1;
            this.flip = this.flip == Flip.None ? Flip.Horizontal : Flip.None;
        }
        
        if (ev.input.actions["fire3"].state == State.Pressed) {

            this.boomerang.spawn(
                this.pos.x+4*this.dir, this.pos.y+2,
                THROW_SPEED*this.dir, 0, RETURN_TIME,
                this, this.progress.hasItem(ItemType.FireBall));

            // Required for collisions, when throwing the boomerang
            // next to a wall
            this.boomerang.oldPos.x = this.pos.x;

            this.stopMovement();
            this.attackTimer = THROW_TIME;
            this.swordAttack = false;

            this.jumpTimer = 0;
            this.slideTimer = 0;

            // Sound effect
            ev.audio.playSample(ev.assets.samples["throw"], 0.60);

            return true;
        }
        return false;
    }


    handleSpecialAttack(ev) {

        let atkButtonState = ev.input.actions["fire2"].state;
        let released = atkButtonState == State.Released ||
                       atkButtonState == State.Up;
                       
        if (!released ||
            !this.progress.hasItem(ItemType.ProteinBar)) 
            return;

        if (this.charging && released) {

            this.charging = false;
            this.chargeTimer = 0.0;

            this.startBaseAttack(true);

            // Sound effect
            ev.audio.playSample(ev.assets.samples["powerAttack"], 0.60);
        }
        else if (!this.specialAttack &&
            this.attackTimer > 0 && 
            this.attackTimer <= SPC_RELEASE_TIME) {

            this.attackTimer = 0;
        }
    }


    control(ev) {

        const BASE_SPEED = 1.0;
        const BASE_GRAVITY = 2.0;
        const BASE_FRICTION_X = 0.1;
        const BASE_FRICTION_Y = 0.15;
        const WALL_RIDE_REDUCE_GRAVITY = 0.25;

        this.dir = this.flip == Flip.None ? 1 : -1;

        this.handleSpecialAttack(ev);

        if (this.attackTimer > 0 || 
            this.downAttack)
            return;

            this.target.y = BASE_GRAVITY;

        if (this.knockBackTimer > 0) return;

        this.target.x = BASE_SPEED * ev.input.stick.x;
        if (this.touchWall && !this.swimming)
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
        const SWORD_SPC_SPEED = 4;
        const FLAP_ANIM_SPEED = 3;

        let animSpeed = 0.0;
        let animFrame = 0;
        let oldFrame = this.spr.frame;
        let oldRow = this.spr.row;

        // Hurt
        if (this.knockBackTimer > 0) {

            this.spr.setFrame(0, 5);
            return;
        }

        // Down attack
        if (this.downAttack) {

            this.swordSpr.setFrame(3, 4);
            this.spr.setFrame(1, 4);
            return;
        }

        // Attacking, obviously
        if (this.attackTimer > 0) {

            this.spr.setFrame(0, 4);
            if (this.specialAttack)
                this.swordSpr.animate(4, 7, 8,
                     SWORD_SPC_SPEED, ev.step);
            else
                this.swordSpr.setFrame(2, 4);

            return;
        }

        // Sliding
        if (this.slideTimer > 0) {

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

                if (this.spr.row != oldRow ||
                    (this.spr.frame != oldFrame && this.spr.frame == 3)) {

                    // Sound effect
                    ev.audio.playSample(ev.assets.samples["climb"], 0.60);
                }
            }
            return;
        }

        // Flapping
        if (this.flapping) {

            this.spr.animate(6, 0, 3, FLAP_ANIM_SPEED, ev.step);

            if (this.spr.row != oldRow ||
                (this.spr.frame != oldFrame && this.spr.frame == 0)) {

                // Sound effect
                ev.audio.playSample(ev.assets.samples["flap"], 0.50);
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


    updateSwordHitbox(ev) {

        if (this.attackTimer > 0 && this.specialAttack) {

            this.swordHitPos.x += this.speed.x * ev.step;
        }
        else if (this.downAttack) {

            this.swordHitPos.y += this.speed.y * ev.step;
        }
    }


    updateTimers(ev) {

        const JUMP_SPEED = -2.0;
        const SWIMMING_MOD_Y = 0.5;
        const SLIDE_SPEED = 2.0;
        const CHARGE_MAX = 20; // Could be anything, really
        const SHOW_ARROW_SPEED = 1.0 / 30.0;

        if (this.progress.hasItem(ItemType.Flippers) &&
            !this.progress.hasItem(ItemType.Snorkel) && 
            this.swimming) {

            if ((this.oxygenTime -= ev.step) <= 0) {

                this.kill(ev);
                return;
            }
        }
        else {

            this.oxygenTime = 0;
        }

        if (this.showArrow) {

            this.showArrowTimer += SHOW_ARROW_SPEED * ev.step;
            this.showArrowTimer %= 1.0;
        }

        if (this.jumpTimer > 0) {

            this.speed.y = JUMP_SPEED;
            if (this.swimming)
                this.speed.y *= SWIMMING_MOD_Y;

            this.jumpTimer -= (this.progress.hasItem(ItemType.JumpBoots) ? 1 : 2) * ev.step;
        }

        if (this.slideTimer > 0) {

            this.speed.x = this.dir * SLIDE_SPEED;
            this.target.x = this.speed.x;

            this.slideTimer -= ev.step;
        }

        if (this.jumpMargin > 0)
            this.jumpMargin -= ev.step;

        if (this.wallJumpMargin > 0)
            this.wallJumpMargin -= ev.step;   

        if (this.attackTimer > 0) {

            this.attackTimer -= ev.step;    

             // "Charge attack"
            if (this.progress.hasItem(ItemType.ProteinBar) &&
                !this.specialAttack &&
                this.swordAttack && 
                this.attackTimer <= 0) {

                this.charging = true;

                // Sound effect
                ev.audio.playSample(ev.assets.samples["charge"], 0.50);
            }
        }  

        if (this.downAttackWaitTimer > 0) {

            if ((this.downAttackWaitTimer -= ev.step) <= 0) {

                this.downAttack = false;
            }
        }

        if (this.charging) {

            this.chargeTimer = (this.chargeTimer + ev.step) % CHARGE_MAX;
        }

        if (this.hurtTimer > 0) {

            if (this.knockBackTimer > 0) {

                this.knockBackTimer -= ev.step;
                if (this.progress.health <= 0 &&
                    this.knockBackTimer <= 0) {

                    this.kill(ev);
                }
            }
            else {

                this.hurtTimer -= ev.step;
            }
        }
    }


    kill(ev) {

        this.dying = true;
        this.spr.setFrame(0, 7);
        this.stopMovement();

        ev.audio.stopMusic();

        // Sound effect
        ev.audio.playSample(ev.assets.samples["die"], 0.50);
    }


    updateLogic(ev) {

        if (this.climbingBegun && !this.climbing) {

            this.climbingBegun = false;
        }

        this.control(ev);
        this.updateSwordHitbox(ev);
        this.updateTimers(ev);
        this.animate(ev);

        this.boomerang.preUpdate(ev);
        this.boomerang.update(ev);

        this.climbing = false;
        this.swimming = false;
    }


    postUpdate(ev) {

        this.canJump = false;
        this.touchWall = false;
        this.showArrow = false;
        this.obtainedItem = null;
    }


    die(ev) {

        const MAX_DEATH_TIME = 120;
        const FLICKER_SPEED = 3;

        this.spr.animate(7, 0, 2, FLICKER_SPEED, ev.step);

        return (this.deathTimer += ev.step) >= MAX_DEATH_TIME;
    }
    

    drawDeath(c) {

        // Let's draw some balls!

        const BALL_SPEED = 1.0;
        const BALL_COUNT = 8;

        let r = this.deathTimer * BALL_SPEED;
        let x, y;

        let angle = 0;
        for (let i = 0; i < BALL_COUNT; ++ i) {

            angle = Math.PI*2 / BALL_COUNT * i;

            x = this.pos.x + this.center.x + Math.cos(angle) * r;
            y = this.pos.y + this.center.y + Math.sin(angle) * r;

            this.spr.draw(c, c.bitmaps["figure"], x-8, y-8, Flip.None);
        }
    }


    draw(c) {

        if (!this.exist) return;

        this.boomerang.preDraw(c);

        if (this.dying) {

            this.drawDeath(c);
            this.boomerang.draw(c);
            return;
        }

        if (this.hurtTimer > 0 &&
            Math.floor(this.hurtTimer /2) % 2 != 0)
            return;

        let frame = this.spr.frame;
        if (this.charging && Math.floor(this.chargeTimer/2) % 2 == 0) {

            frame += 5;
        }

        let px = Math.round(this.pos.x-8);
        let py = Math.round(this.pos.y-7);

        if (this.attackTimer > 0 && this.swordAttack) {

            this.swordSpr.draw(c, c.bitmaps["figure"], 
                px+12 - 24*this.flip, 
                py+1, this.flip);
        }

        this.spr.drawFrame(c, c.bitmaps["figure"], 
            frame, this.spr.row,
            px, py, this.flip);

        if (this.downAttack) {

            this.swordSpr.draw(c, c.bitmaps["figure"], 
                px+3 - 6*this.flip, 
                py+7, this.flip);
        }

        this.boomerang.draw(c);

        if (this.showArrow) {

            this.spr.drawFrame(c, c.bitmaps["figure"],
                3 + Math.floor(this.showArrowTimer/0.5),
                7, px, py - 16, Flip.None);
        }

        if (this.obtainedItem != null) {

            c.drawBitmapRegion(c.bitmaps["items"],
                this.obtainedItem.x*16, 
                this.obtainedItem.y*16, 
                16, 16,
                px, py-16, Flip.None);
        }

        // Oxygen time
        if (this.progress.hasItem(ItemType.Flippers) && 
            !this.progress.hasItem(ItemType.Snorkel) && 
            this.swimming &&
            this.oxygenTime > 0) {

            c.drawText(c.bitmaps["font"], String(Math.round(this.oxygenTime / 60)),
                px + 8, py - 10, -1, 0, true);
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
            
            if (this.progress.hasItem(ItemType.StickyGlove)) {

                this.touchWall = true;
                this.wallJumpMargin = WALL_JUMP_MARGIN;
            }

            this.wallDir = dir;

            this.canAttack = true;
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

        if (ev.input.upPress() || ev.input.downPress()) {

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


    waterCollision(x, y, w, h, surface, ev) {

        const OXYGEN_TIME = 5 * 60;

        if (!surface && !this.progress.hasItem(ItemType.Flippers)) {

            return this.floorCollision(x, y-4, w, ev, false);
        }

        if (this.overlay(x, y, w, h)) {

            if (this.oxygenTime <= 0 && !this.swimming) {

                this.oxygenTime = OXYGEN_TIME;
            }

            this.swimming = true;
            this.jumpMargin = 1;
            this.doubleJump = false;
            this.slideTimer = 0;

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

        let dir;

        if (cam.moving) {

            this.pos.x += dx * moveSpeedX * ev.step;
            this.pos.y += dy * moveSpeedY * ev.step;
        }
        else {

            if (this.knockBackTimer <= 0) {

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

                if (mx != 0 || my != 0) {

                    if ( (dir = cam.move(mx, my, CAM_SPEED)) != 0) {

                        // Loop
                        this.pos.x += dir * cam.width * cam.screenCountX;
                    }

                    this.markRoomVisited();
                }

            }
            else  {

                this.wallCollision(cam.rpos.x * cam.width, 
                    cam.rpos.y * cam.height, cam.height, -1, ev);
                this.wallCollision((cam.rpos.x+1) * cam.width, 
                    cam.rpos.y * cam.height, cam.height, 1, ev);    
            }
        }

        // Check if boomerang has left the room
        if (this.boomerang != null && this.boomerang.exist &&
            !cam.isObjectInside(this.boomerang)) {

            this.boomerang.exist = false;
        }
    }


    hurt(dmg, ev) {

        const HURT_TIME = 60;
        const KNOCKBACK_TIME = 30;
        const KNOCKBACK_SPEED = 2.0;

        this.flip = this.dir > 0 ? Flip.None : Flip.Horizontal;

        this.hurtTimer = HURT_TIME;
        this.knockBackTimer = KNOCKBACK_TIME;

        this.target.x = 0.0;
        this.speed.x = KNOCKBACK_SPEED * (-this.dir);

        // TODO: A method for disabling actions?
        this.climbing = false;
        this.attackTimer = 0;
        this.downAttack = false;
        this.touchWall = false;
        this.charging = false;
        this.flapping = false;
        // this.jumpReleased = false;

        this.progress.reduceHealth(dmg);

        // Sound effect
        ev.audio.playSample(ev.assets.samples["hurt"], 0.50);
    }


    hurtCollision(x, y, w, h, dmg, ev) {
        
        if (this.hurtTimer > 0) return;

        if (this.overlay(x, y, w, h)) {

            this.dir = this.pos.x < x+w/2 ? 1 : -1;
            this.hurt(dmg, ev);

            return true;
        }
        return false;
    }


    breakCollision(x, y, w, h, ev) {

        if (this.isSwordActive() || this.downAttackWaitTimer > 0) {

            if(overlay(this.swordHitPos, null, 
                    this.swordHitSize,
                    x, y, w, h)) {

                return this.specialAttack || this.downAttack ? 2 : 1;
            }
        }
        
        //if (this.progress.hasItem())
        if (this.progress.hasItem(ItemType.Helmet) &&
            this.ceilingCollision(x, y+16, w, ev, false)) {

            return 2;
        }
        
        return 0;
    }


    isSwordActive() {

        return (this.downAttack && this.speed.y >= 0) || 
            (this.swordAttack &&
             this.attackTimer > (this.specialAttack ? 0 : ATTACK_TIME-ATTACK_HIT_TIME));
    }


    isBoomerangGoingForward() {

        return this.boomerang.exist &&
            !this.boomerang.returning;
    }


    getAttackDamage() {

        let dmg = 2;
        if (this.downAttack)
            ++ dmg;
        else if (this.specialAttack)
            dmg += 2;

        return dmg;
    }


    getAttackKnockback() {

        const BASE_KNOCKBACK = 2.0;
        const SPECIAL_MUL = 1.5;

        if (this.downAttack)
            return 0;

        return this.dir * BASE_KNOCKBACK * 
            (this.specialAttack ? SPECIAL_MUL : 1);
    }

    
    stopSpecialAttackMovement() {

        if (this.specialAttack && this.attackTimer > 0) {

            this.speed.x = 0;
            this.target.x = 0;
        }
    }


    bounce() {

        const BOUNCE_TIME = 8.0;

        if (this.downAttack) {

            this.downAttack = false;
            this.jumpTimer = BOUNCE_TIME;
            this.doubleJump = false;
        }
    }


    getBoomerangPower() {

        // ...
        return 1;
    }


    addCollectible(id) {

        if (id == 0) {

            this.progress.addCoins(1);
        }
        else {

            this.progress.addHealth(2);
        }
    }


    showInteractionArrow() {

        this.showArrow = true;
        // this.showArrowTimer = 0.0;
    }


    disableArrow() {

        this.showArrow = false;
    }


    setCrouchPose(x, y, dir, offset) {

        this.pos.x = x + dir * offset;
        this.pos.y = y;

        this.dir = dir;
        this.flip = dir > 0 ? Flip.Horizontal : Flip.None;

        this.spr.setFrame(4, 6);

        this.hurtTimer = 0;
    }


    setObtainItemPose(type, id) {

        this.spr.setFrame(0, 8);

        this.obtainedItem = new Vector2(id, type);

        this.hurtTimer = 0;
    }


    setDoorPose(inside) {

        this.spr.setFrame(inside ? 1 : 2, 8);
    
        this.hurtTimer = 0;
    }


    moveTo(p, cam) {

        this.pos = p.clone();
        this.stopMovement();

        cam.setPosition((this.pos.x / 160) | 0, (this.pos.y / 144) | 0);
    }


    forceWait(time) {

        this.forceWaitTimer = time;
    }


    updateForceWait(ev) {

        if (this.forceWaitTimer <= 0.0)
            return false;

       this.forceWaitTimer -= ev.step; 
       return true;
    }
}
