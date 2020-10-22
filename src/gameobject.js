import { Sprite } from "./core/sprite.js";
/**
 * A Graveyard for Fools
 * 
 * (c) 2020 Jani Nykänen
 */

import { overlay, updateSpeedAxis } from "./core/util.js";
import { Vector2 } from "./core/vector.js";


export class GameObject {


    constructor(x, y) {

        this.pos = new Vector2(x, y);
        this.oldPos = this.pos.clone();
        this.speed = new Vector2(0, 0);
        this.target = this.speed.clone();
        this.friction = new Vector2(1, 1);

        // Center is the center point of the object,
        // relative to the "physical" position
        this.center = new Vector2(0, 0);
        this.hitbox = new Vector2(0, 0);

        this.exist = true;
        this.dying = false;

        this.inCamera = false;

        // For the camera check, otherwise abstract 
        // game object does not "need" a sprite
        // (although all of them will have one)
        this.spr = new Sprite(0, 0);
    }


    updateMovement(ev) {

        this.speed.x = updateSpeedAxis(this.speed.x,
            this.target.x, this.friction.x*ev.step);
        this.speed.y = updateSpeedAxis(this.speed.y,
            this.target.y, this.friction.y*ev.step);

        this.pos.x += this.speed.x * ev.step;
        this.pos.y += this.speed.y * ev.step;
    }


    outsideCameraEvent(ev) {}
    updateLogic(ev) {}
    postUpdate(ev) {}


    die(ev) { return true; }

    
    update(ev) {

        if (!this.exist) return;

        if (!this.inCamera) {

            this.outsideCameraEvent(ev);
            return;
        }

        if (this.dying) {

            if (this.die(ev)) {

                this.exist = false;
                this.dying = false;
            }
            return;
        }

        this.oldPos = this.pos.clone();

        this.updateLogic(ev);
        this.updateMovement(ev);

        this.postUpdate(ev);
    }


    draw(c) {}


    overlay(x, y, w, h) {

        return overlay(this.pos, this.center, this.hitbox,
            x, y, w, h);
    }


    overlayObject(o) {

        return this.overlay(
            o.pos.x-o.hitbox.x/2,
            o.pos.y-o.hitbox.y/2,
            o.hitbox.x, o.hitbox.y);
    }


    stopMovement() {

        this.speed.zeros();
        this.target.zeros();
    }


    checkIfInCamera(cam) {

        this.inCamera = cam.isObjectInside(this);
    }
}
