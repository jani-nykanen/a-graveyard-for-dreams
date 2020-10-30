/**
 * A Graveyard for Fools
 * 
 * (c) 2020 Jani Nykänen
 */

import { Flip } from "./core/canvas.js";
import { InteractableObject } from "./interactableobject.js";


export class Savepoint extends InteractableObject {


    constructor(x, y) {

        super(x, y);

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


    playerCollisionEvent(pl, ev) {

        if (this.active) return;

        this.active = true;
        pl.checkpoint = this.pos.clone();
        pl.currentSavepoint = this;

        if (ev != null) {

            // Sound effect
            ev.audio.playSample(ev.assets.samples["savepoint"], 0.60);
        }
   
    }

    
    triggerEvent(message, pl, ev) {

        console.log("Not implemented yet.");

        message.addMessage(
            "Haha lol.\nNot implemented\nyet."
            ).activate((ev) => {});

    }


    playerEvent(pl, ev) {

        this.active = pl.currentSavepoint == this;
    }

}
