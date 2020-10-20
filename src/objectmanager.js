
/**
 * The End of Journey
 * 
 * (c) 2020 Jani Nykänen
 */

import { Collectible } from "./collectible.js";
import { clamp, nextObject } from "./core/util.js";
import { getEnemyType } from "./enemytypes.js";
import { FlyingText } from "./flyingtext.js";
import { Player } from "./player.js";


export class ObjectManager {


    constructor(progress) {

        this.player = null;
        this.enemies = new Array();
        this.flyingText = new Array();
        this.collectibles = new Array();

        this.progress = progress;
    }


    parseObjectLayer(data, w, h) {

        const MAX_ENEMY_INDEX = 15;

        let index = 0;
        let tid = 0;
        for (let y = 0; y < h; ++ y) {

            for (let x = 0; x < w; ++ x) {

                tid = data[y * w + x] - 512;
                if (tid <= 0) continue;
                -- tid;

                switch(tid) {

                // Player
                case 0:

                    this.player = new Player(x*16+8, y*16+8, this.progress );
                    break;

                default:
                    break;
                }

                // Enemy
                if (tid >= 1 && tid <= MAX_ENEMY_INDEX) {
                    
                    index = this.enemies.length;
                    for (let i = 0; i < this.enemies.length; ++ i) {

                        if (!this.enemies[i].exist) {

                            index = i;
                            break;
                        }
                    }
                    this.enemies[index] = new (getEnemyType(tid-1).prototype.constructor) (x*16+8, y*16+8);
                    this.enemies[index].init(x*16+8, y*16+8);
                }
            }
        }
    }


    positionCamera(cam) {

        cam.setPosition(
            (this.player.pos.x / 160) | 0, 
            (this.player.pos.y / 144) | 0);
    }


    update(cam, stage, ev) {

        for (let e of this.enemies) {

            e.cameraEvent(cam, ev);
            if (!cam.moving) {

                e.update(ev);
                e.playerCollision(this.player, this, ev);
                
                stage.objectCollision(e, this, ev);
            }
        }

        if (!cam.moving) {

            this.player.update(ev);
            stage.objectCollision(this.player, this, ev);
            if (this.player.boomerang.exist) {

                stage.objectCollision(this.player.boomerang, this, ev);
            }
        }
        this.player.cameraEvent(cam, ev);

        for (let t of this.flyingText) {

            t.update(ev);
        }

        for (let c of this.collectibles) {

            c.cameraEvent(cam, ev);
            c.update(ev);
            c.playerCollision(this.player, this, ev);
            stage.objectCollision(c, this, ev);
        }
    }


    draw(c) {

        for (let e of this.enemies) {

            e.draw(c);
        }

        for (let o of this.collectibles) {

            o.draw(c);
        }

        this.player.draw(c);
    
        for (let t of this.flyingText) {

            t.draw(c);
        }
    }


    spawnDamageText(dmg, x, y) {

        const DEFAULT_SPEED = 1;
        const MOVE_TIME = 16;
        const WAIT_TIME = 30;

        nextObject(this.flyingText, FlyingText)
            .spawn(x, y, DEFAULT_SPEED, MOVE_TIME, WAIT_TIME, "-" + String(dmg));
    }


    // TODO: Merge with the method above
    spawnItemText(count, type, x, y) {

        const DEFAULT_SPEED = 1;
        const MOVE_TIME = 16;
        const WAIT_TIME = 30;

        let str = "+" +  
            String.fromCharCode("A".charCodeAt(0)-1 + clamp(count, 0, 9)) +
            String.fromCharCode("!".charCodeAt(0) + type);

        nextObject(this.flyingText, FlyingText)
            .spawn(x, y, DEFAULT_SPEED, MOVE_TIME, WAIT_TIME, str);
    }


    spawnCollectibles(x, y, srcPos, minAmount, maxAmount) {

        const MAX_SPEED_X = 0.75;
        const MAX_SPEED_Y = 2.0;
        const MAX_SPEED_COMPARE = 16;
        const BASE_SPEED_Y = -1.5;

        let speedX = (x - srcPos.x) / MAX_SPEED_COMPARE * MAX_SPEED_X;
        speedX = clamp(speedX, -MAX_SPEED_X, MAX_SPEED_X);

        let speedY = Math.max(0, y - srcPos.y) / MAX_SPEED_COMPARE * MAX_SPEED_Y;
        speedY = clamp(speedY, -MAX_SPEED_Y, MAX_SPEED_Y);

        let healthProb = 0.25 * (1.0 - this.player.progress.getHealthRatio());

        let id = Math.random() < healthProb ? 1 : 0;
        if (id != 0) {

            minAmount = 1;
            maxAmount = 1;
        }

        nextObject(this.collectibles, Collectible)
            .spawn(x, y, speedX, BASE_SPEED_Y + speedY, id);
    }
}
