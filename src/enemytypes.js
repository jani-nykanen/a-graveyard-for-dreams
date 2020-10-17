/**
 * The End of Journey
 * 
 * (c) 2020 Jani Nykänen
 */


import { Flip } from "./core/canvas.js";
import { clamp } from "./core/util.js";
import { Vector2 } from "./core/vector.js";
import { Enemy } from "./enemy.js";


export function getEnemyType(index) {

    const TYPES = [Turtle, Fungus, Bunny, Caterpillar, SandEgg, Fly, Bat, Fish, Star];
    
    return TYPES[clamp(index, 0, TYPES.length-1) | 0];
}


export class Turtle extends Enemy {
	
	
	constructor(x, y) {
		
		super(x, y, 0, 2, 2);
		
		this.friction.x = 0.025;
		
		this.oldCanJump = true;
		
		this.center.y = 2;
		this.collisionBox = new Vector2(4, 12);
        // this.hitbox = new Vector2(8, 8);
        this.renderOffset.y = 1;

        this.mass = 0.5;
	}
	
	
	init(x, y) {
		
		const BASE_SPEED = 0.25;
		const BASE_GRAVITY = 2.0;
		
		this.dir = 2 - 1 * (((x / 16) | 0) % 2);
		this.flip = this.dir > 0 ? Flip.Horizontal : Flip.None;
		
		this.target.x = BASE_SPEED;
		this.speed.x = this.target.x;
		this.target.y = BASE_GRAVITY;
	}
	
	
	updateAI(ev) {
		
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
}


const FUNGUS_JUMP_TIME_BASE = 60;


export class Fungus extends Enemy {
	
	
	constructor(x, y) {
		
		super(x, y, 1, 1, 1);

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
		
		super(x, y, 3, 1, 1);
		
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
		
		this.dir = 2 - 1 * (((x / 16) | 0) % 2);
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


	playerEvent(pl, ev) {

		const MARGIN = 16;

		this.canFall = pl.pos.y > this.pos.y+MARGIN &&
			(this.pos.x - pl.pos.x) * this.dir < 0;
	}
}


const BUNNY_JUMP_TIME_BASE = 60;


export class Bunny extends Enemy {
	
	
	constructor(x, y) {
		
		super(x, y, 2, 2, 2);

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

}


const SAND_EGG_WAIT = 60;
const FIBONACCI_MAX_ITER = 20;


export class SandEgg extends Enemy {
	
	
	constructor(x, y) {
		
		super(x, y, 4, 2, 2);
		
		this.friction.x = 0.05;
		
		this.oldCanJump = true;
		
		this.center.y = 2;
		this.collisionBox = new Vector2(4, 12);
        // this.hitbox = new Vector2(8, 8);
        this.renderOffset.y = 1;

		this.mass = 0.5;
		
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
		
		this.dir = 2 - 1 * (((x / 16) | 0) % 2);
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
}


const FLY_WAIT_TIME = 30;
const FLY_MOVE_TIME = 60;


export class Fly extends Enemy {
	
	
	constructor(x, y) {
		
		super(x, y, 5, 1, 1);
		
		this.friction.x = 0.015;
		this.friction.y = 0.015;
		
		this.collisionBox = new Vector2(4, 4);
        // this.hitbox = new Vector2(8, 8);

		this.mass = 0.5;
		
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

		const MOVE_SPEED = 0.5;

		if ((this.waitTimer -=  ev.step) <= 0.0) {

			this.waitTimer += (this.waiting ? FLY_MOVE_TIME : FLY_WAIT_TIME);

			if (this.waiting) {

				this.speed.x = this.moveDir.x * MOVE_SPEED;
				this.speed.y = this.moveDir.y * MOVE_SPEED;
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

}


const BAT_ACTIVATION_TIME = 30;


export class Bat extends Enemy {
	
	
	constructor(x, y) {
		
		super(x, y, 6, 2, 2);
		
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


export class Fish extends Enemy {
	
	
	constructor(x, y) {
		
		super(x, y, 7, 2, 2);
		
		this.friction.x = 0.025;

		this.collisionBox = new Vector2(8, 8);
        this.hitbox = new Vector2(10, 8);

		this.mass = 0.5;
		
		this.waveTimer = 0.0;
	}
	
	
	init(x, y) {
		
		const BASE_SPEED = 0.25;
		
		this.dir = 2 - 1 * (((x / 16) | 0) % 2);
		this.flip = this.dir > 0 ? Flip.Horizontal : Flip.None;
		
		this.target.x = BASE_SPEED;
		this.speed.x = this.target.x;

		this.waveTimer = (this.pos.x + this.pos.y) % (Math.PI*2);
	}
	
	
	updateAI(ev) {
		
		const WAVE_SPEED = 0.1;
		const AMPLITUDE = 2.0;

		this.waveTimer = (this.waveTimer + WAVE_SPEED*ev.step) % (Math.PI * 2);

		this.pos.y = this.startPos.y + 
			Math.round(Math.sin(this.waveTimer) * AMPLITUDE);
	}
	
	
	animate(ev) {
		
		const EPS = 0.5;

		this.flip = this.dir > 0 ? Flip.Horizontal : Flip.None;

		let frame = 1;
		let s = Math.sin(this.waveTimer);
		if (s < -0.5)
			frame = 0;
		else if (s > 0.5)
			frame = 2;
		
		this.spr.setFrame(frame, this.spr.row);
		
	}
	
	
	wallCollisionEvent(x, y, h, dir, ev) {
		
		this.speed.x *= -1;
		this.target.x *= -1;
		
		this.dir *= -1;
	}
}


const STAR_WAIT_TIME = 60;


export class Star extends Enemy {
	
	
	constructor(x, y) {
		
		super(x, y, 8, 1, 1);

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
