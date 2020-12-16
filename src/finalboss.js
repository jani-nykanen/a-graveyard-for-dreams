/**
 * A Graveyard for Fools
 * 
 * (c) 2020 Jani Nykänen
 */

import { ROOM_HEIGHT, ROOM_WIDTH } from "./camera.js";
import { Flip } from "./core/canvas.js";
import { Sprite } from "./core/sprite.js";
import { TransitionType } from "./core/transition.js";
import { negMod } from "./core/util.js";
import { RGB, Vector2 } from "./core/vector.js";
import { Ending } from "./ending.js";
import { Enemy } from "./enemy.js";


const BOSS_HEALTH = 64;
const DISAPPEAR_TIME = 180;


const AttackMode = {
    None: -1,
    Other: 0,
    Shoot: 1,
};


const FLAME_TIME = 600;


export class FinalBoss extends Enemy {


    constructor(x, y) {

        super(x, y, -1, BOSS_HEALTH, 4);

        this.spr = new Sprite(64, 32); 
        this.hitbox = new Vector2(32, 16);
        this.collisionBox = new Vector2(56, 30);

        this.isFinalBoss = true;

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

        this.speedMod = 1.0;

        this.flameCb = () => {};
        this.flameTimer = FLAME_TIME;

        this.killEnemiesCb = () => {};
        this.enemiesKilled = false;

        this.starTimer = 0;
        this.starCount = 0;

        // TEMP
        // this.health = 1;
        // this.flameTimer = 0;
    }


    die(ev) {

        const WAIT_TIME = 60;
        const STAR_TARGET = 6;
        const STAR_TIME = 30;

        if (!this.enemiesKilled) {

            ev.audio.stopMusic();

            // Sound effect
		    ev.audio.playSample(ev.assets.samples["error"], 0.70);

            ev.wait(WAIT_TIME);
            this.killEnemiesCb();
            this.enemiesKilled = true;

            return false;
        }

        if ((this.starTimer -= ev.step) <= 0) {

            this.starTimer += STAR_TIME;
            ++ this.starCount;

            if (this.starCount < STAR_TARGET) {

                this.causeQuake = true;
                this.spawnStars(ev);
            }
        }

        if (this.starCount >= STAR_TARGET) {

            // Sound effect
            ev.audio.playSample(ev.assets.samples["destroy"], 0.70);
            
            ev.tr.activate(true, TransitionType.CircleInside, 1.0/120.0,
                (ev) => {
                    
                    ev.changeScene(Ending); 
                    ev.tr.deactivate();

                }, null, new RGB(255, 255, 255));

            ev.tr.setCenter( (this.pos.x % 160) | 0, (this.pos.y % 144) | 0);
        }

        return false;
    }


    init(x, y) {

        this.spr.setFrame(-2, 2);

        this.appearing = true;
        this.disappearing = false;

        this.disappearTimer = DISAPPEAR_TIME;

        this.isStatic = true;
    }


    setFlameGeneratorCallback(cb) { 

        this.flameCb = cb;
    }


    setKillEnemiesCallback(cb) {

        this.killEnemiesCb = cb;
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
				Math.cos(angle) * SHOT_SPEED * this.speedMod,
				Math.sin(angle) * SHOT_SPEED * this.speedMod, 
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
				-Math.cos(angle) * SPEED_X * this.speedMod,
				Math.sin(angle) * SPEED_Y * this.speedMod, 
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
            speed = SHOT_SPEED[negMod(i, 2)] * this.speedMod;

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

        this.speed.x = dir.x * RUSH_SPEED * this.speedMod;
        this.speed.y = dir.y * RUSH_SPEED * this.speedMod;

        this.friction.x = 0.005;
        this.friction.y = 0.005;
        this.isStatic = false;
    }


    stomp(ev) {

        const GRAVITY = 4.0;
        const SPEED = 0.33;

        this.speed.x = Math.sign(this.targetPos.x - this.pos.x) * SPEED * this.speedMod;

        // this.target.x = this.speed.x;
        this.target.y = GRAVITY * this.speedMod;
        
        this.friction.y = 0.125 * this.speedMod;
        this.friction.x = 0;

        this.isStatic = false;
    }


    startFollowing(ev) {

        this.following = true;

        this.friction.x = 0.02 * this.speedMod;
        this.friction.y = 0.02 * this.speedMod;

        this.isStatic = false;
    }


    follow(ev) {

        const FOLLOW_TARGET_SPEED = 1.5;

        let dir = (new Vector2(this.targetPos.x - this.pos.x, 
            this.targetPos.y - this.pos.y))
            .normalize();

        this.target.x = dir.x * FOLLOW_TARGET_SPEED * this.speedMod;
        this.target.y = dir.y * FOLLOW_TARGET_SPEED * this.speedMod;
    }


    otherAttack(ev) {

        ([ev => this.rush(ev),
         ev => this.stomp(ev),
         ev => this.startFollowing(ev)] [this.attackType]) (ev);
    }



    spawnFlame() {

        const BASE_SPEED = 1.0;

        let dir = (this.targetPos.x > (this.cornerX + 80)) ? 1 : -1;

        let x = this.cornerX + (dir > 0 ? -6 : 166);
        let y = 32 + Math.floor(Math.random() * 96);

        let sx = dir * BASE_SPEED;

        this.flameCb(x, y, sx);
    }


    updateAI(ev) {

        const HEALTH_BAR_SPEED = 0.005;

        let targetValue = this.health / this.maxHealth;
        if (this.healthBarValue > targetValue) {

            this.healthBarValue -= HEALTH_BAR_SPEED * ev.step;
            if (this.healthBarValue < targetValue)
                this.healthBarValue = targetValue;
        }

        this.speedMod = 1.0 + 0.5 * (1.0 - this.health / this.maxHealth);

        if (!this.initialSoundPlayed) {

            // Sound effect
            ev.audio.playSample(ev.assets.samples["appear"], 0.60);

            this.initialSoundPlayed = true;
        }

        if ((this.flameTimer -= this.speedMod * ev.step) <= 0) {

            this.flameTimer += FLAME_TIME;
            this.spawnFlame();
        }

        this.invincible = this.appearing || this.disappearing;
        this.friendly = this.invincible;

        if (this.disappearing || this.appearing) return;

        if ((this.disappearTimer -= this.speedMod * ev.step) <= 0) {

            this.stopMovement();

            this.disappearing = true;
            this.spr.row = this.spr.frame == 0 ? 1 : 2;

            // Sound effect
            ev.audio.playSample(ev.assets.samples["disappear"], 0.60);
        }
        else if (this.following) {

            this.follow(ev);
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

        if (!this.inCamera || !this.exist || this.dying) return;

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


    spawnStars(ev) {

        const BULLET_SPEED = 2.0;
        const COUNT = 8;

		let angle = 0;

		for (let i = 0; i < COUNT; ++ i) {

			angle = Math.PI * 2 / COUNT * i;

			this.bulletCb(this.pos.x, this.pos.y + this.center.y,
					Math.cos(angle) * BULLET_SPEED,
					Math.sin(angle) * BULLET_SPEED,
					6, false, 0);
        }
        
        // Sound effect
        ev.audio.playSample(ev.assets.samples["hit"], 0.60);
    }
}
