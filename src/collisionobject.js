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

        let yoff = this.center.y + this.collisionBox.y/2;
        let bottomOld = this.oldPos.y + yoff
        let bottomNew = this.pos.y + yoff;
        
        if (right < x || left >= x + w) 
            return false;;

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

        let yoff = this.center.y - this.collisionBox.y/2;
        let topOld = this.oldPos.y + yoff
        let topNew = this.pos.y + yoff;
        
        if (right < x || left >= x + w) 
            return false;;

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

        // TODO: Implement
    }    
}
