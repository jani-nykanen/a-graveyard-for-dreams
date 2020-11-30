/**
 * A Graveyard for Fools
 * 
 * (c) 2020 Jani Nykänen
 */


import { Flip } from "./core/canvas.js";
import { clamp } from "./core/util.js";
import { Vector2 } from "./core/vector.js";
import { Enemy } from "./enemy.js";


export function getEnemyType(index) {

	const TYPES = [
		Turtle, Fungus, Bunny, 
		Caterpillar, SandEgg, Fly, 
		Bat, Fish, Star, 
		Snowman, Apple, Rock,
		Plant, Block, ManEater,
		Spook, Imp, Bomb,
		SlimeDrop, Undying, Crystal,
	];
    
    return TYPES[clamp(index, 0, TYPES.length-1) | 0];
}


const TURTLE_BASE_SPEED = 0.25;


export class Turtle extends Enemy {
	
	
	constructor(x, y) {
		
		super(x, y, 0, 3, 2);
		
		this.friction.x = 0.025;
		
		this.oldCanJump = true;
		
		this.center.y = 2;
		this.collisionBox = new Vector2(4, 12);
        // this.hitbox = new Vector2(8, 8);
        this.renderOffset.y = 1;

        this.mass = 0.5;
	}
	
	
	init(x, y) {
		
		const BASE_GRAVITY = 2.0;
		
		this.dir = 1 - 2 * (((x / 16) | 0) % 2);
		this.flip = this.dir > 0 ? Flip.Horizontal : Flip.None;
		
		this.target.x = TURTLE_BASE_SPEED;
		this.speed.x = this.target.x;
		this.target.y = BASE_GRAVITY;
	}
	
	
	updateAI(ev) {
		
		this.target.x = TURTLE_BASE_SPEED * this.dir;

        // If going to move off the ledge, change direction
        // (unless hurt, then fall, to make it look like the
        // player attack sent you flying!)
        if (this.oldCanJump && !this.canJump &&
            this.hurtTimer <= 0) {
			
			this.dir *= -1;
			this.speed.x *= -1;
			this.target.x *= -1;
			
			this.pos.x += this.speed.x * ev.step;
		}
		
        this.oldCanJump = this.canJump;
	}
	
	
	animate(ev) {
		
		const WALK_ANIM_SPEED = 6.0;
		
		this.flip = this.dir > 0 ? Flip.Horizontal : Flip.None;
		
		if (this.canJump) {
			
			this.spr.animate(this.spr.row, 0, 3, WALK_ANIM_SPEED, ev.step);
		}
	}
	
	
	wallCollisionEvent(x, y, h, dir, ev) {
		
		this.speed.x *= -1;
		this.target.x *= -1;
		
		this.dir *= -1;
	}


	enemyCollisionEvent(e) {

		if ((this.speed.x > 0 && e.pos.x > this.pos.x) ||
			(this.speed.x < 0 && e.pos.x < this.pos.x )) {

			this.target.x *= -1;
			this.speed.x *= -1;

			this.dir *= -1;
		}
	}

}


const FUNGUS_JUMP_TIME_BASE = 60;


export class Fungus extends Enemy {
	
	
	constructor(x, y) {
		
		super(x, y, 1, 2, 1);

		this.center.y = 2;
		this.collisionBox = new Vector2(4, 12);
        // this.hitbox = new Vector2(8, 8);
		this.renderOffset.y = 1;
		
		this.friction.y = 0.05;

		this.mass = 0.5;
		
		this.jumpTimer = 0;
	}


	init(x, y) {

		const BASE_GRAVITY = 2.0;

		this.target.y = BASE_GRAVITY;

		this.jumpTimer = FUNGUS_JUMP_TIME_BASE - 
			(((x / 16) | 0) % 2) * (FUNGUS_JUMP_TIME_BASE/2);
	}


	updateAI(ev) {
		
		const JUMP_HEIGHT = -1.75;
		
		if (this.canJump) {

			if ((this.jumpTimer -= ev.step) <= 0) {

				this.jumpTimer += FUNGUS_JUMP_TIME_BASE;
                this.speed.y = JUMP_HEIGHT;
                
                // Sound effect
                ev.audio.playSample(ev.assets.samples["jump2"], 0.50);
			}
		}
	}
	
	
	animate(ev) {
		
		const EPS = 0.5;

		this.flip = this.dir > 0 ? Flip.Horizontal : Flip.None;

		let frame = 0;

		if (Math.abs(this.speed.y) > EPS)
			frame = this.speed.y < 0 ? 1 : 2;

		this.spr.setFrame(frame, this.spr.row);
	}


	playerEvent(pl, ev) {

		this.dir = pl.pos.x > this.pos.x ? 1 : -1;
	}

}


export class Caterpillar extends Enemy {
	
	
	constructor(x, y) {
		
		super(x, y, 3, 2, 1);
		
		this.friction.x = 0.1;
		
		this.oldCanJump = true;
		
		this.center.y = 4;
		this.collisionBox = new Vector2(4, 8);
        this.hitbox = new Vector2(8, 6);
        this.renderOffset.y = 1;

		this.mass = 0.5;
		
		this.canFall = false;
	}
	
	
	init(x, y) {
		
		const BASE_GRAVITY = 2.0;
		
		this.dir = 1 - 2 * (((x / 16) | 0) % 2);
		this.flip = this.dir > 0 ? Flip.Horizontal : Flip.None;
		
		this.target.y = BASE_GRAVITY;
	}
	
	
	updateAI(ev) {
        
        const BASE_SPEED = 0.60;

        this.target.x = 0.0;
        if (this.spr.frame % 2 != 0) {

            this.target.x = this.dir * BASE_SPEED;
        }
        
        // If going to move off the ledge, change direction
        // (unless hurt, then fall, to make it look like the
        // player attack sent you flying!)
        
		if (!this.canFall &&
			this.oldCanJump && !this.canJump &&
            this.hurtTimer <= 0) {
			
			this.dir *= -1;
			this.speed.x *= -1;
			this.target.x *= -1;
			
			this.pos.x += this.speed.x * ev.step;
        }
        this.oldCanJump = this.canJump;
	}
	
	
	animate(ev) {
		
        const BASE_ANIM_SPEED = 6.0;
        const WAIT_SPEED = 30.0;
		
		this.flip = this.dir > 0 ? Flip.Horizontal : Flip.None;
		
		if (this.canJump) {
			
            this.spr.animate(this.spr.row, 0, 3, 
                this.spr.frame % 2 == 0 ? WAIT_SPEED : BASE_ANIM_SPEED, 
                ev.step);
        }
        else {

            this.spr.setFrame(2, this.spr.row);
        }
	}
	
	
	wallCollisionEvent(x, y, h, dir, ev) {

		this.dir = -dir;
	}


	enemyCollisionEvent(e) {

		if ((this.speed.x > 0 && e.pos.x > this.pos.x) ||
			(this.speed.x < 0 && e.pos.x < this.pos.x )) {

			this.dir *= -1;
			this.speed.x *= -1;
		}
	}


	playerEvent(pl, ev) {

		const MARGIN = 8;

		this.canFall = pl.pos.y > this.pos.y+MARGIN &&
			(this.pos.x - pl.pos.x) * this.dir < 0;
	}
}


const BUNNY_JUMP_TIME_BASE = 60;


export class Bunny extends Enemy {
	
	
	constructor(x, y) {
		
		super(x, y, 2, 3, 2);

		this.center.y = 2;
		this.collisionBox = new Vector2(4, 10);
        // this.hitbox = new Vector2(8, 8);
		this.renderOffset.y = 0;
        
        this.friction.x = 0.05;
		this.friction.y = 0.1;

		this.mass = 0.5;
		
		this.jumpTimer = BUNNY_JUMP_TIME_BASE + 
            (((x / 16) | 0) % 2) * (BUNNY_JUMP_TIME_BASE/2);

        this.targetDir = 1 - 2 * (((x / 16) | 0) % 2);

        this.bounceX = -1;
	}


	init(x, y) {

		const BASE_GRAVITY = 4.0;

		this.target.y = BASE_GRAVITY;
	}


	updateAI(ev) {
		
        const JUMP_HEIGHT = -2.5;
        const FORWARD_SPEED = 0.5;
		
		if (this.canJump) {

            this.target.x = 0;

			if ((this.jumpTimer -= ev.step) <= 0) {

				this.jumpTimer += BUNNY_JUMP_TIME_BASE;
                this.speed.y = JUMP_HEIGHT;
                
                this.target.x = this.targetDir * FORWARD_SPEED;
                this.speed.x = this.target.x;

                this.dir = this.targetDir;

                // Sound effect
                ev.audio.playSample(ev.assets.samples["jump2"], 0.50);
			}
        }
        else {

            // Just in case
            this.dir = this.speed.x >= 0 ? 1 : -1;
        }
	}
	
	
	animate(ev) {
		
		const EPS = 0.5;

		this.flip = this.dir > 0 ? Flip.Horizontal : Flip.None;

		let frame = 0;

		if (Math.abs(this.speed.y) > EPS)
			frame = this.speed.y < 0 ? 1 : 2;

		this.spr.setFrame(frame, this.spr.row);
	}


	playerEvent(pl, ev) {

        this.targetDir = pl.pos.x > this.pos.x ? 1 : -1;
        
        if (pl.isSwordActive() || pl.isBoomerangGoingForward()) {

            this.targetDir *= -1;
        }
    }
    

    wallCollisionEvent(x, y, h, dir, ev) {

		this.dir = -dir;
	}
	

	enemyCollisionEvent(e) {

		if ((this.speed.x > 0 && e.pos.x > this.pos.x) ||
			(this.speed.x < 0 && e.pos.x < this.pos.x )) {

			this.speed.x *= -1;
			this.dir *= -1;
		}
	}

}


const SAND_EGG_WAIT = 60;
const FIBONACCI_MAX_ITER = 20;


export class SandEgg extends Enemy {
	
	
	constructor(x, y) {
		
		super(x, y, 4, 3, 2);
		
		this.friction.x = 0.05;
		
		this.oldCanJump = true;
		
		this.center.y = 2;
		this.collisionBox = new Vector2(4, 12);
        // this.hitbox = new Vector2(8, 8);
        this.renderOffset.y = 1;

		this.mass = 0.75;
		
		this.waitTimer = SAND_EGG_WAIT;
		this.waiting = true;

		// Use Fibonacci sequence to determine
		// direction in a pseudo-random way
		this.fprev = 0;
		this.fcurrent = 1;
		this.fibCount = 0;
	}
	
	
	init(x, y) {
		
		const BASE_GRAVITY = 3.0;
		
		this.dir = 1 - 2 * (((x / 16) | 0) % 2);
		this.flip = this.dir > 0 ? Flip.Horizontal : Flip.None;
		
		this.target.y = BASE_GRAVITY;

		this.waitTimer = SAND_EGG_WAIT;
		this.waiting = true;
	}
	
	
	updateAI(ev) {

		const BASE_SPEED = 0.5;

		let prev = this.fcurrent;

		if ((this.waitTimer -= ev.step) <= 0) {

			this.waitTimer += SAND_EGG_WAIT;
			if (this.waiting) {

				this.fcurrent += this.fprev;
				this.fprev = prev;

				// TO make sure fcurrent does not get too big
				if ((++ this.fibCount) >= FIBONACCI_MAX_ITER) {

					this.fibCount = 0;
					this.fcurrent = 1;
					this.fprev = 0;
				}

				this.dir = 1 - 2 * (this.fcurrent % 2);

				this.waitTimer += ((this.pos.x | 0)) % SAND_EGG_WAIT;
			}

			this.waiting = !this.waiting;
		}

		if (this.waiting) {

			this.target.x = 0;
		}
		else {

			this.target.x = BASE_SPEED * this.dir;
		}
	}
	
	
	animate(ev) {
		
		const WALK_ANIM_SPEED = 8.0;
		
		this.flip = this.dir > 0 ? Flip.Horizontal : Flip.None;
		
		if (this.canJump) {
			
			if (this.waiting)
				this.spr.setFrame(0, this.spr.row);
			else
				this.spr.animate(this.spr.row, 0, 3, WALK_ANIM_SPEED, ev.step);
		}
		else {

			this.spr.setFrame(4, this.spr.row);
		}
	}
	
	
	wallCollisionEvent(x, y, h, dir, ev) {
		
		if (!this.waiting)
			this.dir *= -1;
	}


	enemyCollisionEvent(e) {

		if ((this.speed.x > 0 && e.pos.x > this.pos.x) ||
			(this.speed.x < 0 && e.pos.x < this.pos.x )) {

			this.dir *= -1;
			this.speed.x *= -1;
		}
	}
}


const FLY_WAIT_TIME = 30;
const FLY_MOVE_TIME = 60;
const FLY_MOVE_SPEED = 0.5;


export class Fly extends Enemy {
	
	
	constructor(x, y) {
		
		super(x, y, 5, 2, 1);
		
		this.friction.x = 0.015;
		this.friction.y = 0.015;
		
		this.collisionBox = new Vector2(4, 4);
        // this.hitbox = new Vector2(8, 8);

		this.mass = 0.33;
		
		this.waitTimer = FLY_WAIT_TIME;
		this.waiting = true;

		this.moveDir = new Vector2(0, 0);

		this.bounceX = 1.0;
		this.bounceY = 1.0;
	}
	
	
	init(x, y) {

		// ...
	}
	
	
	updateAI(ev) {

		if ((this.waitTimer -=  ev.step) <= 0.0) {

			this.waitTimer += (this.waiting ? FLY_MOVE_TIME : FLY_WAIT_TIME);

			if (this.waiting) {

				this.speed.x = this.moveDir.x * FLY_MOVE_SPEED;
				this.speed.y = this.moveDir.y * FLY_MOVE_SPEED;
			}
			else {

				this.target.zeros();
			}
			this.waiting = !this.waiting;
		}

		// We need to call this here in the case of the player
		// "bounces"
		if (!this.waiting) {

			this.target = this.speed.clone();
		}
	}
	
	
	animate(ev) {
		
		const FLAP_SPEED_NORMAL = 5;
		const FLAP_SPEED_MOVE = 3;

		this.spr.animate(this.spr.row, 0, 3,
			this.waiting ? FLAP_SPEED_NORMAL : FLAP_SPEED_MOVE,
			ev.step);
	}


	playerEvent(pl, ev) {

		if (!this.waiting) return;

		this.moveDir = (new Vector2(pl.pos.x - this.pos.x, pl.pos.y - this.pos.y))
			.normalize(true);
	}


	enemyCollisionEvent(e) {

		if (this.waiting) return;

		let dir = 
			new Vector2(this.pos.x - e.pos.x, this.pos.y - e.pos.y)
			.normalize(true);

		this.speed.x = dir.x * FLY_MOVE_SPEED;
	}

}


const BAT_ACTIVATION_TIME = 30;


export class Bat extends Enemy {
	
	
	constructor(x, y) {
		
		super(x, y, 6, 3, 2);
		
		this.friction.x = 0.033;
		this.friction.y = 0.033;
		
		this.collisionBox = new Vector2(6, 6);
        // this.hitbox = new Vector2(8, 8);

		this.mass = 0.5;

		this.moveDir = new Vector2(0, 0);

		this.active = false;
		this.activationTime = 0;
	}
	
	
	init(x, y) {

		this.pos.y -= 4;

		this.active = false;
		this.activationTime = 0;
	}
	
	
	updateAI(ev) {

		const MOVE_SPEED = 0.33;

		if (this.active) {

			if (this.activationTime > 0) {

				this.activationTime -= ev.step;
			}
			else {

				this.target.x = this.moveDir.x * MOVE_SPEED;
				this.target.y = this.moveDir.y * MOVE_SPEED;
			}
		}
	}
	
	
	animate(ev) {
		
		const FLAP_SPEED = 6;

		if (!this.active) {

			this.spr.setFrame(0, this.spr.row);
		}
		else if (this.activationTime > 0) {

			this.spr.setFrame(1, this.spr.row);
		}
		else {

			this.spr.animate(this.spr.row, 1, 4,
				FLAP_SPEED,
				ev.step);
		}

		this.flip = this.activationTime > 0 ? Flip.Vertical : Flip.None;
	}


	playerEvent(pl, ev) {

		const DELTA = 48;
		const DROP_SPEED = 1.0;

		if (!this.active) {

			this.active = this.hurtTimer > 0 ||
				(pl.pos.y > this.pos.y &&
				Math.abs(pl.pos.x - this.pos.x) < DELTA);
			if (this.active) {

				this.activationTime = BAT_ACTIVATION_TIME;
				this.target.y = DROP_SPEED;
			}
		}
		else {

			this.moveDir = (
					new Vector2(pl.pos.x - this.pos.x, 
							pl.pos.y - this.pos.y))
				.normalize(true);
		}
	}

}


class WaveEnemy extends Enemy {


	constructor(x, y, row, health, dmg, amplitude, waveSpeed, baseSpeed) {
		
		super(x, y, row, health, dmg);
		
		this.friction.x = 0.025;

		this.collisionBox = new Vector2(8, 8);
        this.hitbox = new Vector2(10, 8);

		this.mass = 0.5;
		
		this.waveTimer = 0.0;

		this.amplitude = amplitude;
		this.waveSpeed = waveSpeed;

		this.baseSpeed = baseSpeed;
	}


	init(x, y) {
		
		this.dir = 1 - 2 * (((x / 16) | 0) % 2);
		this.flip = this.dir > 0 ? Flip.Horizontal : Flip.None;
		
		this.waveTimer = (this.pos.x + this.pos.y) % (Math.PI*2);
	}
	

	updateAI(ev) {

		this.target.x = this.baseSpeed * this.dir;
		
		this.waveTimer = (this.waveTimer + this.waveSpeed*ev.step) % (Math.PI * 2);

		this.pos.y = this.startPos.y + 
			Math.round(Math.sin(this.waveTimer) * this.amplitude);
	}


	wallCollisionEvent(x, y, h, dir, ev) {
		
		this.speed.x *= -1;
		this.target.x *= -1;
		
		this.dir *= -1;
	}


	enemyCollisionEvent(e) {

		if ((this.speed.x > 0 && e.pos.x > this.pos.x) ||
			(this.speed.x < 0 && e.pos.x < this.pos.x )) {

			this.dir *= -1;
			this.speed.x *= -1;
			this.target.x *= -1;
		}
	}
}


export class Fish extends WaveEnemy {
	
	
	constructor(x, y) {
		
		super(x, y, 7, 3, 2, 2.0, 0.1, 0.125);
	}
	
	animate(ev) {
		
		this.flip = this.dir > 0 ? Flip.Horizontal : Flip.None;

		let frame = 1;
		let s = Math.sin(this.waveTimer);
		if (s < -0.5)
			frame = 0;
		else if (s > 0.5)
			frame = 2;
		
		this.spr.setFrame(frame, this.spr.row);
		
	}
}


const STAR_WAIT_TIME = 60;


export class Star extends Enemy {
	
	
	constructor(x, y) {
		
		super(x, y, 8, 2, 1);

		this.center.y = 2;
		this.collisionBox = new Vector2(4, 12);
        // this.hitbox = new Vector2(8, 8);
		this.renderOffset.y = 1;
		
		this.friction.y = 0.025;

		this.mass = 0.5;
		
		this.waitTimer = 0;
	}


	init(x, y) {

		const BASE_GRAVITY = 2.0;

		this.target.y = BASE_GRAVITY;

		this.waitTimer = STAR_WAIT_TIME - 
			(((x / 16) | 0) % 2) * (STAR_WAIT_TIME/2);
	}


	jump(ev) {

		const JUMP_HEIGHT = -1.0;

		this.speed.y = JUMP_HEIGHT;
                
        // Sound effect
        ev.audio.playSample(ev.assets.samples["jump2"], 0.50);
	}


	updateAI(ev) {
		
		const JUMP_ESP = this.target.y / 3;

		if (this.canJump) {

			if ((this.waitTimer -= ev.step) <= 0) {

				this.jump(ev);
			}
		}
		else if (this.waitTimer <= 0) {

			if (this.speed.y >= JUMP_ESP) {

				this.jump(ev);
			}
		}
	}
	
	
	animate(ev) {
		
		const EPS = 0.25;

		this.flip = this.dir > 0 ? Flip.Horizontal : Flip.None;

		let frame = 0;

		if (Math.abs(this.speed.y) > EPS)
			frame = this.speed.y < 0 ? 1 : 2;

		this.spr.setFrame(frame, this.spr.row);
	}


	ceilingCollisionEvent(x, y, w, ev) {

		this.waitTimer = STAR_WAIT_TIME;
	}
}


const SIMPLE_SHOOTER_SHOOT_TIME = 60;


export class SimpleShooter extends Enemy {
	
	
	constructor(x, y, row, health, dmg) {
		
		super(x, y, row, health, dmg);

		this.center.y = 2;
		this.collisionBox = new Vector2(4, 12);
        // this.hitbox = new Vector2(8, 8);
		this.renderOffset.y = 1;

		this.mass = 0.5;

		this.shooting = false;
		this.shootTimer = SIMPLE_SHOOTER_SHOOT_TIME - 
			(((x / 16) | 0) % 2) * (SIMPLE_SHOOTER_SHOOT_TIME/2);

		this.returnAnim = false;
	}


	init(x, y) {

		const BASE_GRAVITY = 2.0;

		this.target.y = BASE_GRAVITY;
	}


	shootEvent(ev) {}


	updateAI(ev) {
		
		if (!this.shooting) {

			if ((this.shootTimer -= ev.step) <= 0) {

				this.spr.setFrame(1, this.spr.row);
				this.shooting = true;

				this.shootTimer = SIMPLE_SHOOTER_SHOOT_TIME;

				this.shootEvent(ev);
			}
		}
	}
	
	
	animate(ev) {
		
		this.flip = this.dir > 0 ? Flip.Horizontal : Flip.None;

		if (!this.shooting) {

			if (this.spr.frame != 0) {

				this.spr.animate(this.spr.row, 1, 0, 6, ev.step);
			}
			else {

				// Unnecessary step?
				this.spr.setFrame(0, this.spr.row);
			}
		}
		else {

			this.spr.animate(this.spr.row, 1, 3, 
				this.spr.frame == 1 ? 6 : 30,
				ev.step);
			if (this.spr.frame == 3) {
				
				this.spr.setFrame(this.returnAnim ? 1 : 0, 
						this.spr.row);
				this.shooting = false;
			}
		}
	}


	playerEvent(pl, ev) {

		this.dir = pl.pos.x > this.pos.x ? 1 : -1;
	}

}


export class Snowman extends SimpleShooter {
	
	
	constructor(x, y) {
		
		super(x, y, 9, 3, 2);
	}


	shootEvent(ev) {

		const BULLET_SPEED = 2.0;

		this.bulletCb(this.pos.x + this.dir*4, this.pos.y, 
			this.dir*BULLET_SPEED, 0, 0, false, 1);

		// Sound effect
		ev.audio.playSample(ev.assets.samples["snowball"], 0.50);
	}
}


export class Apple extends WaveEnemy {
	
	
	constructor(x, y) {
		
		super(x, y, 10, 3, 2, 4.0, 0.10, 0.33);

		this.friction.x = 0.025;
		this.mass = 0.5;
	}
	
	
	animate(ev) {
		
		const ANIM_SPEED = 4;

		this.flip = this.dir > 0 ? Flip.Horizontal : Flip.None;

		this.spr.animate(this.spr.row, 0, 3, ANIM_SPEED, ev.step);
	}
}


export class Rock extends Enemy {
	
	
	constructor(x, y) {
		
		super(x, y, 11, 6, 3);
		
		this.friction.x = 0.025;
		
		this.oldCanJump = true;
		
		this.center.y = 2;
		this.collisionBox = new Vector2(4, 12);
        // this.hitbox = new Vector2(8, 8);
        this.renderOffset.y = 1;

		this.mass = 0.33;

		this.jumpUp = false;
		this.playerAbove = false;
		this.plDif = 0.0;
		this.couldJump = false;
	}
	
	
	init(x, y) {
		
		const BASE_GRAVITY = 4.0;
		
		this.dir = 1 - 2 * (((x / 16) | 0) % 2);
		this.flip = this.dir > 0 ? Flip.Horizontal : Flip.None;
		
		this.target.y = BASE_GRAVITY;
	}
	

	jump(height, ev) {

		if (!this.couldJump) return;

        this.speed.y = height;
                
        // Sound effect
        ev.audio.playSample(ev.assets.samples["jump2"], 0.50);
	}

	
	updateAI(ev) {

		const BASE_SPEED = 0.33;

		this.target.x = BASE_SPEED * this.dir;

		if (!this.canJump && this.couldJump &&
			this.speed.x / this.dir > 0 &&
			this.playerAbove) {

			this.jump(-2.5, ev);
		}
		this.couldJump = this.canJump;

		if (this.canJump && this.jumpUp) {

			this.jump(-clamp(this.plDif / 16, 1.75, 2.75), ev);
		}
	}
	
	
	animate(ev) {
		
		const WALK_ANIM_SPEED = 8.0;
		const EPS = 0.5;
		
		this.flip = this.dir > 0 ? Flip.Horizontal : Flip.None;
		
		let frame = 5;

		if (this.canJump) {

			this.spr.animate(this.spr.row, 0, 3, WALK_ANIM_SPEED, ev.step);
		}
		else {

			if (this.speed.y < -EPS) 
				frame = 4;
			else if (this.speed.y > EPS)
				frame = 6;

			this.spr.setFrame(frame, this.spr.row);
		}
	}
	
	
	wallCollisionEvent(x, y, h, dir, ev) {
		
		const JUMP_HEIGHT = -2.75;

		if (this.dir == dir)
			this.jump(JUMP_HEIGHT, ev);
	}


	playerEvent(pl, ev) {

		const DELTA_MIN = 24;
		const DELTA_MAX = 48;

		this.playerAbove = pl.pos.y < this.pos.y;

		this.jumpUp = 
			this.pos.y - pl.pos.y < DELTA_MAX &&
			this.pos.y - pl.pos.y > DELTA_MIN &&
			pl.canJump;

		this.dir = pl.pos.x > this.pos.x ? 1 : -1;
		this.plDif = Math.abs(pl.pos.y - this.pos.y);
	}
}


export class Plant extends SimpleShooter {
	
	
	constructor(x, y) {
		
		super(x, y, 12, 3, 2);

		this.returnAnim = true;
		
		this.plDist = 0;
	}


	shootEvent(ev) {

		this.bulletCb(this.pos.x + this.dir*2, this.pos.y-4, 
			this.plDist / 80, 
			-2.0, 1, true, 1);

		// Sound effect
		ev.audio.playSample(ev.assets.samples["snowball"], 0.50);
	}


	playerEvent(pl, ev) {

		this.dir = pl.pos.x > this.pos.x ? 1 : -1;
		this.plDist = pl.pos.x - this.pos.x;
	}
}


export class Block extends Enemy {
	
	
	constructor(x, y) {
		
		super(x, y, 13, 6, 3);

		this.friction.y = 0.1;
		
		this.collisionBox = new Vector2(16, 14);
		this.renderOffset.y = 2;
		this.hitbox = new Vector2(12, 12);
		
		this.center.y = 2;

		this.mass = 0.5;

		this.falling = false;
		this.returning = false;
		this.thwompTimer = 0;

		this.shakeStarted = true;

		this.isStatic = true;

		this.startPos.y -= 2;
		this.pos.y -= 1;
	}
	
	
	init(x, y) {

		this.pos.y -= 1;

		this.falling = false;
		this.returning = false;
		this.thwompTimer = 0;

		this.shakeStarted = true;
	}
	
	
	updateAI(ev) {

		const RETURN_SPEED = -0.5;

		if (this.thwompTimer > 0) {

			if ((this.thwompTimer -= ev.step) <= 0) {

				this.returning = true;
			}
		}

		if (this.returning) {

			this.target.y = RETURN_SPEED;
			this.speed.y = RETURN_SPEED;
		
			if (this.pos.y < this.startPos.y) {

				this.pos.y = this.startPos.y;
				this.returning = false;

				this.stopMovement();
			}
		}
	}
	
	
	animate(ev) {
		
		let frame = 0;

		if (this.falling)
			frame = 1;
		else if (this.thwompTimer > 0)
			frame = 2;
		else if (this.returning)
			frame = 3;

		this.spr.setFrame(frame, this.spr.row);
	}


	isReady() {

		return this.thwompTimer <= 0 && 
			!this.falling && 
			!this.returning;
	}


	playerEvent(pl, ev) {

		const FALL_GRAVITY = 6.0;
		const DELTA = 24;
		
		if (this.isReady() &&
			pl.pos.y > this.pos.y &&	
			Math.abs(pl.pos.x - this.pos.x) < DELTA) {

			this.falling = true;
			this.target.y = FALL_GRAVITY;
		}
	}


	floorCollisionEvent(x, y, w, ev) {

		const THWOMP_TIME = 60;

		if (this.falling) {

			this.thwompTimer = THWOMP_TIME;
			this.falling = false;

			this.shakeStarted = false;

			// Sound effect
			ev.audio.playSample(ev.assets.samples["quake"], 0.40);
		}
	}


	ceilingCollisionEvent(x, y, w, ev) {

		if (this.returning) {

			this.pos.y = this.startPos.y;
			this.stopMovement();

			this.returning = false;
		}
	}


	preDraw(c) {

		if (!this.shakeStarted) {

			c.shake(this.thwompTimer, 3, 3);

			this.shakeStarted = true;
		}
	}

}


const MAN_EATER_BASE_SPEED = 0.5;


export class ManEater extends Enemy {
	
	
	constructor(x, y) {
		
		super(x, y, 14, 5, 3);

		this.center.y = 2;
		this.collisionBox = new Vector2(4, 10);
        // this.hitbox = new Vector2(8, 8);
		this.renderOffset.y = 0;
        
        this.friction.x = 0.025;
		this.friction.y = 0.1;

		this.mass = 0.5;

        this.dir = 1 - 2 * (((x / 16) | 0) % 2);

		this.bounceX = -1;
		this.bounceY = -1;
	}


	init(x, y) {

		const BASE_GRAVITY = 4.0;

		this.dir = 1 - 2 * (((x / 16) | 0) % 2);

		this.target.x = this.dir * MAN_EATER_BASE_SPEED;
		this.speed.x = this.target.x;

		this.target.y = BASE_GRAVITY;
	}


	updateAI(ev) {


        this.target.x = MAN_EATER_BASE_SPEED * this.dir;
	}
	
	
	animate(ev) {
		
		const ANIM_SPEED = 6;

		this.spr.animate(this.spr.row, 0, 3, ANIM_SPEED, ev.step);
	
		this.flip = this.dir < 0 ? Flip.None : Flip.Horizontal;
	}


    wallCollisionEvent(x, y, h, dir, ev) {

		this.dir = -dir;
		this.speed.x *= -1;
		this.target.x = this.speed.x;
	}

	
	floorCollisionEvent(x, y, w, ev) {

		const JUMP_HEIGHT = -2.25;

		this.speed.y = JUMP_HEIGHT;

        // Sound effect
        ev.audio.playSample(ev.assets.samples["jump2"], 0.50);
	}


	enemyCollisionEvent(e) {

		if ((this.speed.x > 0 && e.pos.x > this.pos.x) ||
			(this.speed.x < 0 && e.pos.x < this.pos.x )) {

			this.target.x *= -1;
			this.speed.x *= -1;

			this.dir *= -1;
		}
	}

}


export class Spook extends Enemy {
	
	
	constructor(x, y) {
		
		super(x, y, 15, 3, 2);
		
		this.friction.x = 0.015;
		this.friction.y = 0.033;
		
		this.collisionBox = new Vector2(6, 6);
        // this.hitbox = new Vector2(8, 8);

		this.mass = 0.5;

		this.moveDir = new Vector2(0, 0);

		this.waveTimer = 0;
	}
	
	
	init(x, y) {

		this.waveTimer = Math.random() * Math.PI * 2;

		this.disableCollisions = true;
	}
	
	
	updateAI(ev) {

		const MOVE_SPEED = 0.33;
		const WAVE_SPEED = 0.05;
		const AMPLITUDE = 1.5;

		this.waveTimer = (this.waveTimer + WAVE_SPEED * ev.step) % (Math.PI*2);

		this.target.x = this.moveDir.x * MOVE_SPEED;
		this.target.y = (this.moveDir.y + AMPLITUDE * Math.sin(this.waveTimer)) 
						* MOVE_SPEED;
		
	}
	
	
	animate(ev) {
		
		const EPS = 0.125;

		let frame = 1;
		if (this.speed.y < -EPS)
			frame = 0;
		else if (this.speed.y > EPS)
			frame = 2;

		this.spr.setFrame(frame, this.spr.row);

		this.flip = this.target.x > 0 ? Flip.Horizontal : Flip.None;
	}


	playerEvent(pl, ev) {

		this.moveDir = (
			new Vector2(pl.pos.x - this.pos.x, 
				pl.pos.y - this.pos.y))
			.normalize(true);
		
	}
}


const BAT_SHOOT_TIME = 120;


export class Imp extends Enemy {
	
	
	constructor(x, y) {
		
		super(x, y, 16, 3, 2);

		this.friction.y = 0.05;
		
		this.collisionBox = new Vector2(6, 6);
        // this.hitbox = new Vector2(8, 8);

		this.mass = 0.5;

		this.moveDir = 0;

		this.waveTimer = 0;

		this.takeExtraCollisions = true;
		this.bounceY = -1;

		this.shootTimer = 0;
		this.waitTimer = 0;
		this.horizontalWaveTimer = 0;

		this.shootDir = new Vector2(0, 0);
	}
	
	
	init(x, y) {

		this.waveTimer = Math.random() * Math.PI * 2;
		this.waitTimer = 0;

		this.moveDir = (((y / 16) | 0)  % 2) == 0 ? 1 : -1;
		this.horizontalWaveTimer = 0.0;

		this.shootTimer = BAT_SHOOT_TIME - 
			(((x / 16) | 0) % 2) * (BAT_SHOOT_TIME/2);
	}


	shoot(ev) {

		const SHOT_SPEED = 1.0;
		const WAIT_TIME = 30;

		let px = this.pos.x + (this.flip == Flip.None ? -1 : 1) * 4;

		this.bulletCb(
			px, this.pos.y + 2, 
			this.shootDir.x * SHOT_SPEED,
			this.shootDir.y * SHOT_SPEED, 
			2, false, 2);

		// Sound effect
		ev.audio.playSample(ev.assets.samples["snowball"], 0.50);

		this.waitTimer = WAIT_TIME;
		this.stopMovement();
	}
	
	
	updateAI(ev) {

		const MOVE_SPEED = 0.5;
		const WAVE_SPEED = 0.1;
		const AMPLITUDE = 1.0;
		const SHIFT = 0.2;

		const H_WAVE_SPEED = 0.05;
		const H_AMPLITUDE = 4.0;

	
		this.pos.x = this.startPos.x + 
			Math.round(Math.sin(this.horizontalWaveTimer) * H_AMPLITUDE);

		if (this.waitTimer > 0) {

			this.waitTimer -= ev.step;
			return;
		}

		this.horizontalWaveTimer =
			(this.horizontalWaveTimer + H_WAVE_SPEED*ev.step) %
			(Math.PI * 2);
		this.waveTimer = (this.waveTimer + WAVE_SPEED * ev.step) % (Math.PI*2);

		let s = (Math.sin(this.waveTimer) + SHIFT) * AMPLITUDE;
		this.target.y = this.moveDir * s * MOVE_SPEED;

		if ((this.shootTimer -= ev.step) <= 0) {

			this.shoot(ev);
			this.shootTimer += BAT_SHOOT_TIME;
		}
		
	}
	
	
	animate(ev) {
		
		const EPS = 0.25;

		if (this.waitTimer > 0) {

			this.spr.setFrame(3, this.spr.row);
			return;
		}

		let frame = 1;
		if (this.speed.y < -EPS)
			frame = 0;
		else if (this.speed.y > EPS)
			frame = 2;

		this.spr.setFrame(frame, this.spr.row);

		this.flip = this.target.x > 0 ? Flip.Horizontal : Flip.None;
	}


	floorCollisionEvent(x, y, w, ev) {

		this.moveDir = -1;

		this.target.y *= -1;
		this.waveTimer = 0.0;
	}


	ceilingCollisionEvent(x, y, w, ev) {

		this.moveDir = 1;

		this.target.y *= -1;
		this.waveTimer = 0.0;
	}


	playerEvent(pl, ev) {

		this.flip = pl.pos.x < this.pos.x ? Flip.None : Flip.Horizontal;

		this.shootDir = (new Vector2(
				pl.pos.x - this.pos.x, 
				pl.pos.y - this.pos.y))
				.normalize(true);
	}
}


export class Bomb extends Enemy {
	
	
	constructor(x, y) {
		
		super(x, y, 17, 1, 3);
		
		this.friction.x = 0.025;

		this.center.y = 2;
		this.collisionBox = new Vector2(4, 12);
        // this.hitbox = new Vector2(8, 8);
        this.renderOffset.y = 1;

		this.mass = 0.33;
	}
	
	
	init(x, y) {
		
		const BASE_GRAVITY = 4.0;
		
		this.dir = 1 - 2 * (((x / 16) | 0) % 2);
		this.flip = this.dir > 0 ? Flip.Horizontal : Flip.None;
		
		this.target.y = BASE_GRAVITY;
	}

	
	updateAI(ev) {

		const BASE_SPEED = 1.0;

		this.target.x = BASE_SPEED * this.dir;
	}
	
	
	animate(ev) {
		
		const WALK_ANIM_SPEED = 6.0;

		this.flip = this.dir > 0 ? Flip.Horizontal : Flip.None;

		if (this.canJump) {

			this.spr.animate(this.spr.row, 0, 3, WALK_ANIM_SPEED, ev.step);
		}
		else {

			this.spr.setFrame(4, this.spr.row);
		}
	}
	

	playerEvent(pl, ev) {

		this.dir = pl.pos.x > this.pos.x ? 1 : -1;
	}


	playerTouchEvent(ev) {

		// Sound effect
        ev.audio.playSample(
			ev.assets.samples["kill"], 0.60);

		this.kill(ev);
	}

	
	deathEvent(ev) {

		const BULLET_SPEED = 2.0;

		let angle = 0;

		for (let i = 0; i < 4; ++ i) {

			angle = Math.PI/4 + i * Math.PI/2;

			this.bulletCb(this.pos.x, this.pos.y + this.center.y,
					Math.cos(angle) * BULLET_SPEED,
					Math.sin(angle) * BULLET_SPEED,
					3, false, 2);
		}
	}
}


const SLIME_DROP_WAIT = 60;


export class SlimeDrop extends Enemy {
	
	
	constructor(x, y) {
		
		super(x, y, 18, 1, 1);

		this.friction.y = 0.1;
		
		this.collisionBox = new Vector2(8, 10);

		this.renderOffset.y = 2;
		this.center.y = 2;

		this.mass = 0.5;

		this.isStatic = true;
		this.invincible = true;

		this.startPos.y -= 4;
		this.pos.y -= 4;

		this.phase = 0;
		this.timer = 0;

		this.ignoreEnemyCollisions = true;
	}
	
	
	init(x, y) {

		this.phase = 0;
		this.timer = SLIME_DROP_WAIT -
			(((x / 16) | 0) % 2) * SLIME_DROP_WAIT / 2.0;

		this.spr.setFrame(8, this.spr.row);
	}
	
	
	updateAI(ev) {

		const GRAVITY = 2.0;

		this.invincible = this.phase != 2;
		this.harmless = this.invincible;
		
		this.target.y = 0;
		if (this.phase == 0) {

			if ((this.timer -= ev.step) <= 0) {

				this.phase = 1;
				this.spr.setFrame(0, this.spr.row);
			}
		}
		else if (this.phase == 2) {

			this.target.y = GRAVITY;
		}
	}
	
	
	animate(ev) {

		const DROP_ANIM_SPEED = 10;
		const DISAPPEAR_SPEED = 6;
		
		if (this.phase == 0) {

			this.spr.setFrame(8, this.spr.row);
		}	
		else if (this.phase == 1) {

			this.spr.animate(this.spr.row, 0, 4, 
				DROP_ANIM_SPEED, ev.step);
			if (this.spr.frame == 4) {

				this.phase = 2;
			}
			
		}
		else if (this.phase == 3) {

			this.spr.animate(this.spr.row, 5, 8, 
				DISAPPEAR_SPEED, ev.step);
			if (this.spr.frame == 8) {

				this.phase = 0;
				this.pos = this.startPos.clone();

				this.timer = SLIME_DROP_WAIT;
			}
		}
	}


	floorCollisionEvent(x, y, w, ev) {

		if (this.phase != 2) return;

		this.phase = 3;
		this.stopMovement();

		// Sound effect
		ev.audio.playSample(ev.assets.samples["blob"], 0.70);
	}

}


const UNDYING_SHOOT_WAIT = 60;
const UNDYING_SHOOT_TIME = 30;


export class Undying extends Enemy {
	
	
	constructor(x, y) {
		
		super(x, y, 19, 6, 3);
		
		this.friction.x = 0.05;
		
		this.oldCanJump = true;
		
		this.center.y = 2;
		this.collisionBox = new Vector2(8, 12);
        // this.hitbox = new Vector2(8, 8);
        this.renderOffset.y = 1;

		this.mass = 0.75;
		
		this.canFall = false;

		this.shootTimer = 0;
		this.shootActive = false;
	}
	
	
	init(x, y) {
		
		const BASE_GRAVITY = 4.0;

		this.shootActive = false;
		this.shootTimer = UNDYING_SHOOT_WAIT -
			(((x / 16) | 0) % 2) * UNDYING_SHOOT_WAIT / 2;
		
		this.dir = 1 - 2 * (((x / 16) | 0) % 2);
		this.flip = this.dir > 0 ? Flip.Horizontal : Flip.None;
		
		this.target.y = BASE_GRAVITY;
	}


	shoot(ev) {

		const SHOT_SPEED = 2.0;

		let px = this.pos.x + this.dir * 8;

		this.bulletCb(
			px, this.pos.y + 2, 
			this.dir * SHOT_SPEED, 0, 
			4, false, 2);

		// Sound effect
		ev.audio.playSample(ev.assets.samples["snowball"], 0.50);
	}
	
	
	updateAI(ev) {
        
        const BASE_SPEED = 0.5;

        this.target.x = this.dir * BASE_SPEED;
        
		if (!this.canFall &&
			this.oldCanJump && !this.canJump &&
            this.hurtTimer <= 0) {
			
			this.dir *= -1;
			this.speed.x *= -1;
			this.target.x *= -1;
			
			this.pos.x += this.speed.x * ev.step;
        }
		this.oldCanJump = this.canJump;
		
		if ((this.shootTimer -= ev.step) <= 0) {

			this.shootActive = !this.shootActive;
			this.shootTimer += (this.shootActive ? 
				UNDYING_SHOOT_TIME : UNDYING_SHOOT_WAIT);

			if (this.shootActive) {

				this.shoot(ev);
			}
		}
		
	}
	
	
	animate(ev) {
		
        const ANIM_SPEED = 8.0;
		
		this.flip = this.dir > 0 ? Flip.Horizontal : Flip.None;
		
		let start = this.shootActive ? 5 : 0;

		if (this.canJump) {
			
            this.spr.animate(this.spr.row, start, start+3, ANIM_SPEED, ev.step);
        }
        else {

            this.spr.setFrame(start+4, this.spr.row);
        }
	}
	
	
	wallCollisionEvent(x, y, h, dir, ev) {

		this.dir = -dir;
	}


	enemyCollisionEvent(e) {

		if ((this.speed.x > 0 && e.pos.x > this.pos.x) ||
			(this.speed.x < 0 && e.pos.x < this.pos.x )) {

			this.dir *= -1;
			this.speed.x *= -1;
		}
	}


	playerEvent(pl, ev) {

		const MARGIN = 8;

		this.canFall = pl.pos.y > this.pos.y+MARGIN &&
			(this.pos.x - pl.pos.x) * this.dir < 0;
	}
}


const CRYSTAL_SHOOT_TIME = 120;


export class Crystal extends Enemy {
	
	
	constructor(x, y) {
		
		super(x, y, 20, 6, 3);
		
		this.friction.x = 0.025;
		this.friction.y = 0.025;
		
		this.collisionBox = new Vector2(6, 6);
        // this.hitbox = new Vector2(8, 8);

		this.mass = 0.66;

		this.angleDif = 0.0;
		this.moveDir = new Vector2(0, 0);
		this.shootDir = new Vector2(0, 0);

		this.shootTimer = 0;
		this.waitTimer = 0;

		this.oldFrame = 0;

		this.takeExtraCollisions = true;
	}

	
	init(x, y) {

		this.angleDif = (this.pos.y) % (Math.PI * 2);

		this.disableCollisions = true;

		this.shootTimer = CRYSTAL_SHOOT_TIME -
			(((x / 16) | 0) % 2) * CRYSTAL_SHOOT_TIME / 2;
	}
	

	shoot(ev) {

		const WAIT_TIME = 30;
		const SHOT_SPEED = 1.5;

		this.bulletCb(
			this.pos.x, this.pos.y, 
			this.shootDir.x * SHOT_SPEED,
			this.shootDir.y * SHOT_SPEED, 
			3, false, 2);

		// Sound effect
		ev.audio.playSample(ev.assets.samples["snowball"], 0.50);

		this.waitTimer = WAIT_TIME;

		this.oldFrame = this.spr.frame;
		this.spr.setFrame(this.spr.frame + 5, this.spr.row);

		this.stopMovement();
	}
	
	
	updateAI(ev) {

		const MOVE_SPEED = 0.75;
		const ANGLE_DIF_SPEED = 0.025;

		if (this.waitTimer > 0) {

			this.waitTimer -= ev.step;
			return;
		}

		this.target.x = this.moveDir.x * MOVE_SPEED;
		this.target.y = this.moveDir.y * MOVE_SPEED;

		this.angleDif = (this.angleDif + ANGLE_DIF_SPEED * ev.step) % 
			(Math.PI * 2);

		if ( (this.shootTimer -= ev.step) <= 0) {

			this.shoot(ev);
			this.shootTimer += CRYSTAL_SHOOT_TIME;
		}
	}
	
	
	animate(ev) {
		
		const ANIM_SPEED = 5;

		if (this.waitTimer > 0) {

			this.spr.setFrame(
				this.oldFrame + 5*(Math.floor(this.waitTimer/8) % 2), 
				this.spr.row);

			return;
		} 

		this.spr.animate(this.spr.row, 0, 4, ANIM_SPEED, ev.step);

		this.flip = this.target.x > 0 ? Flip.Horizontal : Flip.None;
	}


	playerEvent(pl, ev) {

		const ORBIT_RADIUS = 32.0;

		let px = pl.pos.x + Math.cos(this.angleDif) * ORBIT_RADIUS;
		let py = pl.pos.y + Math.sin(this.angleDif) * ORBIT_RADIUS;

		this.moveDir = (new Vector2(
				px - this.pos.x, 
				py - this.pos.y))
			.normalize(true);

		this.shootDir = (new Vector2(
				pl.pos.x - this.pos.x, 
				pl.pos.y - this.pos.y))
			.normalize(true);
		
	}
}
