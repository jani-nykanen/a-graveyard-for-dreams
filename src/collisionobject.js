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
    ceilingCollisionEvent(x, y, h, ev) {}


    floorCollision(x, y, w, ev) {

        if (!this.exist || this.dying) return;

        // ...
    }
}
