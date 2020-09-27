/**
 * The End of Journey
 * 
 * (c) 2020 Jani Nykänen
 */

import { Scene } from "./core/scene.js";
import { Vector2 } from "./core/vector.js";


export class Game extends Scene {


    constructor(ev, param) {

        super(ev, param);

        this.testPos = new Vector2(80, 72);
    }


    refresh(ev) {

        this.testPos.x += ev.input.stick.x;
        this.testPos.y += ev.input.stick.y;
    }


    dispose() {

        // ...
    }


    redraw(c) {

        c.moveTo(0, 0);

        c.clear(170, 170, 170);

        c.moveTo(this.testPos.x, this.testPos.y);
        c.setColor(255, 85, 0);
        c.fillRect(-8, -8, 16, 16);
        c.moveTo();

        c.drawText(c.bitmaps["font"], "Hello world",
            1, 1, -1, 0, false);
    }
}
