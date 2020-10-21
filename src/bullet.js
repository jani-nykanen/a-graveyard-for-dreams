/**
 * The End of Journey
 * 
 * (c) 2020 Jani Nykänen
 */

import { Sprite } from "./core/sprite.js";
import { Vector2 } from "./core/vector.js";
import { CollisionObject } from "./collisionobject.js";
import { Flip } from "./core/canvas.js";


export class Bullet extends CollisionObject {


    constructor() {

        super(0, 0);

        this.exist = false;

        this.spr = new Sprite(16, 16);

        this.collisionBox = new Vector2(2, 2);
        // TODO: Obtain this from the row
        this.hitbox = new Vector2(6, 6);

        this.dmg = 1;
    }


    spawn(x, y, sx, sy, row) {

        this.pos = new Vector2(x, y);
        this.speed = new Vector2(sx, sy);
        this.target = this.speed.clone();

        // TODO: Get this from row
        this.dmg = 1;

        this.spr.setFrame(0, row+1);

        this.exist = true;
    }


    die(ev) {

        const DEATH_SPEED = 4;

        this.spr.animate(0, 0, 4, DEATH_SPEED, ev.step);
        return this.spr.frame == 4;
    }


    outsideCameraEvent(ev) {

        this.exist = false;
    }


    draw(c) {

        if (!this.exist || !this.inCamera) return;

        this.spr.draw(c, c.bitmaps["bullets"],
            this.pos.x-8, this.pos.y-8, Flip.None);
    }


    kill(ev) {

        this.dying = true;
        this.stopMovement();
    }


    floorCollisionEvent(x, y, w, h, ev) {

        this.kill(ev);
    }


    ceilingCollisionEvent(x, y, w, h, ev) {

        this.kill(ev);
    }


    wallCollisionEvent(x, y, h, dir, ev) {

        this.kill(ev);
    }


    playerCollision(pl, ev) {

        if (!this.exist || !this.inCamera || this.dying || 
            pl.hurtTimer > 0) return;

        if (pl.overlayObject(this)) {

            pl.dir = pl.pos.x < this.pos.x ? 1 : -1;
            pl.hurt(this.dmg, ev);

            return true;
        }
        return false;
    }
}
