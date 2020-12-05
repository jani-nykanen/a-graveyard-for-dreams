/**
 * A Graveyard for Fools
 * 
 * (c) 2020 Jani Nykänen
 */

import { Flip } from "./core/canvas.js";
import { Sprite } from "./core/sprite.js";
import { Vector2 } from "./core/vector.js";
import { InteractableObject } from "./interactableobject.js";


export class NightOrb extends InteractableObject {


    constructor(x, y, progress) {

        super(x, y);

        this.active = false;

        // The first sprite is for the camera check only
        this.spr = new Sprite(32, 32);
        this.sprOrb = new Sprite(24, 24);
        this.hitbox = new Vector2(12, 16);

        this.progress = progress;
        this.orbCount = -1;

        this.activated = progress.nightOrbActivated;

        this.floatTimer = Math.PI/2;
        this.floatPhase = 0;
        this.animPosY = this.pos.y;
    }


    setOrbCount(count) {

        this.orbCount = count;
    }


    update(ev) {

        const WAIT_SPEED = 30;
        const ANIM_SPEED = 8;
        const AMPLITUDE = [4, 2];
        const FLOAT_SPEED = 0.05;

        if (!this.inCamera) return;

        if (this.activated) {

            this.sprOrb.animate(0, 1, 4, 
                this.sprOrb.frame == 1 ? WAIT_SPEED : ANIM_SPEED, 
                ev.step);

            this.floatTimer += FLOAT_SPEED * ev.step;
            if (this.floatPhase == 0 && this.floatTimer >= Math.PI*2) {

                this.floatPhase = 1;
            }
            this.floatTimer %= Math.PI * 2;
        }

        this.animPosY = this.pos.y - AMPLITUDE[0] + 
            Math.round(Math.sin(this.floatTimer) * AMPLITUDE[this.floatPhase]);
    }


    draw(c) {

        if (!this.inCamera) return;

        this.sprOrb.draw(c, c.bitmaps["nightOrb"],
            this.pos.x-12, this.animPosY-12 +1,
            false);

        let str;
        if (!this.activated) {

            str = String.fromCharCode(24) + String.fromCharCode(25) +
                  String(this.progress.orbs) + 
                  "/" + String(this.orbCount);
            c.drawText(c.bitmaps["font"], str, this.pos.x - 4, this.pos.y - 24, -1, 0, true); 
        }
    }

    
    triggerEvent(message, pl, cam, ev) {
        
        let loc = ev.assets.localization["en"];

        message.addMessage(loc[this.activated ? "nightOrbOverdrive" : "nightOrbActivate"])
            .activate((ev) => {
            
            this.activated = true;
            this.progress.orbs = 0;
            this.progress.nightOrbActivated = true;

        }, true);

    }


    playerEvent(pl, ev) {

        this.activated = this.progress.nightOrbActivated;

        this.deactivated = !this.activated &&
            this.progress.orbs < this.orbCount;
    }

}
