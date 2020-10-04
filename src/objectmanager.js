/**
 * The End of Journey
 * 
 * (c) 2020 Jani Nykänen
 */

import { Player } from "./player.js";


export class ObjectManager {


    constructor(progress) {

        this.player = null;
        this.progress = progress;
    }


    parseObjectLayer(data, w, h) {

        let tid = 0;
        for (let y = 0; y < h; ++ y) {

            for (let x = 0; x < w; ++ x) {

                tid = data[y * w + x] - 512;
                if (tid <= 0) continue;
                -- tid;

                switch(tid) {

                // Player
                case 0:

                    this.player = new Player(x*16+8, y*16+8, this.progress );
                    break;
                }
            }
        }
    }


    positionCamera(cam) {

        cam.setPosition((this.player.pos.x / 160) | 0, 
            (this.player.pos.y / 144) | 0);
    }


    update(cam, stage, ev) {

        if (!cam.moving) {

            this.player.update(ev);
            stage.objectCollision(this.player, ev);
            if (this.player.boomerang != null) {

                stage.objectCollision(this.player.boomerang, ev);
            }
        }
        this.player.cameraEvent(cam, ev);
    }


    draw(c) {

        this.player.draw(c);
    }
}
