/**
 * The End of Journey
 * 
 * (c) 2020 Jani Nykänen
 */

import { Vector2 } from "./core/vector.js";


export class Hitbox {


    constructor(w, h) {

        this.width = w;
        this.height = h;

        this.pos = new Vector2(0, 0);
        
        this.active = false;

        // Every attack has its own id, so the same
        // attack won't hurt enemies twice
        this.id = 0;
    }


    activate(x, y) {

        this.pos.x = x;
        this.pos.y = y;

        this.active = true;

        ++ this.id;
    }


    deactivate() {

        if (!this.active) return;

        // Something else might happen here later?
        this.active = false;
    }


    overlay(x, y, w, h) {

        let px = this.pos.x + this.center.x - this.width/2;
        let py = this.pos.y + this.center.y - this.height/2;

        return px + this.width >= x && px < x+w &&
               py + this.height >= y && py < y+h;
    }
}
