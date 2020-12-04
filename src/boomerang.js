/**
 * A Graveyard for Fools
 * 
 * (c) 2020 Jani Nykänen
 */

import { CollisionObject } from "./collisionobject.js";
import { Vector2 } from "./core/vector.js";
import { Sprite } from "./core/sprite.js";
import { Flip } from "./core/canvas.js";
import { clamp, nextObject } from "./core/util.js";


class Flame {


    constructor() {

        this.pos = new Vector2(0, 0);

        this.timer = 0.0;
        this.speed = 1.0;

        this.exist = false;
    }


    spawn(x, y, speed) {

        this.pos.x = x;
        this.pos.y = y;

        this.speed = speed;
        this.timer = 1.0;

        this.exist = true;
    }


    update(ev) {

        if (!this.exist)
            return;

        if ((this.timer -= this.speed * ev.step) <= 0) {

            this.exist = false;
        }
    }


    draw(c) {

        if (!this.exist) return;

        let frame = 5 + clamp(Math.round((1.0-this.timer) * 5), 0, 4);
        
        c.drawBitmapRegion(c.bitmaps["figure"],
            frame*16,80, 16, 16,
            Math.round(this.pos.x-8),
            Math.round(this.pos.y-8), Flip.None);

    }
}



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
        this.hitbox = new Vector2(10, 10);

        this.exist = false;
        this.inCamera = false;

        this.directionChanged = false;

        this.hitId = 0;

        this.flames = new Array();
        this.flameTimer = 0;
        this.hasFlames = false;

        this.ignoreFence = true;
        
        this.isBanana = false;
    }


    spawn(x, y, sx, sy, returnTime, returnObject, hasFlames, isBanana) {

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

        ++ this.hitId;

        this.hasFlames = hasFlames;
        this.isBanana = isBanana;
    }


    updateFlames(ev) {

        const FLAME_SPEED = 1.0/20.0;
        const FLAME_SPAWN_TIME = 6;

        for (let f of this.flames) {

            f.update(ev);
        }

        if (!this.exist) return;

        if ((this.flameTimer -= ev.step) <= 0) {

            nextObject(this.flames, Flame)
                .spawn(this.pos.x, this.pos.y, FLAME_SPEED);

            this.flameTimer += FLAME_SPAWN_TIME;
        }
    }


    preUpdate(ev) {
        
        if (this.hasFlames)
            this.updateFlames(ev);
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

            if ((this.returnTime -= ev.step) <= 0) {

                if (this.hasFlames)
                    ++ this.hitId;

                this.returning = true;
            }
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
        this.spr.animate(this.isBanana ? 10 : 5, 1, 4, ANIM_SPEED, ev.step);

        this.disableCollisions = this.returning && this.directionChanged;
    }


    preDraw(c) {

        if (!this.hasFlames)
            return;

        for (let f of this.flames) {

            f.draw(c);
        }
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

        if (this.hasFlames)
            ++ this.hitId;
    }

    
    breakCollision(x, y, w, h, ev) {

        if (!this.exist || !this.overlay(x, y, w, h))
            return 0;

        return this.hasFlames ? 3 : 1;
    }


    forceReturn() {

        if (this.hasFlames || this.returning) return;

        this.stopMovement();

        this.returnTime = 0;
        this.returning = true;
    }

    
    getKnockback(o) {

        // Just return something
        return 2.0 * (o.pos.x < this.pos.x ? -1 : 1);
    }
}
