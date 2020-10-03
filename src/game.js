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

        this.stage.update(ev);
        this.objects.update(this.cam, this.stage, ev);
        this.cam.update(ev);
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
        c.drawText(c.bitmaps["font"], "v.0.1.0",
            1, 1, -2, 0, false);
    }
}
