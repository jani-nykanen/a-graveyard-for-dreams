import { Chip } from "./chip.js";
/**
 * The End of Journey
 * 
 * (c) 2020 Jani Nykänen
 */

import { Flip } from "./core/canvas.js";
import { negMod, nextObject } from "./core/util.js";
import { Vector2 } from "./core/vector.js";

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


export class FallingBarrel {


    constructor() {

        this.pos = new Vector2(0, 0);
        this.timer = 0;
        this.speed = 0;

        this.layer = 0;
        this.tid = 0;

        this.exist = false;
    }


    spawn(x, y, layer, speed, tid) {

        this.timer = 0
        this.speed = speed;
        this.layer = layer;
        this.tid = tid;

        this.pos = new Vector2(x, y);

        this.exist = true;
    }


    update(stage, ev) {

        if (!this.exist) return;

        if ((this.timer += this.speed * ev.step) >= 16) {

            stage.tmap.setTile(this.layer, 
                this.pos.x, this.pos.y+1, this.tid+1);

            this.exist = false;
        }
    }


    draw(c) {

        if (!this.exist) return;

        let sx = this.tid % 16;
        let sy = (this.tid / 16) | 0;

        let py = this.pos.y * 16 + this.timer;

        c.drawBitmapRegion(c.bitmaps["tileset"],
            sx*16, sy*16, 16, 16,
            this.pos.x*16, py | 0,
            Flip.None);
    }
}


export class Stage {


    constructor(assets) {

        this.tmap = assets.tilemaps["base"];
        this.colMap = assets.tilemaps["collisions"];

        this.width =  this.tmap.width;
        this.height =  this.tmap.height;

        this.cloudPos = 0.0;
        this.waterPos = 0.0;

        this.chips = new Array();
        this.fallingBarrels = new Array();
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


    spawnChips(x, y, amount, startAngle, row, ev) {

        const MIN_SPEED = 1.0;
        const MAX_SPEED = 2.5;

        const MOD_X = 1;
        const MOD_Y = 1.75;

        let angleStep = Math.PI*2 / amount;
        let angle = 0;
        let speed = 0;

        for (let i = 0; i < amount; ++ i) {

            angle = startAngle + angleStep * i;
            speed = Math.random() * (MAX_SPEED - MIN_SPEED) + MIN_SPEED;

            nextObject(this.chips, Chip).spawn(
                x, y, 
                Math.cos(angle) * speed * MOD_X,
                Math.sin(angle) * speed * MOD_Y,
                row);
        }

        // Sound effect
        ev.audio.playSample(ev.assets.samples["break"], 0.50);

    }


    spawnFallingBarrel(x, y, speed, tid, layer) {

        nextObject(this.fallingBarrels, FallingBarrel).spawn(
            x, y, layer, speed, tid);
    }


    update(cam, ev) {

        const CLOUD_SPEED = 0.5;
        const WATER_SPEED = 0.125;

        this.cloudPos = (this.cloudPos + CLOUD_SPEED * ev.step) % 96;

        this.waterPos = (this.waterPos + WATER_SPEED * ev.step) % 16;

        for (let c of this.chips) {

            c.checkIfInCamera(cam);
            c.update(ev);

            this.objectCollision(c, ev);
        }

        for (let b of this.fallingBarrels) {

            b.update(this, ev);
        }
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

        // Draw layers
        for (let i = 0; i < this.tmap.layers.length-1; ++ i) {

            this.drawLayer(c, c.bitmaps["tileset"],
                i, startx, starty, w, h);
        }

        // Falling barrle
        for (let b of this.fallingBarrels) {

            b.draw(c);
        }

        // Chips
        for (let o of this.chips) {

            o.draw(c);
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


    checkSpecialTileCollision(o, tid, baseId, x, y, layer, ev) {

        const SPIKE_COLLISION_X = [2, 0, 2, 8];
        const SPIKE_COLLISION_Y = [8, 2, 0, 2];
        const SPIKE_COLLISION_WIDTH = [12, 8, 12, 8];
        const SPIKE_COLLISION_HEIGHT = [8, 12, 8, 12];
        const SPIKE_DAMAGE = 2;
        
        const BREAK_X_MARGIN = 2;
        const CHIP_COUNT = 6;

        switch(tid) {

        // Ladder, bottom
        case 15:

            if (o.ladderCollision != undefined) {

                o.ladderCollision(x*16, y*16, 16, 16, ev);
            }
            break;

        // Hurt collisions
        case 16:
        case 17:
        case 18:
        case 19:

            if (o.hurtCollision != undefined) {

                o.hurtCollision(x*16 + SPIKE_COLLISION_X[tid-16],
                    y*16 + SPIKE_COLLISION_Y[tid-16], 
                    SPIKE_COLLISION_WIDTH[tid-16], 
                    SPIKE_COLLISION_HEIGHT[tid-16], 
                    SPIKE_DAMAGE,
                    ev);
            }
            break;

        // Breaking tiles
        case 20:
        case 21:
        case 22:
 
            if (o.breakCollision != undefined) {

                if (o.breakCollision(
                        x*16+BREAK_X_MARGIN, y*16, 
                        16-BREAK_X_MARGIN*2, 16, ev)-1 >= (tid-20)) {

                    this.tmap.setTile(layer, x, y, 0);
                    this.spawnChips(x*16+8, y*16+8, 
                        CHIP_COUNT, Math.random() * Math.PI,
                        tid-20, ev);

                    if (tid == 20 &&
                       this.tmap.getLoopedTile(layer, x, y-1) == baseId+1) {

                        this.tmap.setTile(layer, x, y-1, 0);
                        this.spawnFallingBarrel(x, y-1, 0.5, baseId, layer);
                    }

                    return;
                }
                
            }
            this.checkBaseTileCollision(o, 14, x, y, ev);

            break;

        // Ladder, special
        case 27:

            if (o.ladderCollision != undefined) {

                o.ladderCollision(x*16+8, y*16, 16, 16, ev);
            }
            break;

        // Water, surface
        case 29:

            if (o.waterCollision != undefined) {
    
                o.waterCollision(x*16, y*16+8, 16, 8, ev);
            }
            break;

        // Water, "deep"
        case 30:

            if (o.waterCollision != undefined) {

                o.waterCollision(x*16, y*16, 16, 16, ev);
            }
            break;

        // Ladder, upper
        case 31:

            o.floorCollision(x*16, (y+1)*16, 16, ev);
            
            if (o.ladderCollision != undefined)
                o.ladderCollision(x*16, y*16+8, 16, 8, ev, 4);

            break;
        
        default:
            break;
        }
    }


    objectCollision(o, ev) {

        const MARGIN = 2;

        if (!o.exist || !o.inCamera || o.dying) return;

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
                            this.checkSpecialTileCollision(o, colId-1, tid-1, 
                                x, y, layer, ev);
                    }
                }
            }
        }
    }
}
