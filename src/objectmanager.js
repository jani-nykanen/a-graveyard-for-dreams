/**
 * A Graveyard for Fools
 * 
 * (c) 2020 Jani Nykänen
 */


import { Bullet } from "./bullet.js";
import { Chest } from "./chest.js";
import { Collectible } from "./collectible.js";
import { clamp, nextObject } from "./core/util.js";
import { Door } from "./door.js";
import { Flame, getEnemyType } from "./enemytypes.js";
import { FlyingText } from "./flyingtext.js";
import { NightOrb } from "./nightorb.js";
import { NightStar } from "./nightstar.js";
import { NPC } from "./npc.js";
import { Player } from "./player.js";
import { Portal } from "./portal.js";
import { Savepoint } from "./savepoint.js";
import { Shopkeeper } from "./shopkeeper.js";
import { SpecialNPC } from "./specialnpc.js";


export class ObjectManager {


    constructor(progress, shop, message) {

        this.player = null;
        this.enemies = new Array();
        this.flyingText = new Array();
        this.collectibles = new Array();
        this.bullets = new Array();
        this.interactableObjects = new Array();
        this.stars = new Array();

        this.progress = progress;
        this.shop = shop;
        this.message = message;
    }


    linkDoors() {

        for (let o of this.interactableObjects) {

            if (o.isDoor != undefined) {

                for (let p of this.interactableObjects) {

                    if (p.isDoor != undefined && p.id == o.id &&
                        p.inside != o.inside) {

                        p.linkDoor(o);
                        o.linkDoor(p);
                    }
                }
            }
        }
    }


    parseObjectLayer(data, w, h, portalCb, resetCb) {

        const MAX_ENEMY_INDEX = 31;

        let index = 0;
        let tid = 0;
        let id;

        let orbCount = 0;
        let starCount = 0;
        let nightOrb = null;

        let isNight = this.progress.isNight;

        let bulletCb = (x, y, sx, sy, row, takeGravity, dmg) => this.spawnBullet(x, y, sx, sy, row, takeGravity, dmg);

        for (let y = 0; y < h; ++ y) {

            for (let x = 0; x < w; ++ x) {

                tid = data[y * w + x] - 512;
                if (tid <= 0) continue;
                -- tid;

                id = 0;
                if (y > 0)
                    id = Math.max(0, data[(y-1)*w + x] - 512 - 240 -1);

                switch(tid) {

                // Player
                case 42:
                    
                    this.interactableObjects.push(new Portal(x*16+8, y*16-4, 1, portalCb, this.progress));
                case 0:

                    if (tid != 0 || !this.progress.isNight)
                        this.player = new Player(x*16+8, y*16+8, this.progress, this.message);
                    break;

                // Savepoint
                case 32:

                    this.interactableObjects.push(new Savepoint(x*16+8, y*16+8));
                    break;

                // Chests
                case 33:
                case 34:
                case 35:
                case 36:

                    this.interactableObjects.push(new Chest(x*16+8, y*16+8, tid-33, id));
                    if (tid == 36) 
                        ++ orbCount;

                    break;

                // NPC
                case 37:

                    this.interactableObjects.push(new NPC(x*16+8, y*16+8, id, isNight));
                    break;

                // Door
                case 38:
                case 39:

                    this.interactableObjects.push(new Door(x*16+8, y*16, tid == 39, id));
                    break;

                // Shopkeeper
                case 40:

                    this.interactableObjects.push(new Shopkeeper(x*16+8, y*16+4, this.shop, id));
                    break;

                // Portal
                case 41:

                    this.interactableObjects.push(new Portal(x*16+8, y*16-4, id, portalCb, this.progress));

                    if (id == 0 && this.progress.isNight) {

                        this.player = new Player(x*16+8, y*16+8, this.progress, this.message);
                    }

                    break;

                // Special NPC
                case 43:

                    this.interactableObjects.push(new SpecialNPC(x*16, y*16+4, this.progress, id));
                    break;

                // Night orb
                case 44:

                    // Beautiful
                    this.interactableObjects.push(nightOrb = new NightOrb(x*16, y*16+4, this.progress, resetCb));
                    break;

                // Star
                case 45:

                    ++ starCount;
                    if (this.progress.isNight)
                        this.stars.push(new NightStar(x*16 + 8, y*16 + 8, id, bulletCb));
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
                    this.enemies[index] = new (
                        (this.progress.isNight && !this.progress.isIntro ? Flame : getEnemyType(tid-1))
                            .prototype.constructor) (x*16+8, y*16+8);
                    this.enemies[index].init(x*16+8, y*16+8);
                    this.enemies[index].setBulletCallback(bulletCb);
                }
            }
        }

        if (nightOrb != null)
            nightOrb.setOrbCount(orbCount+1);

        for (let o of this.interactableObjects) {

            if (o.setOrbCount != undefined) {

                o.setOrbCount(orbCount+1);
            }

            if (o.setStarCount != undefined) {

                o.setStarCount(starCount);
            }
        }

        this.linkDoors();
    }


    positionCamera(cam) {

        cam.setPosition(
            (this.player.pos.x / 160) | 0, 
            (this.player.pos.y / 144) | 0);
    }


    reset(stage, portalCb, resetCb, doNotGoToCheckpoint) {

        let checkpoint = this.player.checkpoint.clone();

        this.enemies = new Array();
        this.flyingText = new Array();
        this.collectibles = new Array();
        this.bullets = new Array();
        this.interactableObjects = new Array();
        this.stars = new Array();

        stage.parseObjects(this, portalCb, resetCb);
        if (!doNotGoToCheckpoint)
            this.player.respawnToCheckpoint(checkpoint);
    }


    update(cam, stage, message, ev) {

        let wait = this.player.updateForceWait(ev);

        if (!wait) {
            
            for (let e of this.enemies) {

                e.cameraEvent(cam, ev);
                if (!cam.moving) {

                    e.update(ev);
                    e.playerCollision(this.player, this, ev);
                    
                    stage.objectCollision(e, this, ev);
                }

                if (e.isActive()) {
                    
                    for (let e2 of this.enemies) {

                        if (e2 != e) {

                            e.enemyCollision(e2);
                        }
                    }
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
        }

        for (let t of this.flyingText) {

            t.update(ev);
        }

        for (let o of this.interactableObjects) {

            o.checkIfInCamera(cam);
            o.update(ev);
            o.playerCollision(message, this.player, cam, ev);
        }

        for (let o of this.stars) {

            o.checkIfInCamera(cam);
            o.update(ev);
            o.playerCollision(this.player, ev);
        }

        for (let b of this.bullets) {

            b.checkIfInCamera(cam);
            if (!cam.moving) {

                b.update(ev);
                stage.objectCollision(b, this, ev);
                b.playerCollision(this.player, ev);
            }
        }

        for (let c of this.collectibles) {

            c.cameraEvent(cam, ev);
            c.update(ev);
            c.playerCollision(this.player, this, ev);
            stage.objectCollision(c, this, ev);
        }

        return this.player.exist;
    }


    draw(c, cam) {

        for (let o of this.stars) {

            o.draw(c, cam);
        }

        for (let o of this.interactableObjects) {

            o.draw(c, cam);
        }

        for (let e of this.enemies) {

            e.draw(c, cam);
        }

        for (let o of this.collectibles) {

            o.draw(c);
        }

        this.player.draw(c);

        for (let b of this.bullets) {

            b.draw(c);
        }
    
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

        // TODO: Implement min-max amounts
        nextObject(this.collectibles, Collectible)
            .spawn(x, y, speedX, BASE_SPEED_Y + speedY, id);
    }


    spawnBullet(x, y, sx, sy, row, takeGravity, dmg) {

        nextObject(this.bullets, Bullet)
            .spawn(x, y, sx, sy, row, takeGravity, dmg);
    }

    
    centerTransition(tr) {

        tr.setCenter(
            (this.player.pos.x | 0) % 160,
            (this.player.pos.y | 0) % 144
        );
    }


    // This must be called when the scene is (re)created
    initialCheck(cam) {

        for (let e of this.enemies) {

            e.checkIfInCamera(cam);
        }

        for (let o of this.interactableObjects) {

            o.checkIfInCamera(cam);
            o.playerCollision(null, this.player, null);

            // For chests
            if (o.initialCheck != undefined) {

                o.initialCheck(this.player.progress);
            }
        }

        for (let o of this.stars) {

            o.checkIfInCamera(cam);
            o.initialCheck(this.player.progress);
        }
    }


    killPlayer(ev) {

        if (this.player.dying || !this.player.exist)
            return;

        this.player.kill(ev, true);
    }
}
