
/**
 * A Graveyard for Fools
 * 
 * (c) 2020 Jani Nykänen
 */


import { Flip } from "./core/canvas.js";
import { Sprite } from "./core/sprite.js";
import { Vector2 } from "./core/vector.js";
import { GameObject } from "./gameobject.js";


export class NightStar extends GameObject {


    constructor(x, y, id) {

        super(x, y);

        this.startPos = this.pos.clone();

        this.id = id;

        this.hitbox = new Vector2(16, 16);

        this.waveTimer = 0.0;

        this.exist = true;
        
        this.spr = new Sprite(16, 16);
    }


    die(ev) {

        this.spr.animate(0, 0, 4, 5, ev.step);

        return this.spr.frame == 4;
    }


    checkIfInCamera(cam) {

        this.inCamera = 
            (this.inCamera && cam.isLooping && cam.moving) ||
            cam.isObjectInside(this);
    }


    updateLogic(ev) {

        const WAVE_SPEED = 0.05;
        const AMPLITUDE = 4;

        // This, my friend, is the correct way to do things
        this.pos.y = this.startPos.y + 
            Math.sin(
                this.waveTimer = (this.waveTimer + WAVE_SPEED*ev.step) % (Math.PI*2)
            ) * AMPLITUDE;
    }


    drawInstance(c) {

        this.spr.draw(c, c.bitmaps["star"], 
            Math.round(this.pos.x) - 8,
            Math.round(this.pos.y) - 8, Flip.None);
    }


    draw(c, cam) {

        if (!this.exist || !this.inCamera) return;

        let dx = cam.screenCountX * cam.width;
        let start = 0;
        let end = 0;
        
        if (cam.moving && cam.isLooping) {

            start = -1;
            end = 1;
        }
        
        for (let i = start; i <= end; ++ i) {

            c.move(i * dx, 0);
            this.drawInstance(c);
            c.move(-i * dx, 0);
        }
    }


    playerCollision(pl, ev) {

        if (!this.exist || !this.inCamera || pl.dying) return;
        
        if (this.overlayObject(pl)) {

            pl.progress.markStarCollected(this.id);

            this.dying = true;
        }
    }


    initialCheck(progress) {

        if (progress.hasStar(this.id)) {

            this.exist = false;
        }
    }
}