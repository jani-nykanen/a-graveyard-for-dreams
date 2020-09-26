/**
 * The End of Journey
 * 
 * (c) 2020 Jani Nykänen
 */

import { Scene } from "./core/scene.js";


export class Game extends Scene {


    constructor(ev, param) {

        super(ev, param);

        // ...
    }


    refresh(ev) {

        // ...
    }


    dispose() {

        // ...
    }


    redraw(c) {

        c.moveTo(0, 0);

        c.clear(170, 170, 170);

        c.drawText(c.bitmaps["font"], "Hello world",
            1, 1, -1, 0, false);
    }
}
