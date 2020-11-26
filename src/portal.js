/**
 * A Graveyard for Fools
 * 
 * (c) 2020 Jani Nykänen
 */

import { Flip } from "./core/canvas.js";
import { Sprite } from "./core/sprite.js";
import { TransitionType } from "./core/transition.js";
import { RGB, Vector2 } from "./core/vector.js";
import { InteractableObject } from "./interactableobject.js";
import { ItemType } from "./progress.js";


export class Portal extends InteractableObject {


    constructor(x, y, id, cb) {

        super(x, y);

        this.spr = new Sprite(32, 40);
        this.hitbox = new Vector2(12, 40);

        this.id = id;

        this.open = false;
        this.noActivationSound = true;

        this.cb = cb;
    }


    update(ev) {

        const ANIM_SPEED = 6;

        this.deactivated = !this.open;

        if (!this.open) {

            this.spr.setFrame(0, this.id);
        }
        else {

            this.spr.animate(this.id, 1, 3, ANIM_SPEED, ev.step);
        }
    }


    draw(c) {

        if (!this.inCamera || this.opened) return;

        this.spr.draw(c, c.bitmaps["portal"],
            this.pos.x-16, this.pos.y-20,
            Flip.None);
    }


    playerEvent(pl, ev) {

        this.open = pl.progress.hasItem(ItemType.Clothes);
    }

    
    triggerEvent(message, pl, cam, ev) {

        ev.tr.activate(true, TransitionType.CircleOutside, 1.0/60.0, 
        (ev) => {

            this.cb(ev);

        }, null, new RGB(85, 170, 255));
        ev.tr.setCenter(this.pos.x % 160, (this.pos.y % 144) + 8);

        pl.pos.x = this.pos.x;
        pl.setDoorPose(false);

        // Sound effect
        ev.audio.playSample(ev.assets.samples["teleport"], 0.50);
    }


    initialCheck(progress) {

        // this.open = ???
    }

}
