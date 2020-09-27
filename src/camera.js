/**
 * The End of Journey
 * 
 * (c) 2020 Jani Nykänen
 */

import { Vector2 } from "./core/vector.js";


export class Camera {

    
    constructor(x, y, w, h) {

        this.pos = new Vector2(x, y);
        this.target = this.pos.clone();
        this.rpos = new Vector2(x*w, y*h);

        this.width = w;
        this.height = h;

        this.moving = false;
        this.moveTimer = 0;
        this.moveSpeed = 0;
    }


    move(dx, dy, speed) {

        if (this.moving) return;

        this.moveTimer = 1.0;
        this.moveSpeed = speed;

        this.target.x = this.pos.x + dx;
        this.target.y = this.pos.y + dy;

        this.moving = true;
    }


    updateMovement(ev) {

        if (!this.moving) return;

        if ((this.moveTimer -= this.moveSpeed * ev.step) <= 0) {

            this.moveTimer = 0;
            this.pos = this.target.clone();
        }

        // Compute "render position"
        let t = this.moveTimer;

        this.rpos.x = t * this.pos.x + (1 - t) * this.target.x;
        this.rpos.y = t * this.pos.y + (1 - t) * this.target.y;
    }


    update(ev) {

        this.updateMovement(ev);
    }


    use(c) {

        c.moveTo(Math.round(this.rpos.x * this.width), 
            Math.round(this.rpos.y) * this.height);
    }
}
