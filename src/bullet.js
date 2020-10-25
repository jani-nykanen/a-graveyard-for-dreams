/**
 * A Graveyard for Fools
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

        this.friction = new Vector2(0.05, 0.05);

        this.dmg = 1;
    }


    spawn(x, y, sx, sy, row, takeGravity) {

        const BASE_GRAVITY = 2.0;

        this.pos = new Vector2(x, y);
        
        this.speed = new Vector2(sx, sy);
        this.target = this.speed.clone();
        if (takeGravity) {

            this.target.y = BASE_GRAVITY;
        }

        // TODO: Get this from row
        this.dmg = 1;

        this.spr.setFrame(0, row);

        this.exist = true;
        
    }


    die(ev) {

        const DEATH_SPEED = 4;

        this.spr.animate(this.spr.row, 1, 5, 
            DEATH_SPEED, ev.step);
        return this.spr.frame == 5;
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

        // Sound effect
        ev.audio.playSample(ev.assets.samples["hit2"], 0.50);
    }


    floorCollisionEvent(x, y, w, ev) {

        this.kill(ev);
    }


    ceilingCollisionEvent(x, y, h, ev) {

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

            this.kill(ev);

            return true;
        }
        return false;
    }
}
