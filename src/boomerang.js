/**
 * The End of Journey
 * 
 * (c) 2020 Jani Nykänen
 */

import { CollisionObject } from "./collisionobject.js";
import { Vector2 } from "./core/vector.js";
import { Sprite } from "./core/sprite.js";
import { Flip } from "./core/canvas.js";


export class Boomerang extends CollisionObject {


    constructor() {

        super(0, 0);

        this.spr = new Sprite(16, 16);

        this.returning = false;
        this.returnTime = 0;

        this.returnObject = null;

        this.totalSpeed = 0;

        this.friction = new Vector2(0.1, 0.1);

        this.collisionBox = new Vector2(4, 4);
        this.hitbox = new Vector2(8, 8);

        this.exist = false;
        this.inCamera = false;

        this.directionChanged = false;
    }


    spawn(x, y, sx, sy, returnTime, returnObject) {

        this.pos = new Vector2(x, y);

        this.speed = new Vector2(sx, sy);
        this.target = this.speed.clone();

        this.returning = false;
        this.returnTime = returnTime;
        this.returnObject = returnObject;

        this.totalSpeed = this.speed.length();

        this.exist = true;
        this.inCamera = true;
        this.dying = false;
        this.disableCollisions = false;

        this.directionChanged = false;
    }


    updateLogic(ev) {

        const EPS = 12.0;
        const ANIM_SPEED = 4;

        let dir = new Vector2(
            this.pos.x - this.returnObject.pos.x, 
            this.pos.y - this.returnObject.pos.y
        );

        let dist = dir.length();
        dir.normalize(false);

        if (!this.returning) {

            if ((this.returnTime -= ev.step) <= 0) 
                this.returning = true;
        }
        else {

            this.target.x = -dir.x * this.totalSpeed;
            this.target.y = -dir.y * this.totalSpeed;

            if (!this.directionChanged) {

                this.directionChanged = 
                    Math.sign(this.target.x) == Math.sign(this.speed.x) &&
                    Math.sign(this.target.y) == Math.sign(this.speed.y);
            }
            
            if (dist < EPS) {

                this.exist = false;
            }
        }

        // Animate
        this.spr.animate(5, 1, 4, ANIM_SPEED, ev.step);

        this.disableCollisions = this.returning && this.directionChanged;
    }


    draw(c) {

        if (!this.exist) return;

        this.spr.draw(c, c.bitmaps["figure"],
            (this.pos.x - 8) | 0,
            (this.pos.y - 8) | 0, 
            this.speed.x >= 0 ? Flip.None : Flip.Horizontal);
    }


    wallCollisionEvent(x, y, h, dir, ev) {

        this.directionChanged = true;

        if (this.returning) return;

        this.returnTime = 0;
        this.returning = true;
    }

    
    breakCollision(x, y, w, h, ev) {

        return this.exist && this.overlay(x, y, w, h) ? 1 : 0;
    }


    forceReturn() {

        this.returnTime = 0;
        this.returning = true;
    }
}
