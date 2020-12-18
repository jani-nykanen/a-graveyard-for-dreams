/**
 * A Graveyard for Dreams
 * 
 * (c) 2020 Jani Nykänen
 */

import { Sprite } from "./core/sprite.js";
import { TransitionType } from "./core/transition.js";
import { Vector2 } from "./core/vector.js";
import { InteractableObject } from "./interactableobject.js";


const FLOAT_AMPLITUDE = [4, 2];


export class NightOrb extends InteractableObject {


    constructor(x, y, progress, resetCb) {

        super(x, y);

        this.active = false;

        // The first sprite is for the camera check only
        this.spr = new Sprite(32, 32);
        this.spr.setFrame(0, 1);
        this.sprOrb = new Sprite(24, 24);
        this.sprOrb.setFrame(progress.nightOrbActivated ? 1 : 0, 0);
        this.hitbox = new Vector2(12, 16);

        this.progress = progress;
        this.orbCount = -1;

        this.activated = progress.nightOrbActivated;
        this.destroyed = progress.isNight;

        this.floatTimer = this.activated ? 0 : Math.PI/2;
        this.floatPhase = this.activated ? 1 : 0;
        this.animPosY = this.activated ? this.pos.y - FLOAT_AMPLITUDE[0] : this.pos.y;

        this.resetCb = resetCb;

        this.transitionNextScene = false;
        this.transitionCb = (ev) => {};
    }


    setOrbCount(count) {

        this.orbCount = count;
    }


    update(ev) {

        const WAIT_SPEED = 30;
        const ANIM_SPEED = 8;
        const FLOAT_SPEED = 0.05;
        
        if (this.transitionNextScene) {

            this.transitionCb(ev);
            this.transitionNextScene = false;
            return;
        }

        if (!this.inCamera || this.destroyed) return;

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

        this.animPosY = this.pos.y - FLOAT_AMPLITUDE[0] + 
            Math.round(Math.sin(this.floatTimer) * FLOAT_AMPLITUDE[this.floatPhase]);
    }


    drawInstance(c) {

        if (!this.inCamera) return;

        if (this.destroyed) {

            this.spr.draw(c, c.bitmaps["nightOrb"],
                this.pos.x-16, this.pos.y-20 +1,
                false);
            return;
        }

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
            
            pl.pos.x = this.pos.x;

            if (!this.activated) {

                this.activated = true;
                this.progress.orbs = 0;
                this.progress.nightOrbActivated = true;

                pl.forceWait(90);
                pl.setDoorPose(false);

                ev.audio.playSample(ev.assets.samples["activateOrb"], 0.70);
                
            }
            else {

                pl.forceWait(60); // Any number is fine
                pl.setTouchPose();

                ev.audio.stopMusic();
                ev.audio.playSample(ev.assets.samples["night"], 0.60);

                this.transitionNextScene = true;
                this.transitionCb = (ev) => {

                    ev.tr.activate(true, TransitionType.HorizontalWaves, 1.0/120.0,
                        (ev) => {
    
                        pl.checkpoint = new Vector2(this.pos.x, this.pos.y+4);
    
                        this.destroyed = true;
                        this.progress.isNight = true;

                        this.resetCb(ev);
    
                    }, new Vector2(80,4));
                };
            }

        }, true);

    }


    playerEvent(pl, ev) {

        this.activated = this.progress.nightOrbActivated;

        this.deactivated = this.destroyed || (!this.activated &&
            this.progress.orbs < this.orbCount) ||
            (this.activated && this.floatPhase == 0);
    }

}
