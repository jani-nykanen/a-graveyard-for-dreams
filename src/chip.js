/**
 * The End of Journey
 * 
 * (c) 2020 Jani Nykänen
 */

import { Sprite } from "./core/sprite.js";
import { Vector2 } from "./core/vector.js";
import { CollisionObject } from "./collisionobject.js";
import { Flip } from "./core/canvas.js";


// I couldn't come up with a better name for these
export class Chip extends CollisionObject {


    constructor() {

        super(0, 0);

        this.exist = false;

        this.spr = new Sprite(8, 8);

        this.friction = new Vector2(0.015, 0.1);

        this.bounceX = 0.75;
        this.bounceY = 0.75;

        this.collisionBox = new Vector2(4, 4);
        this.center = new Vector2(0, 7);

        this.firstJump = true;
    }


    spawn(x, y, sx, sy, row) {

        const TARGET_GRAVITY = 4.0;

        this.pos = new Vector2(x, y);

        this.speed.x = sx;
        this.speed.y = sy;

        this.target.x = 0;
        this.target.y = TARGET_GRAVITY;

        this.exist = true;

        this.spr.setFrame((Math.random()*4) | 0, row);

        this.firstJump = true;
    }


    outsideCameraEvent(ev) {

        this.exist = false;
    }


    draw(c) {

        if (!this.exist || !this.inCamera) return;

        this.spr.draw(c, c.bitmaps["chips"],
            this.pos.x-4, this.pos.y+3, Flip.None);
    }


    floorCollisionEvent(x, y, w, h, ev) {

        const EPS = 0.1;

        if (!this.firstJump && this.speed.y < EPS) {

            this.exist = false;
        }

        this.firstJump = false;
    }
}
