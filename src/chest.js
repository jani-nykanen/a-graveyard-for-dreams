/**
 * A Graveyard for Fools
 * 
 * (c) 2020 Jani Nykänen
 */

import { Flip } from "./core/canvas.js";
import { InteractableObject } from "./interactableobject.js";


export const ChestType = {
    Health: 0,
    Item: 1,
    Key: 2,
    Orb: 3,
};


export class Chest extends InteractableObject {


    constructor(x, y, type, id) {

        super(x, y);

        this.opened = false;
        this.opening = false;
        this.type = type;
        this.id = id;

        this.flip = Flip.None;

        this.spr.setFrame(
            (((x / 16) | 0) + ((y / 16) | 0)) % 4, 
            this.type*2);

        this.itemWaitTime = 0;
    }


    update(ev) {

        if (!this.inCamera || this.opened) return;

        const ANIM_SPEED = 8;

        if (!this.opening) {

            this.spr.animate(this.type * 2, 
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

        const TYPE_NAMES = ["heart", "item", "key", "orb"];
        const OFFSET = 8;

        if (this.opening || this.opened) return;

        let loc = ev.assets.localization["en"];

        pl.setCrouchPose(this.pos.x, this.pos.y, 
            pl.pos.x < this.pos.x ? -1 : 1, OFFSET);

        this.opening = true;
        this.disabled = true;

        this.spr.setFrame(0, 1 + 2 * this.type);

        ev.audio.pauseMusic();
        
        let nameStr = TYPE_NAMES [this.type] + "Name";
        let descStr = TYPE_NAMES [this.type] + "Desc";

        if (this.type == 1) {

            nameStr += String(this.id);
            descStr += String(this.id);
        }

        // Add obtain text and description to the message queue
        message.addMessage(loc["obtain"] + " " + loc[nameStr]);
        for (let m of loc[descStr]) {

            message.addMessage(m);
        }

        message.addStartCondition((ev) => {

                const ITEM_WAIT = 60;
                const OPEN_SPEED = 6;
                const OPEN_WAIT = 30;

                if (this.itemWaitTime > 0) {

                    return (this.itemWaitTime -= ev.step) <= 0;
                }

                this.spr.animate(this.type * 2 + 1, 
                    0, 4, this.spr.frame == 3 ? OPEN_WAIT : OPEN_SPEED, 
                    ev.step);
    
                if (this.spr.frame == 4) {
    
                    this.opened = true;
                    this.opening = false;

                    this.itemWaitTime = ITEM_WAIT;

                    this.spr.setFrame(3, this.type*2+1);

                    pl.setObtainItemPose(this.type, 
                        this.type == ChestType.Item ? this.id : 0);

                    // Sound effect
                    ev.audio.playSample(ev.assets.samples["treasure"], 0.50);
                }
                return false;
            })
            .activate((ev) => {
                ev.audio.resumeMusic();

                switch(this.type) {

                case ChestType.Health:
                    pl.progress.addMaxHealth(1);
                    break;

                case ChestType.Item:
                    // ...
                    break;

                case ChestType.Key:
                    pl.progress.addKeys(1);
                    break;

                case ChestType.Orb:
                    pl.progress.addOrbs(1);
                    break;

                default:
                    break;
                }
                pl.progress.markChestOpened(this.type, this.id);

            }, false);
    }


    playerEvent(pl, ev) {

        this.flip = pl.pos.x < this.pos.x ? Flip.None : Flip.Horizontal;
    }


    initialCheck(progress) {
        
        this.opened = progress.isChestOpened(this.type, this.id);
        if (this.opened) {

            this.opening = false;
            this.disabled = true;
            this.spr.setFrame(3, 1 + this.type*2);
        }
    }

}
