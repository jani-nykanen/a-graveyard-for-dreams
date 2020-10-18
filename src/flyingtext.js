/**
 * The End of Journey
 * 
 * (c) 2020 Jani Nykänen
 */

import { Vector2 } from "./core/vector.js";


export class FlyingText {


    constructor() {

        this.pos = new Vector2(0, 0);
        this.speed = 0;
        this.text = "";
        this.moveTime = 0;
        this.waitTime = 0;

        this.exist = false;
    }


    spawn(x, y, speed, moveTime, waitTIme, text) {

        this.pos = new Vector2(x, y);
        this.speed = speed;
        this.moveTime = moveTime;
        this.waitTime = waitTIme;
        this.text = text;

        this.exist = true;
    }


    update(ev) {

        if (!this.exist) return;

        if (this.moveTime > 0) {

            this.moveTime -= ev.step;
            this.pos.y -= this.speed;
        }
        else {

            if ((this.waitTime -= ev.step) <= 0) {

                this.exist = false;
            }
        }
    }


    draw(c) {

        if (!this.exist) return;

        c.drawText(c.bitmaps["spcfont"], this.text,
            this.pos.x | 0, (this.pos.y - 4) | 0,
            -4, 0, true);
    }
}
