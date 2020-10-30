/**
 * A Graveyard for Fools
 * 
 * (c) 2020 Jani Nykänen
 */

import { Flip } from "./core/canvas.js";
import { InteractableObject } from "./interactableobject.js";


export class Chest extends InteractableObject {


    constructor(x, y, itemId) {

        super(x, y);

        this.opened = false;
        this.opening = false;
        this.itemId = itemId;

        this.isHealth = itemId < 0;

        this.flip = Flip.None;

        this.spr.setFrame(0, this.isHealth ? 2 : 0);
    }


    update(ev) {

        if (!this.inCamera || this.opened) return;

        const ANIM_SPEED = 8;
        const OPEN_SPEED = 6;

        let row = this.isHealth ? 2 : 0;

        if (!this.opening) {

            this.spr.animate(row, 
                0, 3, ANIM_SPEED, ev.step);
        }
        else {
            
            if (this.spr.frame < 3) {

                this.spr.animate(row + 1, 
                    0, 3, OPEN_SPEED, ev.step);

                if (this.spr.frame == 3) {

                    this.opened = true;
                    this.opening = false;
                }
            }
        }
    }


    draw(c) {

        if (!this.inCamera) return;

        this.spr.draw(c, c.bitmaps["chest"],
            this.pos.x-8, this.pos.y-8,
            this.flip);
    }

    
    triggerEvent(pl, ev) {

        if (this.opening) return;

        this.opening = true;
        this.disabled = true;

        this.spr.setFrame(0, this.isHealth ? 3 : 1);
    }


    playerEvent(pl, ev) {

        this.flip = pl.pos.x < this.pos.x ? Flip.None : Flip.Horizontal;
    }

}
