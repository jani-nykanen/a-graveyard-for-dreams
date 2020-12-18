/**
 * A Graveyard for Dreams
 * 
 * (c) 2020 Jani Nykänen
 */

import { Flip } from "./core/canvas.js";
import { Scene } from "./core/scene.js";
import { Sprite } from "./core/sprite.js";
import { MessageBox } from "./messagebox.js";


export class Ending extends Scene {


    constructor(ev, param) {

        super(ev, param);

        this.phase = 0;
        this.sprImage = new Sprite(96, 64);
        this.sprImage.frame = -1;

        this.sprText = new Sprite(96, 32);
        this.sprText.setFrame(-1, 2);

        let loc = ev.assets.localization["en"];
        
        this.message = new MessageBox(ev);
        for (let m of loc["ending"]) {

            this.message.addMessage(m);
        }
    }


    refresh(ev) {

        const APPEAR_SPEED = 10;

        if (this.phase == 0) {

            this.sprImage.animate(0, 0, 3, APPEAR_SPEED, ev.step);
            if (this.sprImage.frame == 3) {

                ++ this.phase;
                this.message.activate((ev) => {

                    ++ this.phase;
                    ev.audio.fadeInMusic(ev.assets.samples["titleScreen"], 0.15, 2000);
                });
            }
        }
        else if (this.phase == 1) {

            this.message.update(ev);
        }
        else if (this.phase == 2) {

            this.sprText.animate(2, -1, 3, APPEAR_SPEED, ev.step);
            if (this.sprText.frame == 3) {

                ++ this.phase;
            }
        }
    }


    redraw(c) {

        const IMAGE_Y = 64;
        const TEXT_Y = 16;

        c.clear(255, 255, 255);

        if (this.sprImage.frame > 0) {

            this.sprImage.draw(c, c.bitmaps["ending"],
                c.width/2 - this.sprImage.width/2, IMAGE_Y, Flip.None);
        }

        if (this.message.active) {

            c.setColor(170, 170, 170);
            c.fillRect(7, 26, 146, 28);

            c.moveTo(0, -32);
            this.message.draw(c, false);
            c.moveTo(0, 0);
        }

        if (this.sprText.frame > 0) {

            this.sprText.draw(c, c.bitmaps["ending"],
                c.width/2 - this.sprText.width/2, TEXT_Y, Flip.None);
        }
    }

}
