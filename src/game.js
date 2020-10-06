import { Camera } from "./camera.js";
/**
 * The End of Journey
 * 
 * (c) 2020 Jani Nykänen
 */

import { Scene } from "./core/scene.js";
import { Stage } from "./stage.js";
import { ObjectManager } from "./objectmanager.js";
import { GameProgress } from "./progress.js";


export class Game extends Scene {


    constructor(ev, param) {

        super(ev, param);

        this.stage = new Stage(ev.assets);
        this.cam = new Camera(0, 0, 160, 144,
            (this.stage.width/10) | 0,
            (this.stage.height/9) | 0,
            true);

        this.progress = new GameProgress();

        this.objects = new ObjectManager(this.progress);
        this.stage.parseObjects(this.objects);
        this.objects.positionCamera(this.cam);
        
    }


    drawHUD(c) {

        let bmp = c.bitmaps["font"];

        let x;
        for (let i = 0; i < this.progress.maxHealth; ++ i) {

            x = ((i / 2) | 0)*9;

            // Gray
            if (i % 2 == 0) {

                c.drawBitmapRegion(bmp, 40, 0, 8, 8,
                    1 + x, 1);
            }

            // Red
            if (this.progress.health > i) {

                c.drawBitmapRegion(bmp, 32 + (i % 2)*4, 0, 4, 8,
                    1 + x + (i % 2) * 4, 1);
            }
        }
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
        this.drawHUD(c);
    }
}
