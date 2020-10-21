/**
 * The End of Journey
 * 
 * (c) 2020 Jani Nykänen
 */


import { Vector2 } from "./core/vector.js";
import { CollisionObject } from "./collisionobject.js";
import { overlay } from "./core/util.js";
import { Sprite } from "./core/sprite.js";
import { Flip } from "./core/canvas.js";


export class Enemy extends CollisionObject {
	
	
	constructor(x, y, row, health, dmg) {
		
		super(x, y);
		
		this.startPos = this.pos.clone();
        
		this.spr = new Sprite(16, 16);
		this.spr.setFrame(0, row+1);
		
		this.maxHealth = health;
		this.health = health;
		this.damage = dmg;
		
		this.hurtTimer = 0;
        this.hurtIndex = -1;
        this.rangedHurtIndex = -1;
		
		this.dir = 1;
		this.flip = Flip.None;
		
		this.canJump = false;
		
		this.friction = new Vector2(0.1, 0.1);
		this.mass = 1;
		
		this.hitbox = new Vector2(8, 8);
        this.collisionBox = new Vector2(8, 8);
        this.renderOffset = new Vector2(0, 0);
		
		this.deactivated = false;
	}
	
	
	init(x, y) {}
	updateAI(ev) {}
	animate(ev) {}
	playerEvent(pl, ev) {}
	
	
	die(ev) {
		
		const DEATH_SPEED = 6;
    
		this.spr.animate(0, 0, 4, DEATH_SPEED, ev.step);
		return this.spr.frame >= 4;
	}

	
	activate() {
		
		this.deactivated = false;
		// TODO: Not for all enemies, though
		this.disableCollisions = false;
		
		this.init(this.startPos.x, this.startPos.y);
	}

	
	updateLogic(ev) {
           
		if (this.deactivated) {
			
			return;
		}
        
        this.updateAI(ev);
        this.animate(ev);

        if (this.hurtTimer > 0) {

            this.hurtTimer -= ev.step;
        }
	}
	
	
	postUpdate(ev) {
		
		this.canJump = false;
    }
    

    hurt(knockback, dmg, objm, source, ev) {

        const HURT_TIME = 30;

        this.health -= dmg;
		this.speed.x = this.mass * knockback;
					
		this.hurtTimer = HURT_TIME + (this.hurtTimer % 2);
        
        if (this.health <= 0) {

            this.hurtTimer = 0;

            this.dying = true;
            this.flip = Flip.None;
			this.spr.setFrame(0, 0);
			
			objm.spawnCollectibles(this.pos.x, 
				this.pos.y + this.center.y,
				source.pos, 1, 2);
        }

        // Sound effect
        ev.audio.playSample(
			ev.assets.samples[this.dying ? "kill" : "hit"], 0.60);
			
		objm.spawnDamageText(dmg, this.pos.x, 
			this.pos.y + this.center.y - this.spr.height/2);
    }
	
	
	playerCollision(pl, objm, ev) {
		
        if (!this.exist || this.dying || !this.inCamera ||
            this.deactivated) 
			return false;
	
        this.playerEvent(pl, ev);

		pl.hurtCollision(
			this.pos.x + this.center.x - this.hitbox.x/2,
			this.pos.y + this.center.y - this.hitbox.y/2,
			this.hitbox.x, this.hitbox.y,
			this.damage, ev);
		
        if (pl.isSwordActive() && 
            pl.attackId > this.hurtIndex) {
			
			if (overlay(this.pos, this.center, this.hitbox,
                pl.swordHitPos.x - pl.swordHitSize.x/2, 
                pl.swordHitPos.y - pl.swordHitSize.y/2,
				pl.swordHitSize.x, pl.swordHitSize.y)) {

                this.hurt(
                    pl.getAttackKnockback(), 
					pl.getAttackDamage(), objm,
					pl, ev);

                this.hurtIndex = pl.attackId;
				
				if (!this.dying)
					pl.stopSpecialAttackMovement();
				
                pl.bounce();
				
				return true;
			}
        }
        
        if (pl.boomerang.exist &&
            pl.boomerang.hitId > this.rangedHurtIndex) {

            if (this.overlayObject(pl.boomerang)) {

				this.hurt(pl.boomerang.getKnockback(this), 
					pl.getBoomerangPower(), objm, 
					pl.boomerang, ev);

                pl.boomerang.forceReturn();

                this.rangedHurtIndex = pl.boomerang.hitId;
            }
        }
		
		return false;
	}
	
	
	draw(c) {
		
		if (this.deactivated ||
			!this.exist || !this.inCamera ||
			(this.hurtTimer > 0 && 
			Math.floor(this.hurtTimer/2) % 2 == 0)) 
            return;
		
		let px = this.pos.x + this.renderOffset.x - this.spr.width/2;
        let py = this.pos.y + this.renderOffset.y - this.spr.height/2;

        this.spr.draw(c, c.bitmaps["enemies"], 
            px | 0, py | 0, this.flip);
	}
	
	
	floorCollisionEvent(x, y, w, ev) {
		
        this.canJump = true;
	}
	
	
	cameraEvent(cam, ev) {
		
		if (!this.exist) return;
		
		let oldState = this.inCamera;
		this.inCamera = cam.isObjectInside(this);
		
		if (!this.inCamera) {

			if (this.dying) {

				this.exist = false;
				return;
			}

			if (this.deactivated) {
				
				this.activate();
				return;
			}
		}
		
		// If left the camera, return to the original position
		// (if not dead)
		if (!this.dying &&
			this.inCamera != oldState && oldState) {
			
			this.pos = this.startPos.clone();
			this.stopMovement();

			this.health = this.maxHealth;
			this.hurtTimer = 0;
			
			if (!cam.isMoving) {
				
				this.deactivated = true;
				this.disableCollisions = true;
			}
		}
		
		// Collisions with the left and right sides of the
		// camera
		if (!cam.isMoving && this.inCamera) {
			
            this.wallCollision(cam.rpos.x * cam.width, 
                cam.rpos.y * cam.height, cam.height, -1, ev);
            
            this.wallCollision((cam.rpos.x+1) * cam.width, 
                cam.rpos.y * cam.height, cam.height, 1, ev);    
		}
	}


	isActive() {

		return this.exist && !this.dying && this.inCamera;
	}

	
	enemyCollisionEvent(e) {}


	enemyCollision(e) {

		if (!e.isActive() || !this.isActive())
			return false;

		let r1 = Math.hypot(this.hitbox.x/2, this.hitbox.y/2);
		let r2 = Math.hypot(e.hitbox.x/2, e.hitbox.y/2);
		
		let dir = new Vector2(
			this.pos.x + this.center.x - e.pos.x - e.center.x,
			this.pos.y + this.center.y - e.pos.y - e.center.y);

		let dist = dir.length();
		dir.normalize();

		let r;
		if (dist < r1 + r2) {

			r = r1 + r2 - dist;

			this.pos.x += dir.x * r/2;
			this.pos.y += dir.y * r/2;

			this.enemyCollisionEvent(e);

			e.pos.x -= dir.x * r/2;
			e.pos.y -= dir.y * r/2;

			e.enemyCollisionEvent(this);

			// Possible TODO: Alter speed?

			return true;
		}
		return false;
	}
}
