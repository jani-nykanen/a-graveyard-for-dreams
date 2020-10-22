/**
 * A Graveyard for Fools
 * 
 * (c) 2020 Jani Nykänen
 */

import { Flip } from "./core/canvas.js";
import { Sprite } from "./core/sprite.js";
import { Vector2 } from "./core/vector.js";


export class Savepoint {


    constructor(x, y) {

        this.pos = new Vector2(x, y);

        this.spr = new Sprite(16, 16);

        this.inCamera = true;
        this.active = false;
    }


    update(ev) {

        if (!this.inCamera) return;

        const ANIM_SPEED = 6;

        if (this.active)
            this.spr.animate(0, 1, 8, ANIM_SPEED, ev.step);
        else
            this.spr.setFrame(0, 0);
    }


    draw(c) {

        if (!this.inCamera) return;

        this.spr.draw(c, c.bitmaps["savepoint"],
            this.pos.x-8, this.pos.y-8,
            Flip.None);
    }


    checkIfInCamera(cam) {

        this.inCamera = cam.isObjectInside(this);
    }


    playerCollision(pl, ev) {

        this.active = pl.currentSavepoint == this;

        if (this.active || !this.inCamera || pl.dying) 
            return false;

        if (pl.overlay(this.pos.x-8, this.pos.y-8, 16, 16)) {

            this.active = true;
            pl.checkpoint = this.pos.clone();
            pl.currentSavepoint = this;

            if (ev != null) {

                // Sound effect
                ev.audio.playSample(ev.assets.samples["savepoint"], 0.60);
            }

            return true;
        }   
        return false;     
    }

}
