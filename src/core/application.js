/**
 * A Graveyard for Fools
 * 
 * (c) 2020 Jani Nykänen
 */


import { Canvas } from "./canvas.js";
import { InputManager } from "./input.js";
import { Scene } from "./scene.js";
import { AssetPack } from "./assets.js";
import { AudioPlayer } from "./audioplayer.js";
import { Transition } from "./transition.js";


export class Application {


    constructor(canvasWidth, canvasHeight, frameSkip) {

        this.oldTime = 0;
        this.timeSum = 0;

        this.waitTimer = 0;

        this.audio = new AudioPlayer();
        this.assets = new AssetPack(this.audio);
        this.canvas = new Canvas(canvasWidth, canvasHeight, 
            this.assets.bitmaps);
        this.tr = new Transition();

        this.ev = {

            step: frameSkip + 1,
            assets: this.assets,
            audio: this.audio,
            tr: this.tr,
            input: new InputManager()
                .addAction("left", "ArrowLeft", 14, null)
                .addAction("up", "ArrowUp", 12, null)
                .addAction("right", "ArrowRight", 15, null)
                .addAction("down", "ArrowDown", 13, null),

            
            changeScene: scene => this.changeScene(scene),
            wait: time => {this.waitTimer = time;}
        };

        this.activeScene = new Scene(this.ev, null);

        this.sceneInitialized = false;
        this.initialScene = this.activeScene;
    }


    drawLoadingScreen(c) {

        let barWidth = c.width / 4;
        let barHeight = barWidth / 8;

        c.clear(0, 0, 0);
    
        let t = this.assets.dataLoadedPercentage();
        let x = c.width/2 - barWidth/2;
        let y = c.height/2 - barHeight/2;

        x |= 0;
        y |= 0;
    
        // Outlines
        c.setColor(255, 255, 255);
        c.fillRect(x-2, y-2, barWidth+4, barHeight+4);
        c.setColor(0);
        c.fillRect(x-1, y-1, barWidth+2, barHeight+2);
    
        // Bar
        let w = (barWidth*t) | 0;
        c.setColor(255);
        c.fillRect(x, y, w, barHeight);
    }


    loop(ts) {

        const MAX_REFRESH_COUNT = 5;
        const FRAME_WAIT = 16.66667 * this.ev.step;

        this.timeSum += ts - this.oldTime;
        this.timeSum = Math.min(MAX_REFRESH_COUNT * FRAME_WAIT, this.timeSum);
        this.oldTime = ts;

        let refreshCount = (this.timeSum / FRAME_WAIT) | 0;
        //let firstFrame = true;

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

            this.canvas.update(this.ev);
            this.tr.update(this.ev);

            // TODO: Check if "firstFrame" needed when using
            // a gamepad and framerate below 60 (that is
            // play the game on your laptop with a controller!)
            //if (firstFrame)
                this.ev.input.preUpdate();

            if (assetsLoaded) {

                if (this.waitTimer <= 0) {

                    this.activeScene.refresh(this.ev);
                }
                else {

                    this.waitTimer -= this.ev.step;
                }
            }
            
            //if (firstFrame)
                this.ev.input.postUpdate();
                
            //firstFrame = false;

            this.timeSum -= FRAME_WAIT;
        } 

        if (this.assets.hasLoaded()) {

            this.tr.preDraw(this.canvas);
            this.activeScene.redraw(this.canvas);
            this.tr.draw(this.canvas);
        }
        else
            this.drawLoadingScreen(this.canvas);

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


    changeScene(scene) {

        let param = this.activeScene.dispose();

        this.activeScene = new scene.prototype.constructor(this.ev, param);
    }

} 
