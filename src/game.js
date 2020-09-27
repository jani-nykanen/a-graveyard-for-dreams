import { Camera } from "./camera.js";
/**
 * The End of Journey
 * 
 * (c) 2020 Jani Nykänen
 */

import { Scene } from "./core/scene.js";
import { Vector2 } from "./core/vector.js";
import { Stage } from "./stage.js";


export class Game extends Scene {


    constructor(ev, param) {

        super(ev, param);

        this.cam = new Camera(5, 3, 160, 144);
        this.stage = new Stage(ev.assets.tilemaps["base"]);
    }


    refresh(ev) {

        const EPS = 0.25;
        const SPEED = 1.0 / 20.0;

        this.stage.update(ev);
        this.cam.update(ev);

        let s = ev.input.stick;
        // TEMP
        if (s.x > EPS)
           this.cam.move(1, 0, SPEED);
        else if (s.x < -EPS)
            this.cam.move(-1, 0, SPEED);   
        else if (s.y > EPS)
            this.cam.move(0, 1, SPEED);
        else if (s.y < -EPS)
            this.cam.move(0, -1, SPEED);   
           
    }


    dispose() {

        // ...
    }


    redraw(c) {

        c.moveTo(0, 0);
        c.clear(0, 85, 170);

        this.cam.use(c);
        this.stage.draw(c, this.cam);

        c.moveTo();
        c.drawText(c.bitmaps["font"], "v.0.0.1",
            1, 1, -2, 0, false);
    }
}
