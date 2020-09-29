import { Camera } from "./camera.js";
/**
 * The End of Journey
 * 
 * (c) 2020 Jani Nykänen
 */

import { Scene } from "./core/scene.js";
import { Stage } from "./stage.js";
import { ObjectManager } from "./objectmanager.js";


export class Game extends Scene {


    constructor(ev, param) {

        super(ev, param);

        this.stage = new Stage(ev.assets);
        this.cam = new Camera(0, 0, 160, 144,
            (this.stage.width/10) | 0,
            (this.stage.height/9) | 0,
            true, false);

        this.objects = new ObjectManager();
        this.stage.parseObjects(this.objects);
        this.objects.positionCamera(this.cam);
    }


    refresh(ev) {

        // const EPS = 0.25;
        // const SPEED = 1.0 / 20.0;

        this.stage.update(ev);
        this.objects.update(this.cam, this.stage, ev);
        this.cam.update(ev);

        /*
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
        */
    }


    dispose() {

        // ...
    }


    redraw(c) {

        c.moveTo(0, 0);
        
        this.stage.drawBackground(c, this.cam);

        this.cam.use(c);
        this.stage.draw(c, this.cam);
        this.objects.draw(c);

        c.moveTo();
        c.drawText(c.bitmaps["font"], "v.0.0.1",
            1, 1, -2, 0, false);
    }
}
