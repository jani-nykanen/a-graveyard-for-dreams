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

        this.disableCollisions = false;
    }


    floorCollisionEvent(x, y, w, ev) {}
    wallCollisionEvent(x, y, h, dir, ev) {}
    ceilingCollisionEvent(x, y, w, ev) {}


    floorCollision(x, y, w, ev) {

        const H_MARGIN = 1;

        const TOP_MARGIN = 1;
        const BOTTOM_MARGIN = 2;
        
        if (this.disableCollisions ||
            !this.exist || this.dying || this.speed.y < 0) 
            return false;

        let left = this.pos.x + this.center.x - this.collisionBox.x/2;
        let right = left + this.collisionBox.x;

        if (right <= x + H_MARGIN || 
            left >= x + w - H_MARGIN) 
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

        const H_MARGIN = 1;

        const TOP_MARGIN = 2;
        const BOTTOM_MARGIN = 1;
        
        if (this.disableCollisions ||
            !this.exist || this.dying || this.speed.y > 0) 
            return false;

        let left = this.pos.x + this.center.x - this.collisionBox.x/2;
        let right = left + this.collisionBox.x;
        
        if (right <= x + H_MARGIN || 
            left >= x + w - H_MARGIN) 
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

        const V_MARGIN = 1;

        const NEAR_MARGIN = 1;
        const FAR_MARGIN = 2;
        
        if (this.disableCollisions ||
            !this.exist || this.dying || this.speed.x*dir < 0) 
            return false;

        let top = this.pos.y + this.center.y - this.collisionBox.y/2;
        let bottom = top + this.collisionBox.y;

        if (bottom <= y+V_MARGIN || top >= y + h - V_MARGIN)
            return false;

        let xoff = this.center.x + this.collisionBox.x/2 * dir;
        let nearOld = this.oldPos.x + xoff
        let nearNew = this.pos.x + xoff;

        if ((dir > 0 && nearNew >= x - NEAR_MARGIN*ev.step &&
             nearOld <= x + (FAR_MARGIN + this.speed.x)*ev.step) || 
             (dir < 0 && nearNew <= x + NEAR_MARGIN*ev.step &&
            nearOld >= x - (FAR_MARGIN - this.speed.x)*ev.step)) {

            this.pos.x = x - xoff;
            this.wallCollisionEvent(x, y, h, dir, ev);

            this.speed.x = 0.0;

            return true;
        }

        return false;
    }    
}
