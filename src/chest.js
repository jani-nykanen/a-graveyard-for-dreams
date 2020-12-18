/**
 * A Graveyard for Dreams
 * 
 * (c) 2020 Jani Nykänen
 */

import { Flip } from "./core/canvas.js";
import { Vector2 } from "./core/vector.js";
import { InteractableObject } from "./interactableobject.js";


export const ChestType = {
    Health: 0,
    Item: 1,
    Key: 2,
    Orb: 3,
    Potion: 4,
};


export function applyItemEvent(type, id, pl) {

    switch(type) {

        case ChestType.Health:

            pl.progress.addMaxHealth(1);
            break;

        case ChestType.Item:
            
            pl.progress.obtainItem(id);
            break;

        case ChestType.Key:

            pl.progress.addKeys(1);
            break;

        case ChestType.Orb:

            pl.progress.addOrbs(1);
            break;

        case ChestType.Potion:

            pl.progress.restoreHealth();
            break;

        default:
            break;
        }
}


export function addItemDescription(loc, message, type, id, currentOrbs, maxOrbs) {

    const TYPE_NAMES = ["heart", "item", "key", "orb", "potion"];

    let nameStr = TYPE_NAMES [type] + "Name";
    let descStr = TYPE_NAMES [type] + "Desc";

    let resNameStr = "";
    let resDescStrs;

    if (type == 1) {

        resNameStr = loc["obtain"] + " " + loc[nameStr][id];
        resDescStrs = loc[descStr][id];
    }
    else {

        resNameStr = loc["obtain"] + " " + loc[nameStr];
        resDescStrs = loc[descStr];
    }

    let dif = -1;
    if (currentOrbs != undefined &&
        maxOrbs != undefined) {

        dif = maxOrbs - (currentOrbs+1);
    }

    // Add obtain text and description to the message queue
    message.addMessage(resNameStr);
    let msg = "";
    for (let m of resDescStrs) {

        if (dif >= 0) {

            msg = m.replace("%", String(dif));
        }
        else {

            msg = m;
        }
        message.addMessage(msg);
    }
}


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

        this.hitbox = new Vector2(12, 16);

        this.orbCount = 0;
    }


    setOrbCount(count) {

        this.orbCount = count;
    }


    update(ev) {

        if (!this.inCamera || this.opened) return;

        const ANIM_SPEED = 8;

        if (!this.opening) {

            this.spr.animate(this.type * 2, 
                0, 3, ANIM_SPEED, ev.step);
        }
    }


    drawInstance(c) {

        if (!this.inCamera) return;

        this.spr.draw(c, c.bitmaps["chest"],
            this.pos.x-8, this.pos.y-8,
            this.flip);
    }

    
    triggerEvent(message, pl, cam, ev) {

        const OFFSET = 8;

        if (this.opening || this.opened) return;

        let loc = ev.assets.localization["en"];

        pl.setCrouchPose(this.pos.x, this.pos.y, 
            pl.pos.x < this.pos.x ? -1 : 1, OFFSET);

        this.opening = true;
        this.disabled = true;

        this.spr.setFrame(0, 1 + 2 * this.type);

        ev.audio.pauseMusic();

        addItemDescription(loc, message, this.type, this.id, 
            this.type == ChestType.Orb ? pl.progress.orbs : null,
            this.type == ChestType.Orb ? this.orbCount : null);

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

                applyItemEvent(this.type, this.id, pl);
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


    isOpened() {

        return this.opened && !this.opening;
    }

}
