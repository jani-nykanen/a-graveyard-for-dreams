/**
 * The End of Journey
 * 
 * (c) 2020 Jani Nykänen
 */


import { Canvas } from "./canvas.js";
import { InputManager } from "./input.js";
import { Scene } from "./scene.js";
import { AssetPack } from "./assets.js";


export class Application {


    constructor(canvasWidth, canvasHeight, frameSkip) {

        this.oldTime = 0;
        this.timeSum = 0;

        this.assets = new AssetPack();
        this.canvas = new Canvas(canvasWidth, canvasHeight, 
            this.assets.bitmaps);

        this.ev = {

            step: frameSkip + 1,
            asset: this.assets,
            input: new InputManager()
                .addAction("left", "ArrowLeft")
                .addAction("up", "ArrowUp")
                .addAction("right", "ArrowRight")
                .addAction("down", "ArrowDown")
        };

        this.activeScene = new Scene(this.ev);

        this.sceneInitialized = false;
        this.initialScene = this.activeScene;
    }


    loop(ts) {

        const MAX_REFRESH_COUNT = 5;
        const FRAME_WAIT = 16.66667 * this.ev.step;

        this.timeSum += ts - this.oldTime;
        this.timeSum = Math.min(MAX_REFRESH_COUNT * FRAME_WAIT, this.timeSum);
        this.oldTime = ts;

        let refreshCount = (this.timeSum / FRAME_WAIT) | 0;
        let firstFrame = true;

        let assetsLoaded = this.assets.hasLoaded();
        // Do not initialize the initial scene until all the
        // assets have been loaded
        if (assetsLoaded && !this.sceneInitialized) {

            this.activeScene = new this.initialScene
                .prototype
                .constructor(this.ev, null);
            this.initialScene = null;
            this.sceneInitialized = true;
        }

        while ((refreshCount --) > 0) {

            if (assetsLoaded) 
                this.activeScene.refresh(this.ev);
            
            // TODO: We could call this each frame as well,
            // (see how "update" works) I think? Check this
            if (firstFrame) {

                this.ev.input.update();
                firstFrame = false;
            }

            this.timeSum -= FRAME_WAIT;
        } 

        if (this.assets.hasLoaded())
            this.activeScene.redraw(this.canvas);
        else
            // TODO: Loading screen
            this.canvas.clear(0, 0, 0);

        window.requestAnimationFrame(
            (ts) => this.loop(ts)
        );
    }


    loadAssets(path) {

        this.assets.load(path);

        return this;
    }


    addActions(arr) {

        for (let o of arr) {

            this.ev.input.addAction(o.name, o.key, o.button1, o.button2);
        }

        return this;
    }


    run(initialScene) {

        this.initialScene = initialScene;
        this.sceneInitialized = false;

        this.loop(0);
    }

} 
