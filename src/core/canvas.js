/**
 * The End of Journey
 * 
 * (c) 2020 Jani Nykänen
 */


import { Vector2 } from "./vector.js";
import { clamp } from "./util.js";


export const Flip = {

    None : 0,
    Horizontal : 1,
    Vertical : 2,
    Both : 1 | 2,
};


export class Canvas {


    constructor(width, height, bitmaps) {

        this.canvas = null;
        this.ctx = null;

        this.createHtml5Canvas(width, height);
        this.width = width;
        this.height = height;

        window.addEventListener("resize", 
            () => this.resize(window.innerWidth, 
                window.innerHeight));

        this.translation = new Vector2(0, 0);

        this.bitmaps = bitmaps == null ? {} : bitmaps;
    }


    colorString(r, g, b, a) {

        return "rgba(" + String(r|0) + "," + 
            String(g|0) + "," + 
            String(b|0) + "," + 
            String(a != undefined ? a : 1.0);
    }


    createHtml5Canvas(width, height) {

        let cdiv = document.createElement("div");
        cdiv.setAttribute("style", 
            "position: absolute; top: 0; left: 0; z-index: -1;");

        this.canvas = document.createElement("canvas");
        this.canvas.width = width;
        this.canvas.height = height;

        this.canvas.setAttribute(
            "style", 
            "position: absolute; top: 0; left: 0; z-index: -1;" + 
            "image-rendering: optimizeSpeed;" + 
            "image-rendering: pixelated;" +
            "image-rendering: -moz-crisp-edges;"
            );
        cdiv.appendChild(this.canvas);
        document.body.appendChild(cdiv);

        this.ctx = this.canvas.getContext("2d");
        this.ctx.imageSmoothingEnabled = false;

        this.resize(window.innerWidth, window.innerHeight);
    }


    resize(width, height) {

        let c = this.canvas;

        // Find the best multiplier for
        // square pixels
        let mul = Math.min(
            (width / c.width) | 0, 
            (height / c.height) | 0);

        let totalWidth = c.width * mul;
        let totalHeight = c.height * mul;
        let x = width/2 - totalWidth/2;
        let y = height/2 - totalHeight/2;

        let top = String(y | 0) + "px";
        let left = String(x | 0) + "px";

        c.style.width = String(totalWidth | 0) + "px";
        c.style.height = String(totalHeight | 0) + "px";
        
        c.style.top = top;
        c.style.left = left;
    }


    addBitmap(name, bmp) {

        this.bitmaps[name] = bmp;
    }


    setColor(r, g, b, a) {

        r = r == undefined ? 255 : r;
        g = g == undefined ? r : g;
        b = b == undefined ? g : b;
        let colorStr = this.colorString(r, g, b, a);

        this.ctx.fillStyle = colorStr;
        this.ctx.strokeStyle = colorStr;
    }


    clear(r, g, b) {

        this.ctx.fillStyle = this.colorString(r, g, b, 1.0);
        this.ctx.fillRect(0, 0, this.width, this.height);
    }


    drawBitmap(bmp, dx, dy, flip) {

        this.drawBitmapRegion(bmp, 
            0, 0, bmp.width, bmp.height,
            dx, dy, flip);
    }

    
    drawBitmapRegion(bmp, sx, sy, sw, sh, dx, dy, flip) {

        this.drawScaledBitmapRegion(bmp, sx, sy, sw, sh,
            dx, dy, sw, sh, flip);
    }


    drawScaledBitmapRegion(bmp, sx, sy, sw, sh, dx, dy, dw, dh, flip) {

        if (bmp == null || sw <= 0 || sh <= 0) 
            return;

        let c = this.ctx;

        dx += this.translation.x;
        dy += this.translation.y;

        sx |= 0;
        sy |= 0;
        sw |= 0;
        sh |= 0;

        dx |= 0;
        dy |= 0;
        dw |= 0;
        dh |= 0;

        flip = flip | Flip.None;
        
        if (flip != Flip.None) {
            c.save();
        }

        if ((flip & Flip.Horizontal) != 0) {

            c.translate(dw, 0);
            c.scale(-1, 1);
            dx *= -1;
        }
        if ((flip & Flip.Vertical) != 0) {

            c.translate(0, dh);
            c.scale(1, -1);
            dy *= -1;
        }

        c.drawImage(bmp, sx, sy, sw, sh, dx, dy, dw, dh);

        if (flip != Flip.None) {

            c.restore();
        }
    }


    drawText(font, str, dx, dy, xoff, yoff, center) {

        let cw = (font.width / 16) | 0;
        let ch = cw;

        let x = dx;
        let y = dy;
        let c;

        if (center) {

            dx -= (str.length * (cw + xoff))/ 2.0 ;
            x = dx;
        }

        for (let i = 0; i < str.length; ++ i) {

            c = str.charCodeAt(i);
            if (c == '\n'.charCodeAt(0)) {

                x = dx;
                y += ch + yoff;
                continue;
            }

            this.drawBitmapRegion(
                font, 
                (c % 16) * cw, ((c/16)|0) * ch,
                cw, ch, 
                x, y, false);

            x += cw + xoff;
        }
    }


    fillRect(x, y, w, h) {

        x += this.translation.x;
        y += this.translation.y;

        this.ctx.fillRect(x | 0, y | 0, w | 0, h | 0);
    }


    moveTo(x, y) {

        this.translation = new Vector2(x, y);
    }
    

    move(x, y) {

        this.translation.x += x;
        this.translation.y += y;
    }


    setGlobalAlpha(a) {

        this.ctx.globalAlpha = a == undefined ? 1.0 : clamp(a, 0, 1);
    }
}
