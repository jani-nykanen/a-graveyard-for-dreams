/**
 * The End of Journey
 * 
 * (c) 2020 Jani Nykänen
 */

import { Flip } from "./core/canvas.js";
import { negMod } from "./core/util.js";


export class Stage {


    constructor(tilemap) {

        this.tmap = tilemap;

        this.width = tilemap.width;
        this.height = tilemap.height;

        this.cloudPos = 0.0;
    }


    drawLayer(c, bmp, layer, sx, sy, w, h) {

        let tid;
        let srcx, srcy;

        for (let y = sy; y < sy + h; ++ y) {

            for (let x = sx; x < sx + w; ++ x) {

                tid = this.tmap.getLoopedTile(layer, x, y);
                if ( (tid --) == 0) continue;

                srcx = (tid % 16) | 0;
                srcy = (tid / 16) | 0;

                c.drawBitmapRegion(bmp, 
                    srcx*16, srcy*16, 16, 16,
                    x*16, y*16, Flip.None);
            }
        }
    }


    update(ev) {

        const CLOUD_SPEED = 0.5;

        this.cloudPos = (this.cloudPos + CLOUD_SPEED * ev.step) % 96;
    }


    drawBackground(c, cam) {

        const CLOUD_BASE_Y = 96;
        const CLOUD_BOTTOM_HEIGHT = 16;

        let cloudRenderPos = negMod(
            this.cloudPos + (cam.rpos.x * 16),
            96);

        c.clear(85, 170, 255);

        // Moon
        c.drawBitmapRegion(c.bitmaps["background"],
                16, 32, 48, 48, 96, 16, Flip.None);

        let moveY = (cam.rpos.y * 16) | 0;        
        c.move(0, -moveY);

        // Clouds
        for (let i = 0; i < 3; ++ i) {

            c.drawBitmapRegion(c.bitmaps["background"],
                0, 0, 96, 32,
                Math.round(-cloudRenderPos + i*96), CLOUD_BASE_Y, 
                Flip.None);
        } 
        c.setColor(255, 255, 255);
        c.fillRect(0, CLOUD_BASE_Y+32, c.width, CLOUD_BOTTOM_HEIGHT);

        // Water
        let waterY = CLOUD_BASE_Y + 32 + CLOUD_BOTTOM_HEIGHT;
        for (let x = 0; x < (c.width/16) | 0; ++ x) {

            c.drawBitmapRegion(c.bitmaps["background"],
                0, 32, 16, 32, x * 16, waterY, Flip.None);
        }
        c.setColor(0, 85, 170);
        c.fillRect(0, waterY+32, c.width, 
            Math.max(0, c.height+moveY - (waterY+32)));
        
        c.move(0, moveY);
    }


    draw(c, cam) {

        const MARGIN = 1;

        //
        // TODO: Make sure the object layer is not drawn
        //

        let startx = ((cam.rpos.x*10) | 0) - MARGIN; 
        let starty = ((cam.rpos.y*9) | 0) - MARGIN;

        let w = ((c.width / 16) | 0) + MARGIN*2;
        let h = ((c.height / 16) | 0) + MARGIN*2;

        for (let i = 0; i < this.tmap.layers.length; ++ i) {

            this.drawLayer(c, c.bitmaps["tileset"],
                i, startx, starty, w, h);
        }
    }
}
