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

        this.inCamera = false;
        this.flip = Flip.None;

        this.disabled = false;
        this.noActivationSound = false;

        this.hitbox = new Vector2(16, 16);
    }


    checkIfInCamera(cam) {

        this.inCamera = cam.isObjectInside(this);
    }


    playerCollisionEvent(pl, ev) {}
    triggerEvent(pl, cam, ev) {}
    playerEvent(pl, ev) {}


    playerCollision(message, pl, cam, ev) {

        if (this.disabled || !this.inCamera || pl.dying) 
            return false;

        this.playerEvent(pl, ev);

        if (ev == null) 
            return false;

        if (pl.overlay(this.pos.x-this.hitbox.x/2, this.pos.y-this.hitbox.y/2, 
            this.hitbox.x, this.hitbox.y)) {

            this.playerCollisionEvent(pl, ev);

            if (pl.canJump) {

                pl.showInteractionArrow();

                if (ev.input.upPress()) {

                    if (!this.noActivationSound) {
                        
                        // Sound effect
                        ev.audio.playSample(ev.assets.samples["activate"], 0.50);
                    }

                    pl.disableArrow();
                    this.triggerEvent(message, pl, cam, ev);
                }
            }
            return true;
        }   
        return false;     
    }
}