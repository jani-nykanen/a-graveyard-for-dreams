/**
 * The End of Journey
 * 
 * (c) 2020 Jani Nykänen
 */

import { Sprite } from "./core/sprite.js";
import { Vector2 } from "./core/vector.js";
import { CollisionObject } from "./collisionobject.js";
import { Flip } from "./core/canvas.js";


export class Collectible extends CollisionObject {


    constructor() {

        super(0, 0);

        this.exist = false;

        this.spr = new Sprite(16, 16);

        this.friction = new Vector2(0.01, 0.05);

        this.bounceX = 0.75;
        this.bounceY = 0.75;

        this.collisionBox = new Vector2(4, 8);
        this.hitbox = new Vector2(8, 8);
        this.center.y = -1;

        this.id = 0;

        this.touchWater = false;
        this.firstWaterTouch = true;
    }


    spawn(x, y, sx, sy, id) {

        this.pos = new Vector2(x, y);

        this.speed.x = sx;
        this.speed.y = sy;

        this.target.x = 0;

        this.exist = true;

        this.id = id;
        this.spr.setFrame(0, id);

        this.touchWater = false;
        this.firstWaterTouch = true;
    }

    
    updateLogic(ev) {

        const ANIM_BASE_SPEED = 6;
        const BASE_FRICTION_X = 0.01;
        const BASE_FRICTION_Y = 0.05;
        const BASE_GRAVITY = 2.0;
        
        this.friction.x = BASE_FRICTION_X;
        this.friction.y = BASE_FRICTION_Y;
        this.target.y = BASE_GRAVITY;

        if (this.touchWater) {

            if (this.firstWaterTouch) {

                this.speed.x /= 2;
                this.speed.y /= 2;
                this.firstWaterTouch = false;
            }

            this.friction.x /= 2;
            this.friction.y /= 2;
            this.target.y /= 2;
        }
        
        this.touchWater = false;

        this.spr.animate(this.spr.row, 0, 3, ANIM_BASE_SPEED, ev.step);
    }


    draw(c) {

        if (!this.exist || !this.inCamera) return;

        this.spr.draw(c, c.bitmaps["collectibles"],
            this.pos.x-8, this.pos.y-8, Flip.None);
    }


    cameraEvent(cam, ev) {

        this.checkIfInCamera(cam);
        if (!this.inCamera) {

            this.exist = false;
            return;
        }

        if (!cam.isMoving) {
			
            this.wallCollision(cam.rpos.x * cam.width, 
                cam.rpos.y * cam.height, cam.height, -1, ev);
            
            this.wallCollision((cam.rpos.x+1) * cam.width, 
                cam.rpos.y * cam.height, cam.height, 1, ev);    
		}
    }


    playerCollision(pl, objm, ev) {

        if (!this.exist) return false;

        if (pl.overlayObject(this)) {

            pl.addCollectible(this.id);
            this.exist = false;

            // Sound effect
            ev.audio.playSample(ev.assets.samples[["coin", "heal"][this.id]], 0.60);

            objm.spawnItemText(1, this.id, pl.pos.x, 
                pl.pos.y + pl.center.y - pl.spr.height/2);

            return true;
        }
        return false;
    }


    waterCollision(x, y, w, h, ev) {

        if (this.overlay(x, y, w, h)) {

            this.touchWater = true;

            return true;
        }
        return false;
    }
}
