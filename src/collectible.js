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

        this.friction = new Vector2(0.05, 0.05);

        this.bounceX = 0.75;
        this.bounceY = 0.75;

        this.collisionBox = new Vector2(4, 8);
        this.center.y = -1;
    }


    spawn(x, y, sx, sy, id) {

        const TARGET_GRAVITY = 2.0;

        this.pos = new Vector2(x, y);

        this.speed.x = sx;
        this.speed.y = sy;

        this.target.x = 0;
        this.target.y = TARGET_GRAVITY;

        this.exist = true;

        this.spr.setFrame(0, id);
    }

    
    updateLogic(ev) {

        const ANIM_BASE_SPEED = 6;

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
}
