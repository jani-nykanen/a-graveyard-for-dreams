/**
 * A Graveyard for Fools
 * 
 * (c) 2020 Jani Nykänen
 */

import { Flip } from "./core/canvas.js";
import { Vector2 } from "./core/vector.js";
import { InteractableObject } from "./interactableobject.js";


export class NPC extends InteractableObject {


    constructor(x, y, messageId, isCat) {

        super(x, y);

        this.messageId = messageId;

        this.spr.setFrame((((x / 16) | 0) + ((y / 16) | 0)) % 4, 
            isCat ? 1 : 0);

        this.hitbox = new Vector2(10, 16);
        this.isCat = isCat;
    }


    update(ev) {

        if (!this.inCamera || this.opened) return;

        const ANIM_SPEED = 10;

        this.spr.animate(this.spr.row, 
            0, 3, ANIM_SPEED, ev.step);
        
    }


    drawInstance(c) {

        if (!this.inCamera) return;

        this.spr.draw(c, c.bitmaps["npc"],
            this.pos.x-8, this.pos.y-8 +1,
            this.flip);
    }

    
    triggerEvent(message, pl, cam, ev) {

        let loc = ev.assets.localization["en"];

        let msg = this.isCat ? loc["meow"] : loc["npc"][this.messageId];

        for (let m of msg) {

            message.addMessage(m);
        }
        message.activate((ev) => {}, false);
    }


    playerEvent(pl, ev) {

        this.flip = pl.pos.x < this.pos.x ? Flip.None : Flip.Horizontal;
    }

}
