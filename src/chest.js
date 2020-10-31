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

        this.itemWaitTime = 0;
    }


    update(ev) {

        if (!this.inCamera || this.opened) return;

        const ANIM_SPEED = 8;

        let row = this.isHealth ? 2 : 0;

        if (!this.opening) {

            this.spr.animate(row, 
                0, 3, ANIM_SPEED, ev.step);
        }
    }


    draw(c) {

        if (!this.inCamera) return;

        this.spr.draw(c, c.bitmaps["chest"],
            this.pos.x-8, this.pos.y-8,
            this.flip);
    }

    
    triggerEvent(message, pl, ev) {

        const OFFSET = 8;

        if (this.opening) return;

        pl.setCrouchPose(this.pos.x, this.pos.y, 
            pl.pos.x < this.pos.x ? -1 : 1, OFFSET);

        this.opening = true;
        this.disabled = true;

        this.spr.setFrame(0, this.isHealth ? 3 : 1);

        ev.audio.pauseMusic();

        message.addMessage("You obtain a\nheart container!")
            .addStartCondition((ev) => {

                const ITEM_WAIT = 60;
                const OPEN_SPEED = 6;
                const OPEN_WAIT = 30;

                if (this.itemWaitTime > 0) {

                    return (this.itemWaitTime -= ev.step) <= 0;
                }

                let row = this.isHealth ? 2 : 0;

                this.spr.animate(row + 1, 
                    0, 4, this.spr.frame == 3 ? OPEN_WAIT : OPEN_SPEED, 
                    ev.step);
    
                if (this.spr.frame == 4) {
    
                    this.opened = true;
                    this.opening = false;

                    this.itemWaitTime = ITEM_WAIT;

                    this.spr.setFrame(3, row+1);

                    pl.setObtainItemPose(this.itemId);

                    // Sound effect
                    ev.audio.playSample(ev.assets.samples["treasure"], 0.50);
                }
                return false;
            })
            .activate((ev) => {
                ev.audio.resumeMusic();

                if (this.itemId < 0) {

                    pl.progress.addMaxHealth(1);
                }
            }, false);
    }


    playerEvent(pl, ev) {

        this.flip = pl.pos.x < this.pos.x ? Flip.None : Flip.Horizontal;
    }

}
