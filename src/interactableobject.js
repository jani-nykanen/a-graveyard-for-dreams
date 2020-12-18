/**
 * A Graveyard for Dreams
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
        this.deactivated = false;
        this.noActivationSound = false;

        this.hitbox = new Vector2(16, 16);

        this.exist = true;
    }


    checkIfInCamera(cam) {

        this.inCamera = 
            (this.inCamera && cam.isLooping && cam.moving) ||
            cam.isObjectInside(this);
    }


    playerCollisionEvent(pl, ev) {}
    triggerEvent(pl, cam, ev) {}
    playerEvent(pl, ev) {}


    playerCollision(message, pl, cam, ev) {

        if (this.disabled || !this.inCamera || pl.dying) 
            return false;

        this.playerEvent(pl, ev);

        if (this.deactivated || ev == null) 
            return false;

        if (pl.overlay(this.pos.x-this.hitbox.x/2, this.pos.y-this.hitbox.y/2, 
            this.hitbox.x, this.hitbox.y)) {

            this.playerCollisionEvent(pl, ev);

            if (pl.canJump) {

                pl.showInteractionArrow(0);

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


    drawInstance(c) {}


    draw(c, cam) {

        if (!this.inCamera || !this.exist) return;

        let dx = cam.screenCountX * cam.width;
        let start = 0;
        let end = 0;
        
        if (cam.moving && cam.isLooping) {

            start = -1;
            end = 1;
        }
        
        for (let i = start; i <= end; ++ i) {

            c.move(i * dx, 0);
            this.drawInstance(c);
            c.move(-i * dx, 0);
        }
    }
}
