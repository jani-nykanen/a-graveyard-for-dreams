import { nextObject } from "./core/util.js";
import { getEnemyType } from "./enemy.js";
/**
 * The End of Journey
 * 
 * (c) 2020 Jani Nykänen
 */

import { Player } from "./player.js";


export class ObjectManager {


    constructor(progress) {

        this.player = null;
        this.enemies = new Array();

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
                e.playerCollision(this.player, ev);
                
                stage.objectCollision(e, ev);
            }
        }

        if (!cam.moving) {

            this.player.update(ev);
            stage.objectCollision(this.player, ev);
            if (this.player.boomerang.exist) {

                stage.objectCollision(this.player.boomerang, ev);
            }
        }
        this.player.cameraEvent(cam, ev);
    }


    draw(c) {

        for (let e of this.enemies) {

            e.draw(c);
        }

        this.player.draw(c);
    }
}
