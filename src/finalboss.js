/**
 * A Graveyard for Fools
 * 
 * (c) 2020 Jani Nykänen
 */

import { ROOM_HEIGHT, ROOM_WIDTH } from "./camera.js";
import { Flip } from "./core/canvas.js";
import { Sprite } from "./core/sprite.js";
import { negMod } from "./core/util.js";
import { Vector2 } from "./core/vector.js";
import { Enemy } from "./enemy.js";


const BOSS_HEALTH = 100;
const DISAPPEAR_TIME = 180;


const AttackMode = {
    Other: 0,
    Shoot: 1,
};


export class FinalBoss extends Enemy {


    constructor(x, y) {

        super(x, y, -1, BOSS_HEALTH, 4);

        this.spr = new Sprite(64, 32); 
        this.hitbox = new Vector2(32, 16);
        this.collisionBox = new Vector2(48, 16);

        this.appearing = true;
        this.disappearing = false;
        this.disappearTimer = 0;

        this.bounceX = 1;
        this.bounceY = 1;

        this.cornerX = Math.floor(x / ROOM_WIDTH) * ROOM_WIDTH;
        this.cornerY = Math.floor(y / ROOM_HEIGHT) * ROOM_HEIGHT;

        // Mode: what move category to perform
        // Type: what specific move to perform
        this.attackMode = 0;
        this.attackType = 0;

        this.targetPos = new Vector2();
    }


    init(x, y) {

        this.spr.setFrame(-2, 2);

        this.appearing = true;
        this.disappearing = false;

        this.disappearTimer = DISAPPEAR_TIME;
    }


    reappear(ev) {

        let width = ROOM_WIDTH - this.spr.width;
        let height = ROOM_HEIGHT - 26 - this.spr.height;

        let x = this.cornerX + this.spr.width/2 + ((Math.random() * width) | 0);
        let y = this.cornerY + 10 + this.spr.height/2 + ((Math.random() * height) | 0);

        this.appearing = true;
        this.disappearing = false;

        this.disappearTimer = DISAPPEAR_TIME;

        this.pos = new Vector2(x, y);

        this.attackMode = Math.random() < 0.5 ? 0 : 1;
        this.attackType = Math.floor(Math.random() * 3);

        this.spr.row = this.attackMode == AttackMode.Shoot ? 1 : 2;
    }


    shootType1(ev) {

        const COUNT = 8;
        const SHOT_SPEED = 0.5;

		let angle = 0;
		for (let i = 0; i < COUNT; ++ i) {

			angle = (Math.PI * 2) / COUNT * i;

			this.bulletCb(
				this.pos.x, this.pos.y, 
				Math.cos(angle) * SHOT_SPEED,
				Math.sin(angle) * SHOT_SPEED, 
				3, false, 3);
		}

		// Sound effect
		ev.audio.playSample(ev.assets.samples["snowball"], 0.50);
    }


    shootType2(ev) {

        const COUNT = 3;
        const ANGLE_STEP = Math.PI / 12.0;
        const SPEED_X = 1.5;
        const SPEED_Y = 2.0;

		let angle = 0;
		for (let i = -COUNT; i <= COUNT; ++ i) {

			angle = ANGLE_STEP * i - Math.PI / 2;

			this.bulletCb(
				this.pos.x, this.pos.y, 
				-Math.cos(angle) * SPEED_X,
				Math.sin(angle) * SPEED_Y, 
				5, true, 3);
		}

		// Sound effect
		ev.audio.playSample(ev.assets.samples["snowball"], 0.50);
    }


    shootType3(ev) {

        const SHOT_SPEED = [0.75, 0.5];
		const ANGLE_STEP = Math.PI/10.0;
        const COUNT = 3;

		let angle = 0;
		let baseAngle = Math.atan2(
            this.targetPos.y - this.pos.y, 
            this.targetPos.x - this.pos.x);
        let speed = 0;

		for (let i = -COUNT; i <= COUNT; ++ i) {

            angle = baseAngle + ANGLE_STEP * i;
            speed = SHOT_SPEED[negMod(i, 2)];

			this.bulletCb(
				this.pos.x, this.pos.y, 
				Math.cos(angle) * speed,
				Math.sin(angle) * speed, 
				7, false, 3);
		}

		// Sound effect
		ev.audio.playSample(ev.assets.samples["snowball"], 0.50);
    }


    shoot(ev) {

        ([ev => this.shootType1(ev),
         ev => this.shootType2(ev),
         ev => this.shootType3(ev)] [this.attackType]) (ev);
    }


    updateAI(ev) {

        this.isStatic = this.appearing || this.disappearing;
        this.invincible = this.isStatic;
        this.friendly = this.isStatic;

        if (this.disappearing || this.appearing) return;

        if ((this.disappearTimer -= ev.step) <= 0) {

            this.disappearing = true;
            this.spr.row = this.spr.frame == 0 ? 1 : 2;
        }
    }


    animate(ev) {

        const APPEAR_SPEED = 8;
        const OPEN_TIME = 6;
        const SHOOT_FRAME = 2;

        let oldFrame = this.spr.frame;

        if (this.disappearing) {

            this.spr.animate(this.spr.row, 3, -2, APPEAR_SPEED, ev.step);
            if (this.spr.frame == -2) {

                this.reappear(ev);
                return;
            }
        }
        else if (this.appearing) {

            this.spr.animate(this.spr.row, -2, 3, APPEAR_SPEED, ev.step);
            if (this.spr.frame == 3) {

                this.appearing = false;
                this.spr.setFrame(this.spr.row == 1 ? 0 : 3, 0);
                return;
            }
        }
        else if (this.attackMode == AttackMode.Shoot) {

            if (this.spr.frame < 3) {

                this.spr.animate(0, 0, 3, OPEN_TIME, ev.step);

                if (this.spr.frame > oldFrame &&
                    this.spr.frame == SHOOT_FRAME &&
                    this.attackMode == AttackMode.Shoot) {

                    this.shoot(ev);
                }
            }
        }
    }


    draw(c, cam) {

        if (this.spr.frame < 0 ||
            (this.hurtTimer > 0 && Math.floor(this.hurtTimer/4) % 2 == 0)) return;

        let px = this.pos.x - this.spr.width/2;
        let py = this.pos.y - this.spr.height/2;

        this.spr.draw(c, c.bitmaps["eye"], 
			Math.round(px), Math.round(py), Flip.None);
    }


    postDraw(c) {

        // TODO: Draw health bar
    }


    playerEvent(pl, ev) {

        this.targetPos = pl.pos.clone();
    }

}
