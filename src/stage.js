/**
 * The End of Journey
 * 
 * (c) 2020 Jani Nykänen
 */

import { Flip } from "./core/canvas.js";


export class Stage {


    constructor(tilemap) {

        this.tmap = tilemap;

        this.width = tilemap.width;
        this.height = tilemap.height;
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

        // ...
    }


    draw(c, cam) {

        const MARGIN = 1;

        //
        // TODO: Make sure the object layer is not drawn
        //

        let startx = ((cam.pos.x*10) | 0) - MARGIN; 
        let starty = ((cam.pos.y*9) | 0) - MARGIN;

        let w = ((c.width / 16) | 0) + MARGIN*2;
        let h = ((c.height / 16) | 0) + MARGIN*2;

        for (let i = 0; i < this.tmap.layers.length; ++ i) {

            this.drawLayer(c, c.bitmaps["tileset"],
                i, startx, starty, w, h);
        }
    }
}
