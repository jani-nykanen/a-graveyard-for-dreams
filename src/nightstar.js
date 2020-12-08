
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


    constructor(x, y, id, bulletCb) {

        super(x, y);
        
        this.startPos = this.pos.clone();
        this.id = id;
        this.hitbox = new Vector2(16, 16);

        this.exist = true;
        
        this.spr = new Sprite(16, 16);
    
        this.bulletCb = bulletCb;
    }


    die(ev) {

        this.spr.animate(1, 0, 3, 5, ev.step);

        return this.spr.frame == 3;
    }


    checkIfInCamera(cam) {

        this.inCamera = 
            (this.inCamera && cam.isLooping && cam.moving) ||
            cam.isObjectInside(this);
    }


    updateLogic(ev) {

        this.spr.animate(0, 0, 3, 12, ev.step);
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


    spawnBullets() {

        const BULLET_SPEED = 2.0;
        const COUNT = 8;

		let angle = 0;

		for (let i = 0; i < COUNT; ++ i) {

			angle = Math.PI * 2 / COUNT * i;

			this.bulletCb(this.pos.x, this.pos.y + this.center.y,
					Math.cos(angle) * BULLET_SPEED,
					Math.sin(angle) * BULLET_SPEED,
					6, false, 0);
		}
    }


    playerCollision(pl, ev) {

        if (!this.exist || !this.inCamera || this.dying || pl.dying) return;
        
        if (this.overlayObject(pl)) {

            ev.audio.playSample(ev.assets.samples["star"], 0.60);

            pl.progress.markStarCollected(this.id);

            this.spawnBullets();
            this.dying = true;
        }
    }


    initialCheck(progress) {

        if (!this.exist) return;
        
        if (progress.hasStar(this.id)) {

            this.exist = false;
        }
    }
}