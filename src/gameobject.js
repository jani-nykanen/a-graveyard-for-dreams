/**
 * The End of Journey
 * 
 * (c) 2020 Jani Nykänen
 */

import { updateSpeedAxis } from "./core/util.js";
import { Vector2 } from "./core/vector.js";


export class GameObject {


    constructor(x, y) {

        this.pos = new Vector2(x, y);
        this.oldPos = this.pos.clone();
        this.speed = new Vector2();
        this.target = this.speed.clone();
        this.friction = new Vector2(1, 1);

        // Center is the center point of the object,
        // relative to the "physical" position
        this.center = new Vector2();
        this.hitbox = new Vector2();

        this.exist = true;
        this.dying = false;
    }


    updateMovement(ev) {

        this.speed.x = updateSpeedAxis(this.speed.x,
            this.target.x, this.friction.x*ev.step);
        this.speed.y = updateSpeedAxis(this.speed.y,
            this.target.y, this.friction.y*ev.step);

        this.pos.x += this.speed.x * ev.step;
        this.pos.y += this.speed.y * ev.step;
    }


    updateLogic(ev) {}
    postUpdate(ev) {}


    die(ev) { return true; }

    
    update(ev) {

        if (!this.exist) return;

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

        let px = this.pos.x + this.center.x - this.hitbox.x/2;
        let py = this.pos.y + this.center.y - this.hitbox.y/2;

        return px + this.hitbox.x >= x && px < x+w &&
               py + this.hitbox.y >= y && py < y+h;
    }


    stopMovement() {

        this.speed.zeros();
        this.target.zeros();
    }
}
