/**
 * A Graveyard for Fools
 * 
 * (c) 2020 Jani Nykänen
 */

import { Flip } from "./core/canvas.js";
import { Sprite } from "./core/sprite.js";
import { Vector2 } from "./core/vector.js";
import { InteractableObject } from "./interactableobject.js";


export class Shopkeeper extends InteractableObject {


    constructor(x, y) {

        super(x, y);

        this.active = false;

        this.spr = new Sprite(24, 24);
        this.hitbox = new Vector2(12, 16);
    }


    update(ev) {

        if (!this.inCamera) return;

        const ANIM_SPEED = 10;

        this.spr.animate(0, 0, 3, ANIM_SPEED, ev.step);
    }


    draw(c) {

        if (!this.inCamera) return;

        this.spr.draw(c, c.bitmaps["shopkeeper"],
            this.pos.x-12, this.pos.y-12,
            this.flip);
    }

    
    triggerEvent(message, pl, cam, ev) {
        
        let loc = ev.assets.localization["en"];

        message.addMessage(
            loc["shopkeeper"],
            ).activate((ev) => {

                // ...

        }, false);

    }


    playerEvent(pl, ev) {

        this.flip = pl.pos.x < this.pos.x ? Flip.None : Flip.Horizontal;
    }

}
