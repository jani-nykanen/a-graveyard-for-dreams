/**
 * A Graveyard for Fools
 * 
 * (c) 2020 Jani Nykänen
 */

import { Flip } from "./core/canvas.js";
import { Vector2 } from "./core/vector.js";
import { InteractableObject } from "./interactableobject.js";


export class Savepoint extends InteractableObject {


    constructor(x, y) {

        super(x, y);

        this.active = false;

        this.hitbox = new Vector2(10, 16);
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
            ev.audio.playSample(ev.assets.samples["savepoint"], 0.50);
        }
   
    }

    
    triggerEvent(message, pl, cam, ev) {
        
        let loc = ev.assets.localization["en"];

        message.addMessage(
            loc["saveGame"],
            ).activate((ev) => {

                message.addMessage(loc["badResult"]).activate(ev => {}, false);

        }, true);

    }


    playerEvent(pl, ev) {

        this.active = pl.currentSavepoint == this;
    }

}
