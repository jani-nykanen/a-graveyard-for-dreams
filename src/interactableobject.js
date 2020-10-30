/**
 * A Graveyard for Fools
 * 
 * (c) 2020 Jani Nykänen
 */

import { Flip } from "./core/canvas.js";
import { Sprite } from "./core/sprite.js";
import { Vector2 } from "./core/vector.js";


export class InteractableObject {


    constructor(x, y) {

        this.pos = new Vector2(x, y);

        this.spr = new Sprite(16, 16);

        this.inCamera = true;
        this.flip = Flip.None;
    }


    checkIfInCamera(cam) {

        this.inCamera = cam.isObjectInside(this);
    }


    playerCollisionEvent(pl, ev) {}
    triggerEvent(pl, ev) {}
    playerEvent(pl, ev) {}


    playerCollision(pl, ev) {

        this.playerEvent(pl, ev);

        if (!this.inCamera || pl.dying) 
            return false;

        if (pl.overlay(this.pos.x-8, this.pos.y-8, 16, 16)) {

            this.playerCollisionEvent(pl, ev);

            if (pl.canJump && ev.input.upPress()) {

                this.triggerEvent(pl, ev);
            }
            return true;
        }   
        return false;     
    }
}