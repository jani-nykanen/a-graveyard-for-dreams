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


export class Door extends InteractableObject {


    constructor(x, y, inside, id) {

        super(x, y);

        this.active = false;

        this.inside = inside;
        this.link = null;

        this.spr = new Sprite(32, 32);
        this.hitbox = new Vector2(8, 32);

        this.id = id;

        this.isDoor = true;

        this.open = inside;
        this.opened = inside;
    }


    linkDoor(o) {

        this.link = o;
    }


    update(ev) {

        const OPEN_SPEED = 8;

        this.disabled = this.open && !this.opened;
        if (this.disabled) {

            this.spr.animate(0, 0, 4, OPEN_SPEED, ev.step);
            this.opened = this.spr.frame == 4;
        }
        this.noActivationSound = this.open && this.opened;
    }


    drawInstance(c) {

        if (!this.inCamera || this.opened) return;

        this.spr.draw(c, c.bitmaps["door"],
            this.pos.x-16, this.pos.y-16,
            Flip.None);
    }

    
    triggerEvent(message, pl, cam, ev) {

        const WAIT_TIME = 32;
        const FINAL_THEME_VOLUME = 0.33;

        let loc = ev.assets.localization["en"];

        if (!this.open) {

            if (pl.progress.keys <= 0) {

                message.addMessage(loc["needKey"]).activate(ev => {}, false);
                return;
            }

            message.addMessage(
                loc["openDoor"],
                ).activate((ev) => {

                this.open = true;
                this.opened = false;
                pl.progress.addKeys(-1);
                pl.progress.markDoorOpened(this.id);

                pl.forceWait(WAIT_TIME);

                // Sound effect
                ev.audio.playSample(ev.assets.samples["open"], 0.80);

            }, true);
            return;
        }     

        if (pl.progress.isIntro) {

            ev.audio.stopMusic();
        }

        ev.tr.activate(true, TransitionType.CircleOutside, 
            1.0/30.0, 
            (ev) => {

            let p = this.link.pos.clone();
            p.y += 8;

            pl.moveTo(p, cam);
            pl.setDoorPose(true);

            if (pl.progress.isIntro) {

                pl.progress.isInFinalRoom = true;

                ev.audio.fadeInMusic(ev.assets.samples["finalboss"], FINAL_THEME_VOLUME, 2000);
            }

            ev.tr.setCenter(pl.pos.x % 160, pl.pos.y % 144);

        }, null, new RGB(0, 0, 0));
        ev.tr.setCenter(this.pos.x % 160, this.pos.y % 144);

        pl.pos.x = this.pos.x;

        pl.setDoorPose(false);

        // Sound effect
        ev.audio.playSample(ev.assets.samples["door"], 0.70);
    }


    initialCheck(progress) {

        if (progress.isIntro) {

            if (this.inside) {

                this.disabled = true;
                this.deactivated = true;
                return;
            }

            this.opened = true;
            this.open = true;
            return;
        }

        this.open = progress.isDoorOpened(this.id);
        this.opened = this.open;
    }

}
