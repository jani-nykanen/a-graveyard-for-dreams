/**
 * The End of Journey
 * 
 * (c) 2020 Jani Nykänen
 */

import { GameObject } from "./gameobject.js";


export class CollisionObject extends GameObject {


    constructor(x, y) {

        super(x, y);

        // Collision box is used for non-object collisions,
        // hitbox for object-to-object ones
        this.collisionBox = this.hitbox.clone();
    }


    floorCollisionEvent(x, y, w, ev) {}
    wallCollisionEvent(x, y, h, dir, ev) {}
    ceilingCollisionEvent(x, y, w, ev) {}


    floorCollision(x, y, w, ev) {

        const TOP_MARGIN = 1;
        const BOTTOM_MARGIN = 2;
        
        if (!this.exist || this.dying || this.speed.y < 0) 
            return false;

        let left = this.pos.x + this.center.x - this.collisionBox.x/2;
        let right = left + this.collisionBox.x;

        if (right < x || left >= x + w) 
            return false;

        let yoff = this.center.y + this.collisionBox.y/2;
        let bottomOld = this.oldPos.y + yoff
        let bottomNew = this.pos.y + yoff;

        if (bottomNew >= y - TOP_MARGIN * ev.step &&
            bottomOld <= y + (BOTTOM_MARGIN + this.speed.y)*ev.step) {

            this.pos.y = y - yoff;
            this.floorCollisionEvent(x, y, w, ev);

            this.speed.y = 0.0;

            return true;
        }

        return false;
    }


    ceilingCollision(x, y, w, ev) {

        const TOP_MARGIN = 2;
        const BOTTOM_MARGIN = 1;
        
        if (!this.exist || this.dying || this.speed.y > 0) 
            return false;

        let left = this.pos.x + this.center.x - this.collisionBox.x/2;
        let right = left + this.collisionBox.x;
        
        if (right < x || left >= x + w) 
            return false;

        let yoff = this.center.y - this.collisionBox.y/2;
        let topOld = this.oldPos.y + yoff
        let topNew = this.pos.y + yoff;

        if (topNew <= y + BOTTOM_MARGIN * ev.step &&
            topOld >= y - (TOP_MARGIN - this.speed.y)*ev.step) {

            this.pos.y = y - yoff;
            this.ceilingCollisionEvent(x, y, w, ev);

            this.speed.y = 0.0;

            return true;
        }

        return false;
    }


    wallCollision(x, y, h, dir, ev) {

        const NEAR_MARGIN = 1;
        const FAR_MARGIN = 2;
        
        if (!this.exist || this.dying || this.speed.x*dir < 0) 
            return false;

        let top = this.pos.y + this.center.y - this.collisionBox.y/2;
        let bottom = top + this.collisionBox.y;

        if (bottom < y || top >= y + h)
            return false;

        let xoff = this.center.x + this.collisionBox.x/2 * dir;
        let nearOld = this.oldPos.x + xoff
        let nearNew = this.pos.x + xoff;

        if ( nearNew >= x - NEAR_MARGIN*dir*ev.step &&
            nearOld <= x + (FAR_MARGIN + Math.abs(this.speed.x)*dir*ev.step ) ) {

            this.pos.x = x - xoff;
            this.wallCollisionEvent(x, y, h, dir, ev);

            this.speed.x = 0.0;

            return true;
        }

        return false;
    }    
}
