/**
 * A Graveyard for Fools
 * 
 * (c) 2020 Jani Nykänen
 */

import { Flip } from "./core/canvas.js";
import { InteractableObject } from "./interactableobject.js";


export class NPC extends InteractableObject {


    constructor(x, y, messageId) {

        super(x, y);

        this.messageId = messageId;

        this.spr.setFrame((((x / 16) | 0) + ((y / 16) | 0)) % 4, 0);
    }


    update(ev) {

        if (!this.inCamera || this.opened) return;

        const ANIM_SPEED = 10;

        this.spr.animate(0, 
            0, 3, ANIM_SPEED, ev.step);
        
    }


    draw(c) {

        if (!this.inCamera) return;

        this.spr.draw(c, c.bitmaps["npc"],
            this.pos.x-8, this.pos.y-8 +1,
            this.flip);
    }

    
    triggerEvent(message, pl, ev) {

        message.addMessage(
            "I am an NPC.\nIt means that\nI cannot hurt\nyou and you\ncannot hurt me.")
            .addMessage("It sucks, I\nknow. I would\nkill you if\nI could.")
            .activate((ev) => {}, false);
    }


    playerEvent(pl, ev) {

        this.flip = pl.pos.x < this.pos.x ? Flip.None : Flip.Horizontal;
    }

}
