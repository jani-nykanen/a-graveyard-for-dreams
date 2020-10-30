/**
 * A Graveyard for Fools
 * 
 * (c) 2020 Jani Nykänen
 */

import { Scene } from "./core/scene.js";
import { Stage } from "./stage.js";
import { ObjectManager } from "./objectmanager.js";
import { GameProgress } from "./progress.js";
import { Camera } from "./camera.js";
import { State } from "./core/input.js";
import { TransitionType } from "./core/transition.js";
import { RGB } from "./core/vector.js";
import { MessageBox } from "./messagebox.js";


export class Game extends Scene {


    constructor(ev, param) {

        super(ev, param);

        this.stage = new Stage(ev.assets);
        this.cam = new Camera(0, 0, 160, 144,
            (this.stage.width/10) | 0,
            (this.stage.height/9) | 0,
            true);

        this.progress = new GameProgress();

        this.message = new MessageBox();
        this.objects = new ObjectManager(this.progress);
        this.stage.parseObjects(this.objects);
        this.objects.positionCamera(this.cam);
        
        this.paused = false;

        // Test
        ev.audio.playMusic(ev.assets.samples["testTrack"], 0.60);

        ev.tr.activate(false, TransitionType.CircleOutside, 
            1.0/30.0, null, new RGB(0, 0, 0));
        this.objects.centerTransition(ev.tr);
        this.objects.initialCheck(this.cam);
    }


    reset(ev) {

        this.stage.reset();
        this.objects.reset(this.stage);
        this.cam.reset();
        this.objects.positionCamera(this.cam);
        this.objects.centerTransition(ev.tr);
        this.objects.initialCheck(this.cam);
        this.progress.reset();

        // Test
        ev.audio.playMusic(ev.assets.samples["testTrack"], 0.60);
    }


    drawHUD(c) {

        const SIDE_OFFSET = 2;

        let bmp = c.bitmaps["font"];

        // Life
        let x;
        for (let i = 0; i < this.progress.maxHealth; ++ i) {

            x = ((i / 2) | 0)*9;

            // Gray
            if (i % 2 == 0) {

                c.drawBitmapRegion(bmp, 40, 0, 8, 8,
                    1 + x + SIDE_OFFSET, 2);
            }

            // Red
            if (this.progress.health > i) {

                c.drawBitmapRegion(bmp, 32 + (i % 2)*4, 0, 4, 8,
                    1 + x + SIDE_OFFSET + (i % 2) * 4, 2);
            }
        }

        // Money
        let str = String.fromCharCode(6) + 
            String.fromCharCode(2) + 
            String(this.progress.coins);

        x = str.length * 8 + SIDE_OFFSET;

        c.drawText(c.bitmaps["font"], str, c.width - x, 2, 0, 0, false);
    }


    refresh(ev) {

        if (ev.tr.active) return;

        if (this.message.active) {

            this.message.update(ev);
            return; 
        }

        // TEMP
        if (ev.input.actions["start"].state == State.Pressed) {

            this.paused = !this.paused;
            if (this.paused)
                ev.audio.pauseMusic();
            else
                ev.audio.resumeMusic();

            // Sound effect
			ev.audio.playSample(ev.assets.samples["pause"], 0.60);
        }

        if (this.paused) {
            
            return;
        }

        this.stage.update(this.cam, ev);
        if (!this.objects.update(this.cam, this.stage, this.message, ev)) {

            ev.tr.activate(true, TransitionType.CircleOutside, 
                1.0/30.0, 
                (ev) => this.reset(ev), 
                new RGB(0, 0, 0));
            this.objects.centerTransition(ev.tr);

            return;
        }
        this.cam.update(ev);
    }


    dispose() {

        // ...
    }


    redraw(c) {

        c.moveTo(0, 0);
        
        this.stage.drawBackground(c, this.cam);

        this.cam.use(c);
        if (!this.paused)
            c.applyShake();

        this.stage.draw(c, this.cam);
        this.objects.draw(c);

        c.moveTo();
        this.drawHUD(c);

        if (this.paused) {

            c.setColor(0, 0, 0, 0.67);
            c.fillRect(0, 0, c.width, c.height);

            c.drawText(c.bitmaps["font"], "PAUSED",
                c.width/2, c.height/2-4, 0, 0, true);
        }

        if (this.message.active) {

            c.moveTo(0, 0);
            this.message.draw(c, true);
        }
    }
}
