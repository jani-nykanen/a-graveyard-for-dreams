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


const BOSS_HEALTH = 64;
const DISAPPEAR_TIME = 180;


const AttackMode = {
    None: -1,
    Other: 0,
    Shoot: 1,
};


export class FinalBoss extends Enemy {


    constructor(x, y) {

        super(x, y, -1, BOSS_HEALTH, 4);

        this.spr = new Sprite(64, 32); 
        this.hitbox = new Vector2(32, 16);
        this.collisionBox = new Vector2(56, 30);

        this.appearing = true;
        this.disappearing = false;
        this.disappearTimer = 0;

        this.bounceX = 1;
        this.bounceY = 1;

        this.cornerX = Math.floor(x / (ROOM_WIDTH*16)) * ROOM_WIDTH * 16;
        this.cornerY = Math.floor(y / (ROOM_HEIGHT*16)) * ROOM_HEIGHT * 16;

        // Mode: what move category to perform
        // Type: what specific move to perform
        this.attackMode = AttackMode.None;
        this.attackType = 0;

        this.targetPos = new Vector2();

        this.friction.x = 0.01;
        this.friction.y = 0.01;
        this.mass = 0.5;

        this.healthBarValue = 1.0;

        this.causeQuake = false;
        this.following = false;

        this.initialSoundPlayed = false;
    }


    init(x, y) {

        this.spr.setFrame(-2, 2);

        this.appearing = true;
        this.disappearing = false;

        this.disappearTimer = DISAPPEAR_TIME;

        this.isStatic = true;
    }


    reappear(ev) {

        let width = (ROOM_WIDTH*16) - this.spr.width;
        let height = (ROOM_HEIGHT*16) - 26 - this.spr.height;

        let x = this.cornerX + this.spr.width/2 + ((Math.random() * width) | 0);
        let y = this.cornerY + 10 + this.spr.height/2 + ((Math.random() * height) | 0);

        this.appearing = true;
        this.disappearing = false;

        this.disappearTimer = DISAPPEAR_TIME;

        this.pos = new Vector2(x, y);

        this.attackMode = Math.random() < 0.5 ? 0 : 1;
        this.attackType = Math.floor(Math.random() * 3);

        this.spr.row = this.attackMode == AttackMode.Shoot ? 1 : 2;

        // Reset friction to default
        this.friction.x = 0.01;
        this.friction.y = 0.01;
        this.isStatic = true;
        this.following = false;

        if (this.attackMode == AttackMode.Other) {

            switch(this.attackType) {

            case 1:
                this.pos.y = this.spr.height/2;
                break;

            default:
                break;
            }
        }
    }


    shootType1(ev) {

        const COUNT = 8;
        const SHOT_SPEED = 0.75;

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
		ev.audio.playSample(ev.assets.samples["snowball"], 0.60);
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
		ev.audio.playSample(ev.assets.samples["snowball"], 0.60);
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
		ev.audio.playSample(ev.assets.samples["snowball"], 0.60);
    }


    shoot(ev) {

        ([ev => this.shootType1(ev),
         ev => this.shootType2(ev),
         ev => this.shootType3(ev)] [this.attackType]) (ev);
    }


    rush(ev) {

        const RUSH_SPEED = 1.5;

        let dir = (new Vector2(this.targetPos.x - this.pos.x, 
                        this.targetPos.y - this.pos.y))
                    .normalize();

        this.speed.x = dir.x * RUSH_SPEED;
        this.speed.y = dir.y * RUSH_SPEED;

        this.friction.x = 0.005;
        this.friction.y = 0.005;
        this.isStatic = false;
    }


    stomp(ev) {

        const GRAVITY = 6.0;
        const SPEED = 0.5;

        this.speed.x = Math.sign(this.targetPos.x - this.pos.x) * SPEED;

        // this.target.x = this.speed.x;
        this.target.y = GRAVITY;
        
        this.friction.y = 0.10;
        this.friction.x = 0;

        this.isStatic = false;
    }


    startFollowing(ev) {

        this.following = true;

        this.friction.x = 0.02;
        this.friction.y = 0.02;

        this.isStatic = false;
    }


    follow(ev) {

        const FOLLOW_TARGET_SPEED = 1.5;

        let dir = (new Vector2(this.targetPos.x - this.pos.x, 
            this.targetPos.y - this.pos.y))
            .normalize();

        this.target.x = dir.x * FOLLOW_TARGET_SPEED;
        this.target.y = dir.y * FOLLOW_TARGET_SPEED;
    }


    otherAttack(ev) {

        ([ev => this.rush(ev),
         ev => this.stomp(ev),
         ev => this.startFollowing(ev)] [this.attackType]) (ev);
    }


    updateAI(ev) {

        const HEALTH_BAR_SPEED = 0.005;

        if (!this.initialSoundPlayed) {

            // Sound effect
            ev.audio.playSample(ev.assets.samples["appear"], 0.60);

            this.initialSoundPlayed = true;
        }

        this.invincible = this.appearing || this.disappearing;
        this.friendly = this.invincible;

        if (this.disappearing || this.appearing) return;

        if ((this.disappearTimer -= ev.step) <= 0) {

            this.stopMovement();

            this.disappearing = true;
            this.spr.row = this.spr.frame == 0 ? 1 : 2;

            // Sound effect
            ev.audio.playSample(ev.assets.samples["disappear"], 0.60);
        }
        else if (this.following) {

            this.follow(ev);
        }

        let targetValue = this.health / this.maxHealth;
        if (this.healthBarValue > targetValue) {

            this.healthBarValue -= HEALTH_BAR_SPEED * ev.step;
            if (this.healthBarValue < targetValue)
                this.healthBarValue = targetValue;
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

                // Sound effect
                ev.audio.playSample(ev.assets.samples["appear"], 0.60);

                return;
            }
        }
        else if (this.appearing) {

            this.spr.animate(this.spr.row, -2, 3, APPEAR_SPEED, ev.step);
            if (this.spr.frame == 3) {

                this.appearing = false;
                this.spr.setFrame(this.spr.row == 1 ? 0 : 3, 0);

                if (this.attackMode == AttackMode.Other) {

                    this.otherAttack(ev);
                }

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

        if (this.causeQuake) {

            c.shake(60, 2, 2);
            this.causeQuake = false;
        }

        if (this.spr.frame < 0 ||
            (this.hurtTimer > 0 && Math.floor(this.hurtTimer/4) % 2 == 0)) return;

        let px = this.pos.x - this.spr.width/2;
        let py = this.pos.y - this.spr.height/2;

        this.spr.draw(c, c.bitmaps["eye"], 
			Math.round(px), Math.round(py), Flip.None);
    }


    postDraw(c) {

        const WIDTH = 64;
        const HEIGHT = 3;
        const Y_OFF = 7;

        if (!this.inCamera || !this.exist) return;

        let t = this.healthBarValue;
        let w = Math.round(WIDTH * t);

        let x = c.width/2 - WIDTH/2;
        let y = c.height - Y_OFF;

        for (let i = 2; i >= 0; -- i) {

            // Because Closure compiler has problems
            // with ...[] syntax
            switch(i) {
            case 2:
                c.setColor(255, 255, 255);
                break;
            case 1:
                c.setColor(0, 0, 0);
                break;
            case 0:
                c.setColor(85, 85, 85);
                break;
            default: 
                break;
            }
            
            c.fillRect(x-i, y-i, WIDTH + i*2, HEIGHT+i*2);

            if (i == 0) {

                c.setColor(170, 0, 0);
                c.fillRect(x, y, w, HEIGHT);

                c.setColor(255, 85, 0);
                c.fillRect(x, y, w, 1);

                if (this.healthBarValue > 0 && this.healthBarValue < 1.0) {

                    c.setColor(0, 0, 0);
                    c.fillRect(x + w, y, 1, HEIGHT);
                }
            }
        }
    }


    playerEvent(pl, ev) {

        this.targetPos = pl.pos.clone();
    }


    floorCollisionEvent(x, y, w, ev) {

        if (this.attackType == 1 && 
            this.attackMode == AttackMode.Other) {

			// Sound effect
            ev.audio.playSample(ev.assets.samples["quake"], 0.40);
            
            this.causeQuake = true;
        }
    }
}
