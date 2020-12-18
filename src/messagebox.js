/**
 * A Graveyard for Dreams
 * 
 * (c) 2020 Jani Nykänen
 */


import { Vector2 } from "./core/vector.js";
import { Menu, MenuButton } from "./menu.js";
import { drawBoxWithOutlines } from "./misc.js";


export class MessageBox {


    constructor(ev) {

        let loc = ev.assets.localization["en"]; 

        this.queue = new Array();
        this.sizes = new Array();

        this.char = 0;
        this.charTimer = 0;
        this.charPos = 0;
        this.active = false;

        this.endSymbolWave = 0.0;

        this.accept = false;
        this.acceptCb = (ev) => {};
        
        this.ready = false;
        this.startEvent = (ev) => true;

        this.confirmationMenu = new Menu(
            12, true,
            [
                new MenuButton(loc["yes"], (ev) => {

                    this.deactivate();
                    this.acceptCb(ev);
                    
                }, false),
                new MenuButton(loc["no"], (ev) => {

                    this.deactivate();
                    
                }, true)
            ]
        );
        this.confirm = false;
        this.finished = false;
    }


    computeBoxSize(msg) {

        const WIDTH_MUL = 8;
        const HEIGHT_MUL = 10;

        let r = new Vector2(0, 0);

        let lines = msg.split('\n').map(l => l.length);

        r.x = Math.max(...lines) * WIDTH_MUL;
        r.y = lines.length * HEIGHT_MUL;

        return r;
    }


    addMessage(message) {

        let str = "";
        if (message.charCodeAt(message.length-1) == "\n".charCodeAt(0)) {

            str = message.substr(0, message.length-1);
        }
        else {

            str = message;
        }

        this.queue.push(str);
        this.sizes.push(this.computeBoxSize(str));

        return this;
    }


    addStartCondition(cb) {

        this.startEvent = cb;

        return this;
    }



    activate(acceptCb, confirm) {

        this.active = true;
        this.charTimer = 0;
        this.charPos = 0;
        this.queuePos = 0;

        this.accept = false;
        this.acceptCb = acceptCb;
        
        this.ready = false;
        this.confirm = confirm;
        this.finished = false;

        this.confirmationMenu.activate(1);
    }


    update(ev) {

        const FLOAT_SPEED = 0.1;
        const CHAR_WAIT = 2;

        if (!this.active) return;

        let action = ev.input.anyPressed();
        let c;

        if (!this.ready) {

            this.ready = this.startEvent(ev);
            if (!this.ready)
                return;
        }

        this.finished = this.charPos == this.queue[0].length &&
            this.queue.length == 1;

        if (this.charPos < this.queue[0].length) {

            // Skip to the last character if anything pressed
            if (action) {

                this.charPos = this.queue[0].length;
            }
            // or wait
            else {

                if ((this.charTimer += 1.0 * ev.step) >= CHAR_WAIT) {

                    this.charTimer -= CHAR_WAIT;
                    ++ this.charPos;

                    c = this.queue[0].charCodeAt(this.charPos);
                    if (this.charPos < this.queue[0].length && 
                        c == '\n') {

                        ++ this.charPos;
                    }
                }
            }
        }
        else {

            if (this.queue.length == 1 && this.confirm) {

                this.confirmationMenu.update(ev);
            }
            else { 
                
                if (action) {

                    this.queue.shift();
                    this.sizes.shift();

                    this.charPos = 0;
                    this.charTimer = 0;

                    ev.audio.playSample(ev.assets.samples["next"], 0.60);

                    if (this.queue.length == 0) {

                        this.deactivate();
                        if (this.acceptCb != null) {

                            this.acceptCb(ev);
                        }
                        // this.deactivate();
                    }

                }

                this.endSymbolWave = 
                    (this.endSymbolWave + FLOAT_SPEED*ev.step) % 
                    (Math.PI*2);
            }
        }
    }


    draw(c, drawBox) {

        const CORNER_OFF = 2;
        const TEXT_OFF_X = 0;
        const TEXT_OFF_Y = 2;
        const SYMBOL_AMPLITUDE = 1.0;

        if (!this.active || !this.ready) 
            return;

        let w = this.sizes[0].x + CORNER_OFF*2;
        let h = this.sizes[0].y + CORNER_OFF*2;

        let tx = c.width/2 - w/2;
        let ty = c.height/2 - h/2;

        if (drawBox) {

            drawBoxWithOutlines(c, tx, ty, w, h);
        }
        c.drawText(c.bitmaps.font, 
            this.queue[0].substr(0, this.charPos),
            tx + CORNER_OFF, ty + CORNER_OFF,
            TEXT_OFF_X, TEXT_OFF_Y, false);

        let x, y, cw, ch;

        // "Yes"/"No"
        if (this.finished && this.confirm) {

            x = tx + w - 20;
            y = ty + h + 14;

            cw = 36;
            ch = 24;

            drawBoxWithOutlines(c, x - cw/2, y - ch/2 -2, cw, ch);
            this.confirmationMenu.draw(c, x, y);
        }
        // "Ready" symbol
        else if (this.charPos == this.queue[0].length) {

            y = Math.round(Math.sin(this.endSymbolWave) * SYMBOL_AMPLITUDE) | 0;
            c.drawBitmapRegion(
                c.bitmaps["font"], 
                24, 0, 8, 8,
                tx + w - 8, 
                ty + h - 4 + y, false);
        }

    }


    deactivate() {

        this.active = false;

        this.startEvent = (ev) => true;

        this.queue.length = 0;
        this.sizes.length = 0;
    }
}
