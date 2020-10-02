import { CollisionObject } from "./collisionobject.js";
import { Vector2 } from "./core/vector.js";
import { Sprite } from "./core/sprite.js";
import { Flip } from "./core/canvas.js";


export class Boomerang extends CollisionObject {


    constructor(x, y, sx, sy, returnTime, returnObject) {

        super(x, y);

        this.speed = new Vector2(sx, sy);
        this.target = this.speed.clone();

        this.spr = new Sprite(16, 16);

        this.returning = false;
        this.returnTime = returnTime;

        this.returnObject = returnObject;

        this.totalSpeed = this.speed.length();

        this.friction = new Vector2(0.1, 0.1);

        this.collisionBox = new Vector2(4, 4);
        this.hitbox = new Vector2(8, 8);
    }


    updateLogic(ev) {

        const EPS = 8.0;
        const ANIM_SPEED = 4;

        let dir = new Vector2(
            this.pos.x - this.returnObject.pos.x, 
            this.pos.y - this.returnObject.pos.y
        );

        let dist = dir.length();
        dir.normalize();

        if (!this.returning) {

            if ((this.returnTime -= ev.step) <= 0)
                this.returning = true;
        }
        else {

            this.target.x = -dir.x * this.totalSpeed;
            this.target.y = -dir.y * this.totalSpeed;
            
            if (dist < EPS) {

                this.exist = false;
            }
        }

        // Animate
        this.spr.animate(5, 1, 4, ANIM_SPEED, ev.step);

        this.disableCollisions = this.returning;
    }


    draw(c) {

        if (!this.exist) return;

        this.spr.draw(c, c.bitmaps["figure"],
            (this.pos.x - 8) | 0,
            (this.pos.y - 8) | 0, 
            this.speed.x >= 0 ? Flip.None : Flip.Horizontal);
    }


    wallCollisionEvent(x, y, h, dir, ev) {

        if (this.returning) return;

        this.returnTime = 0;
        this.returning = true;
    }
}
