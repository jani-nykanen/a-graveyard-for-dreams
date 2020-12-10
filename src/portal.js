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


    constructor(x, y, id, cb, progress) {

        super(x, y);

        this.spr = new Sprite(32, 40);
        this.spr.setFrame(0, id);
        this.hitbox = new Vector2(12, 40);

        this.id = id;

        this.open = false;
        this.noActivationSound = true;

        this.cb = cb;

        this.progress = progress;
        this.starCount = 0;

        this.initialCheck(progress);
        if (this.open)
            this.spr.frame = 1;
    }


    setStarCount(count) {

        this.starCount = count;
    }


    update(ev) {

        const ANIM_SPEED = 6;

        this.initialCheck(this.progress);

        this.deactivated = !this.open;

        if (!this.open) {

            this.spr.setFrame(0, this.id);
        }
        else {

            this.spr.animate(this.id, 1, 3, ANIM_SPEED, ev.step);
        }
    }


    drawInstance(c) {

        if (!this.inCamera || this.opened) return;

        this.spr.draw(c, c.bitmaps["portal"],
            this.pos.x-16, this.pos.y-20,
            Flip.None);

        // Draw star count
        let str = "";
        if (this.id == 1) {

            str = String.fromCharCode(26) + String.fromCharCode(27) +
                  String(this.progress.stars) + 
                  "/" + String(this.starCount);
            c.drawText(c.bitmaps["font"], str, 
                this.pos.x - 4, this.pos.y - 30, 
                -1, 0, true); 
        }
    }


    playerEvent(pl, ev) {

        // ...
    }

    
    triggerEvent(message, pl, cam, ev) {

        ev.audio.stopMusic();

        ev.tr.activate(true, TransitionType.CircleOutside, 1.0/60.0, 
        (ev) => {

            this.cb(ev);

        }, null, new RGB(255, 255, 255));
        ev.tr.setCenter(this.pos.x % 160, (this.pos.y % 144) + 8);

        pl.pos.x = this.pos.x;
        pl.setDoorPose(false);

        // Sound effect
        ev.audio.playSample(ev.assets.samples["teleport"], 0.50);
    }


    initialCheck(progress) {

        this.open = (this.id == 0 && progress.hasItem(ItemType.Clothes)) ||
            (this.id == 1 && progress.isNight && progress.stars >= this.starCount);
    }

}
