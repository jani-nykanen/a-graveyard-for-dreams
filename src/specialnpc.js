/**
 * A Graveyard for Fools
 * 
 * (c) 2020 Jani Nykänen
 */

import { applyItemEvent } from "./chest.js";
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

        this.itemWaitTime = 0;

        if (this.id == 0 &&
            this.progress.isChestOpened(3, 16)) {

            this.id = 2;
        }

        if (this.disableCondition()) {

            this.disabled = true;
        }
    }


    update(ev) {

        const ANIM_SPEED = 10;

        if (!this.inCamera) return;

        this.spr.animate(this.id % 2, 0, 3, ANIM_SPEED, ev.step);
    }


    drawInstance(c) {

        if (!this.inCamera) return;

        this.spr.draw(c, c.bitmaps["specialNPC"],
            this.pos.x-12, this.pos.y-12,
            this.flip);
    }


    disableCondition() {

        switch(this.id) {

            case 1:
                return this.progress.hasItem(ItemType.GoldenSword);
    
            case 2:
                return this.progress.hasItem(ItemType.GoldenBoomerang);
    
            default:
                return false;
        }
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

            // Happens automatically when applyItemEvent
            // is called
            // this.progress.addOrbs(1);

            this.progress.markChestOpened(3, 16);

            return [16, 3];
        case 1:

            this.progress.removeItem(ItemType.Dummy);
            this.progress.obtainItem(ItemType.GoldenSword);

            this.deactivated = true;

            return [ItemType.GoldenSword, 1];

        case 2:

            this.progress.removeItem(ItemType.LifePotion);
            this.progress.obtainItem(ItemType.GoldenBoomerang);

            this.deactivated = true;

            return [ItemType.GoldenBoomerang, 1];
    
        default:
            return [-1, -1];
        }
    }

    
    triggerEvent(message, pl, cam, ev) {
        
        const WAIT_TIME = 60;

        let loc = ev.assets.localization["en"];

        for (let m of loc["specialNPC"][this.id]) {
            
            message.addMessage(m);
        }
        message.activate((ev) => {

            if (!this.payCondition())
                return;

            message.addMessage(loc["specialQuestion"][this.id])
                .activate((ev) => {

                    message.addMessage(loc["specialReply"][this.id])
                        .activate((ev) => {

                        let poseInfo = this.payEvent();

                        // Sound effect
                        ev.audio.playSample(ev.assets.samples["treasure"], 0.50);
                        ev.audio.pauseMusic();

                        pl.setObtainItemPose(poseInfo[1], poseInfo[0]);

                        this.itemWaitTime = WAIT_TIME;

                        message.addStartCondition((ev) => {

                            return (this.itemWaitTime -= ev.step) <= 0;
                        })
                        for (let m of loc["specialResult"][this.id]) {

                            message.addMessage(m);
                        }
                        message.activate((ev) => {

                            if (this.id == 0)
                                this.id = 2;

                            applyItemEvent(poseInfo[1], poseInfo[0], pl);

                            ev.audio.resumeMusic();

                        }, false);

                    }, false);

                }, true);

        }, false);

    }


    playerEvent(pl, ev) {

        this.flip = pl.pos.x < this.pos.x ? Flip.None : Flip.Horizontal;
    }

}
