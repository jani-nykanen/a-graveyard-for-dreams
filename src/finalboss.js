/**
 * A Graveyard for Fools
 * 
 * (c) 2020 Jani Nykänen
 */

import { Flip } from "./core/canvas.js";
import { Sprite } from "./core/sprite.js";
import { Vector2 } from "./core/vector.js";
import { Enemy } from "./enemy.js";


const BOSS_HEALTH = 100;


export class FinalBoss extends Enemy {


    constructor(x, y) {

        super(x, y, -1, BOSS_HEALTH, 4);

        this.spr = new Sprite(64, 32); 
        this.hitbox = new Vector2(48, 16);

        this.appearing = true;
    }


    init(x, y) {

        this.spr.setFrame(0-1, 2);

        this.isStatic = true;
        this.appearing = true;
    }


    animate(ev) {

        const APPEAR_SPEED = 8;

        if (this.appearing) {

            this.spr.animate(this.spr.row, -1, 3, APPEAR_SPEED, ev.step);
            if (this.spr.frame == 3) {

                this.appearing = false;
                this.spr.setFrame(this.spr.row == 1 ? 0 : 3, 0);
            }
        }
    }


    draw(c, cam) {

        if (this.spr.frame < 0) return;

        let px = this.pos.x - this.spr.width/2;
        let py = this.pos.y - this.spr.height/2;

        this.spr.draw(c, c.bitmaps["eye"], 
			Math.round(px), Math.round(py), Flip.None);
    }

}
