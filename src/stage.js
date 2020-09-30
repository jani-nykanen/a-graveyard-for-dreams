/**
 * The End of Journey
 * 
 * (c) 2020 Jani Nykänen
 */

import { Flip } from "./core/canvas.js";
import { negMod } from "./core/util.js";

const FLOOR = 0b0001;
const WALL_LEFT = 0b0010;
const WALL_RIGHT = 0b0100;
const CEILING = 0b1000;


const COLLISION_TABLE = [
        FLOOR,
        WALL_RIGHT,
        CEILING,
        WALL_LEFT,
        FLOOR | CEILING,
        WALL_LEFT | WALL_RIGHT,
        WALL_LEFT | FLOOR,
        WALL_RIGHT | FLOOR,
        WALL_RIGHT | CEILING,
        WALL_LEFT | CEILING,
        WALL_LEFT | FLOOR | WALL_RIGHT,
        WALL_RIGHT | FLOOR | CEILING,
        WALL_LEFT | CEILING | WALL_RIGHT,
        WALL_LEFT | FLOOR | CEILING,
        WALL_LEFT | FLOOR | WALL_RIGHT | CEILING,
];


export class Stage {


    constructor(assets) {

        this.tmap = assets.tilemaps["base"];
        this.colMap = assets.tilemaps["collisions"];

        this.width =  this.tmap.width;
        this.height =  this.tmap.height;

        this.cloudPos = 0.0;
        this.waterPos = 0.0;
    }


    drawSpecialTile(c, bmp, x, y, tid) {

        const WATER_AMPLITUDE = 1.0;

        let srcx = (tid % 16) | 0;
        let srcy = (tid / 16) | 0;

        let srcw = 16;
        let srch = 16;
        let destY = y*16;

        switch(tid) {

        // Water surface
        case 133:

            destY += WATER_AMPLITUDE + 
                WATER_AMPLITUDE * Math.round(Math.sin(this.waterPos/16 * Math.PI*2));

            srcw = (this.waterPos) | 0;
            if (srcw % 2 != destY % 2)
                ++ srcx; 

            c.drawBitmapRegion(bmp, 
                srcx*16 + srcw, srcy*16, 16-srcw, srch,
                x*16, destY, Flip.None);
            if (srcw > 0) {

                c.drawBitmapRegion(bmp, 
                    srcx*16, srcy*16, srcw, srch,
                    (x+1)*16 - srcw, destY, Flip.None);
            }

            break;

        default:
            break;
        }
    }


    drawLayer(c, bmp, layer, sx, sy, w, h) {

        const SPECIAL_TILES = [133];

        let tid;
        let srcx, srcy;

        for (let y = sy; y < sy + h; ++ y) {

            for (let x = sx; x < sx + w; ++ x) {

                tid = this.tmap.getLoopedTile(layer, x, y);
                if ( (tid --) == 0) continue;

                if (SPECIAL_TILES.includes(tid)) {

                    this.drawSpecialTile(c, bmp, x, y, tid);
                    continue;
                }

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
        const WATER_SPEED = 0.125;

        this.cloudPos = (this.cloudPos + CLOUD_SPEED * ev.step) % 96;

        this.waterPos = (this.waterPos + WATER_SPEED * ev.step) % 16;
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

        let startx = ((cam.rpos.x*10) | 0) - MARGIN; 
        let starty = ((cam.rpos.y*9) | 0) - MARGIN;

        let w = ((c.width / 16) | 0) + MARGIN*2;
        let h = ((c.height / 16) | 0) + MARGIN*2;

        for (let i = 0; i < this.tmap.layers.length-1; ++ i) {

            this.drawLayer(c, c.bitmaps["tileset"],
                i, startx, starty, w, h);
        }
    }


    parseObjects(objects) {

        objects.parseObjectLayer(
            this.tmap.layers[this.tmap.layers.length-1], 
            this.width, this.height);
    }


    checkBaseTileCollision(o, tid, x, y, ev) {

        tid |= 0;

        let colValue = COLLISION_TABLE[tid];

        if ((colValue & FLOOR) == FLOOR) {

            o.floorCollision(x*16, y*16, 16, ev);
        }
        if ((colValue & CEILING) == CEILING) {

            o.ceilingCollision(x*16, (y+1)*16, 16, ev);
        }

        if ((colValue & WALL_RIGHT) == WALL_RIGHT) {

            o.wallCollision((x+1)*16, y*16, 16, -1, ev);
        }
        if ((colValue & WALL_LEFT) == WALL_LEFT) {

            o.wallCollision(x*16, y*16, 16, 1, ev);
        }
    }


    checkSpecialTileCollision(o, tid, x, y, ev) {

        switch(tid) {

        case 31:

            if (o.floorCollision(x*16, (y+1)*16, 16, ev)) {

                // Climb, if down key pressed?
            }

            break;
        
        default:
            break;
        }
    }


    objectCollision(o, ev) {

        const MARGIN = 2;

        let px = (o.pos.x / 16) | 0;
        let py = (o.pos.y / 16) | 0;

        let startx = px - MARGIN;
        let starty = py - MARGIN;

        let endx = px + MARGIN*2;
        let endy = py + MARGIN*2;

        let tid = 0;
        let colId = 0;
        for (let layer = 0; layer < this.tmap.layers.length-1; ++ layer) {

            for (let y = starty; y <= endy; ++ y) {

                for (let x = startx; x <= endx; ++ x) {

                    tid = this.tmap.getLoopedTile(layer, x, y);
                    if (tid == 0) continue;

                    colId = this.colMap.layers[0] [tid-1];
                    if (colId != null) {

                        if (colId > 0 && colId <= COLLISION_TABLE.length)
                            this.checkBaseTileCollision(o, colId-1, x, y, ev);
                        else
                            this.checkSpecialTileCollision(o, colId-1, x, y, ev);
                    }
                }
            }
        }
    }
}
