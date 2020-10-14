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

    const TYPES = [Turtle, Fungus, Bunny, Caterpillar];
    
    return TYPES[clamp(index, 0, TYPES.length-1) | 0];
}


export class Turtle extends Enemy {
	
	
	constructor(x, y) {
		
		super(x, y, 0, 2, 1);
		
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
		
		this.jumpTimer = FUNGUS_JUMP_TIME_BASE + 
			(((x / 16) | 0) % 2) * (FUNGUS_JUMP_TIME_BASE/2);
	}


	init(x, y) {

		const BASE_GRAVITY = 2.0;

		this.target.y = BASE_GRAVITY;
	}


	updateAI(ev) {
		
		const JUMP_HEIGHT = -1.75;
		
		if (this.canJump) {

			if ((this.jumpTimer -= ev.step) <= 0) {

				this.jumpTimer += FUNGUS_JUMP_TIME_BASE;
				this.speed.y = JUMP_HEIGHT;
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
}


export class Bunny extends Enemy {
	
	
	constructor(x, y) {
		
		super(x, y, 2, 2, 1);

		this.center.y = 2;
		this.collisionBox = new Vector2(4, 10);
        // this.hitbox = new Vector2(8, 8);
		this.renderOffset.y = 0;
        
        this.friction.x = 0.05;
		this.friction.y = 0.1;

		this.mass = 0.5;
		
		this.jumpTimer = FUNGUS_JUMP_TIME_BASE + 
            (((x / 16) | 0) % 2) * (FUNGUS_JUMP_TIME_BASE/2);

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

				this.jumpTimer += FUNGUS_JUMP_TIME_BASE;
                this.speed.y = JUMP_HEIGHT;
                
                this.target.x = this.targetDir * FORWARD_SPEED;
                this.speed.x = this.target.x;

                this.dir = this.targetDir;
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
