/**
 * A Graveyard for Fools
 * 
 * (c) 2020 Jani Nykänen
 */

import { Flip } from "./core/canvas.js";
import { Sprite } from "./core/sprite.js";
import { Vector2 } from "./core/vector.js";
import { InteractableObject } from "./interactableobject.js";
import { ItemType } from "./progress.js";


export class SpecialNPC extends InteractableObject {


    constructor(x, y, progress, id) {

        super(x, y);

        this.active = false;

        this.spr = new Sprite(24, 24);
        this.hitbox = new Vector2(12, 16);
        this.spr.frame = (Math.random() * 4) | 0;

        this.spr.setFrame(0, id % 2);

        this.id = id;

        this.progress = progress;
    }


    update(ev) {

        const ANIM_SPEED = 10;

        if (!this.inCamera) return;

        this.spr.animate(this.id % 2, 0, 3, ANIM_SPEED, ev.step);
    }


    draw(c) {

        if (!this.inCamera) return;

        this.spr.draw(c, c.bitmaps["specialNPC"],
            this.pos.x-12, this.pos.y-12,
            this.flip);
    }

    payCondition() {

        switch(this.id) {

        case 0:
            return this.progress.coins >= 30;

        case 1:
            return this.progress.hasItem(ItemType.Dummy);

        case 2:
            return this.progress.hasItem(ItemType.LifePotion);

        default:
            return false;
        }
    }


    payEvent() {

        switch(this.id) {

        case 0:
            
            this.progress.addCoins(-30);
            this.progress.addOrbs(1);

            break;
    
        case 1:

            this.progress.removeItem(ItemType.Dummy);
            this.progress.obtainItem(ItemType.GoldenSword);

            this.deactivated = true;

            break;

        case 2:

            this.progress.removeItem(ItemType.LifePotion);
            this.progress.obtainItem(ItemType.GoldenBoomerang);

            this.deactivated = true;

            break;
    
        default:
            break;
        }
    }

    
    triggerEvent(message, pl, cam, ev) {
        
        let loc = ev.assets.localization["en"];

        for (let m of loc["specialNPC"][this.id]) {
            
            message.addMessage(m);
        }
        message.activate((ev) => {

            if (!this.payCondition())
                return;

            message.addMessage(loc["specialQuestion"][this.id])
                .activate((ev) => {

                    this.payEvent();
                    message.addMessage(loc["specialReply"][this.id])
                        .activate((ev) => {

                            if (this.id == 0)
                                this.id = 2;

                        }, false);

                }, true, true);

        }, false);

    }


    playerEvent(pl, ev) {

        this.flip = pl.pos.x < this.pos.x ? Flip.None : Flip.Horizontal;
    }

}
