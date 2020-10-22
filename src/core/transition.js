/**
 * A Graveyard for Fools
 * 
 * (c) 2020 Jani Nykänen
 */


import { RGB, Vector2 } from "./vector.js";


export const TransitionType = {

    Empty: -1,
    Fade: 0,
    CircleOutside: 1,
}


export class Transition {


    constructor() {

        this.timer = 0;
        this.cb = (ev) => {};
        this.color = new RGB();
        this.active = false;
        this.speed = 1;
        this.fadeIn = false;
        this.mode = TransitionType.Fade;
        this.param = 0;

        this.center = new Vector2(80, 72);
    }


    activate(fadeIn, mode, speed, cb, param, color) {

        if (color == null) {

            this.color = new RGB();
        }
        else {

            this.color = color.clone();
        }

        this.param = param;

        this.fadeIn = fadeIn;
        this.speed = speed;
        this.timer = 1.0;
        this.cb = cb;
        this.mode = mode;

        this.active = true;
    }


    setCenter(cx, cy) {

        this.center = new Vector2(cx, cy);
    }


    update(ev) {

        if (!this.active) return;

        if ((this.timer -= this.speed * ev.step) <= 0) {

            if ((this.fadeIn = !this.fadeIn) == false) {

                this.timer += 1.0;
                this.cb(ev);
            }
            else {

                this.active = false;
                this.timer = 0;
            }
        }
    }


    draw(c) {

        if (!this.active || this.mode == -1) 
            return;

        c.moveTo(0, 0);

        let t = this.timer;
        if (this.fadeIn)
            t = 1.0 - t;

        let maxRadius = 0;
        let r;

        let cx = this.center.x;
        let cy = this.center.y;

        switch(this.mode) {

        case TransitionType.Fade:

            // TODO: Implement dithering here

            if (this.param != null) {

                t = Math.round(t * this.param) / this.param;
            }

            c.setColor(this.color.r, this.color.g, this.color.b, t);
            c.fillRect(0, 0, c.width, c.height);
            
            break;

        case TransitionType.CircleOutside:

            maxRadius = Math.max(
                Math.hypot(cx, cy),
                Math.hypot(c.width-cx, cy),
                Math.hypot(c.width-cx, c.height-cy),
                Math.hypot(cx, c.height-cy)
            );
            
            r = (1-t) * maxRadius;
            c.setColor(this.color.r, this.color.g, this.color.b);
            c.fillCircleOutside(r, cx, cy);

            break;

        default:
            break;
        }

        c.setColor();
    }


    disable() {

        this.active = false;
    }
}
