/**
 * A Graveyard for Dreams
 * 
 * (c) 2020 Jani Nykänen
 */


import { Flip } from "./canvas.js";
import { RGB, Vector2 } from "./vector.js";


export const TransitionType = {

    Empty: -1,
    Fade: 0,
    CircleOutside: 1,
    VerticalBar: 2,
    HorizontalWaves: 3,
    CircleInside: 4,
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

        this.canvasCopied = false;
        this.canvasCopy = document.createElement("canvas");
        this.canvasCopy.getContext("2d").imageSmoothingEnabled = false;
        
        // Temp(?)
        this.copyCanvas.width = 160;
        this.copyCanvas.height = 144;
        
    }


    activate(fadeIn, mode, speed, cb, param, color) {

        if (color == undefined) {

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
        this.canvasCopied = false;
    }


    setCenter(cx, cy) {

        this.center = new Vector2(cx, cy);
    }


    update(ev) {

        if (!this.active) return;

        if ((this.timer -= this.speed * ev.step) <= 0) {

            // Why did I write it this way...
            // but I'm afraid to touch it!
            if ((this.fadeIn = !this.fadeIn) == false) {

                this.timer += 1.0;
                this.cb(ev);

                this.canvasCopied = false;
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

        if (!this.canvasCopied && this.active &&
            this.mode == TransitionType.HorizontalWaves &&
            !this.fadeIn) {

            this.copyCanvas(c);
        }

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
            c.setColor(this.color.r, this.color.g, this.color.b, 1.0);
            c.fillCircleOutside(r, cx, cy);

            break;

        case TransitionType.VerticalBar:

            r = Math.round(c.height/2 * t);
            c.setColor(this.color.r, this.color.g, this.color.b);
            c.fillRect(0, 0, c.width, r);
            c.fillRect(0, c.height-r, c.width, r);

            break;

        case TransitionType.HorizontalWaves:

            c.clear(0, 0, 0);

            //c.setColor(255, 0, 0);
            for (let y = 0; y < this.copyCanvas.height; ++ y) {

                r = Math.sin(((y / this.canvasCopy.height) * this.param.y + t) * Math.PI*2) * this.param.x * t;
                c.drawBitmapRegion(this.canvasCopy, 0, y, this.canvasCopy.width, 1,
                    -r, y, Flip.None);

                //c.fillRect(-r, y, 160, 1);
            }

            break;

        case TransitionType.CircleInside:

            // TODO: Repeating code, oh noes
            maxRadius = Math.max(
                Math.hypot(cx, cy),
                Math.hypot(c.width-cx, cy),
                Math.hypot(c.width-cx, c.height-cy),
                Math.hypot(cx, c.height-cy)
            );
            
            r = t * maxRadius;
            c.setColor(this.color.r, this.color.g, this.color.b, 1.0);
            c.fillCircle(r, cx, cy);

            break;

        default:
            break;
        }

        c.setColor();
    }


    deactivate() {

        this.active = false;
    }


    copyCanvas(c) {

        this.canvasCopy.width = c.width;
        this.canvasCopy.height = c.height;

        this.canvasCopy.getContext("2d").drawImage(c.canvas,
            0, 0);

        this.canvasCopied = true;
    }


    preDraw(c) {

        if (!this.canvasCopied && this.active &&
            this.mode == TransitionType.HorizontalWaves &&
            this.fadeIn) {

            this.copyCanvas(c);
        }
    }
}
