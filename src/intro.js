/**
 * A Graveyard for Fools
 * 
 * (c) 2020 Jani Nykänen
 */

import { Flip } from "./core/canvas.js";
import { Scene } from "./core/scene.js";
import { clamp } from "./core/util.js";
import { TitleScreen } from "./titlescreen.js";


const APPEAR_TIME = 30;
const WAIT_TIME = 60;
const INITIAL_WAIT = 10;


export class Intro extends Scene {


    constructor(ev, param) {

        super(ev, param);

        this.phase = 0;
        this.timer = -INITIAL_WAIT;
    }


    refresh(ev) {

        if (ev.input.anyPressed() &&
            this.timer >= APPEAR_TIME && this.timer < APPEAR_TIME + WAIT_TIME) {

            this.timer = APPEAR_TIME + WAIT_TIME;
        }

        this.timer += ev.step;
        if (this.timer >= APPEAR_TIME*2 + WAIT_TIME) {

            this.timer -= APPEAR_TIME*2 + WAIT_TIME;
            if ( (++ this.phase) == 2) {

                ev.changeScene(TitleScreen);
            }
        }
    }


    redraw(c) {

        c.clear(0, 0, 0);

        let bmp = c.bitmaps[this.phase == 0 ? "creator" : "musicBy"];

        let w = bmp.width;
        let h = bmp.height / 3;

        let frameTime = APPEAR_TIME / 4;
        let maxTime = APPEAR_TIME * 2 + WAIT_TIME;

        if (this.timer < frameTime || this.timer >= maxTime - frameTime)
            return;

        let frame = 2;
        if (this.timer < APPEAR_TIME) {

            frame = clamp(Math.round(this.timer / (APPEAR_TIME / 4)) -1, 0, 2);
        }
        else if (this.timer >= maxTime - APPEAR_TIME) {

            frame = clamp(
                2 - (Math.round( (this.timer - (maxTime - APPEAR_TIME)) / (APPEAR_TIME / 4)) -1),
                0, 2);
        }

        c.drawBitmapRegion(bmp, 0, frame * h, w, h,
            c.width/2 - w/2, c.height/2 - h/2, Flip.None);
    }

}
