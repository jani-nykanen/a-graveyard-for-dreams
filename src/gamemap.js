/**
 * A Graveyard for Fools
 * 
 * (c) 2020 Jani Nykänen
 */

import { Flip } from "./core/canvas.js";
import { Vector2 } from "./core/vector.js";
import { ROOM_WIDTH, ROOM_HEIGHT } from "./camera.js";
import { State } from "./core/input.js";


const OPEN_TIME = 30;


// It's not called "Map" for a good reason
export class GameMap {


    constructor(width, height, ev) {

        this.canvas = document.createElement("canvas");
        this.canvas.width = width;
        this.canvas.height = height;

        this.width = width;
        this.height = height;

        this.active = false;

        this.plPos = new Vector2(0, 0);
        this.camPos = new Vector2(0, 0);
        this.flickerTimer = 0;

        this.visitedRooms = null;

        this.roomCountX = (width / ROOM_WIDTH) | 0;
        this.roomCountY = (height / ROOM_HEIGHT) | 0;

        this.openTimer = 0;
        this.openPhase = 0;

        this.loc = ev.assets.localization["en"];
    }


    updateCanvas(data, progress) {

        const COLORS = [
            "rgb(0,85,170)",
            "rgb(0,0,0)",
            "rgb(85,85,85)",
            "rgb(85,170,0)",
        ];

        let ctx = this.canvas.getContext("2d");

        ctx.clearRect(0, 0, this.width, this.height);

        let t = 0;
        for (let y = 0; y < data.height; ++ y) {

            for (let x = 0; x < data.width; ++ x) {

                t = data.data[y * data.width + x];
                if (t == 0) continue;

                ctx.fillStyle = COLORS[t-1];
                ctx.fillRect(x | 0, y | 0, 1, 1);
            }
        }

        this.visitedRooms = Array.from(progress.visitedRooms);
    }


    update(ev) {

        if (!this.active) return;

        if (this.openPhase != 1) {

            if ((this.openTimer -= ev.step) <= 0) {

                if (this.openPhase == 0)
                    ++ this.openPhase;
                else
                    this.active = false;

                this.openTimer = 0;
            }

            return;
        }

        if (ev.input.actions["start"].state == State.Pressed ||
            ev.input.actions["select"].state == State.Pressed ||
            ev.input.actions["fire1"].state == State.Pressed ||
            ev.input.actions["back"].state == State.Pressed) {

            this.openPhase = 2;
            this.openTimer = OPEN_TIME;

            // Sound effect
            ev.audio.playSample(ev.assets.samples["accept"], 0.60);

            return;
        }

        this.flickerTimer = (this.flickerTimer + ev.step) % 60;
    }


    activate(data, plPos, cam, progress) {

        this.active = true;
        this.updateCanvas(data, progress);
    
        this.plPos.x = Math.round(plPos.x / 16);
        this.plPos.y = Math.round(plPos.y / 16);

        this.camPos.x = Math.floor(cam.pos.x);
        this.camPos.y = Math.floor(cam.pos.y);

        this.flickerTimer = 0;
        this.openTimer = OPEN_TIME;
        this.openPhase = 0;
    }


    drawBorders(c, dx, dy, w, h) {

        let bmp = c.bitmaps["map"];

        // Corners
        c.drawBitmapRegion(bmp, 0, 0, 10, 9,
            dx-10, dy-9, Flip.None);
        c.drawBitmapRegion(bmp, 20, 0, 10, 9,
            dx + w, dy-9, Flip.None);    
        c.drawBitmapRegion(bmp, 0, 27, 10, 9,
            dx-10, dy + h + 9, Flip.None);
        c.drawBitmapRegion(bmp, 20, 27, 10, 9,
            dx + w, dy + h + 9, Flip.None);        
        
        // Vertical bars
        let sy = 0;
        let endy = ((h / 9) | 0) + 1;
        for (let y = 0; y < endy; ++ y) {

            sy = y == endy - 1 ? 18 : 9;

            c.drawBitmapRegion(bmp, 0, sy, 10, 9,
                dx-10, dy + y*9, Flip.None);

            c.drawBitmapRegion(bmp, 20, sy, 10, 9,
                dx + w, dy + y*9, Flip.None);    
        }

        // Horizontal bars
        let endx = ((w / 10) | 0);
        for (let x = 0; x < endx; ++ x) {

            c.drawBitmapRegion(bmp, 10, 0, 10, 9,
                dx + x*10, dy-9, Flip.None);

            c.drawBitmapRegion(bmp, 10, 18, 10, 9,
                dx + x*10, dy + h, Flip.None);    
        }
    }


    draw(c) {

        if (!this.active) return;

        let dx = (c.width/2 - this.width/2) | 0;
        let dy = (c.height/2 - this.height/2) | 0

        c.setColor(0, 0, 0, 0.67);
        c.fillRect(0, 0, c.width, c.height);

        let t = this.openTimer / OPEN_TIME;
        if (this.openPhase < 2)
                t = 1.0 - t;
        let w = 10 + Math.round((this.width-10) * t / 10 -1) * 10;

        this.drawBorders(c, c.width/2 - w/2, dy-4, w, this.height);

        if (this.openPhase != 1) {
            
            c.setColor(170, 85, 0);
            c.fillRect(c.width/2 - w/2, dy-4, w, this.height);
            return;
        }

        c.setColor(255, 170, 85);
        c.fillRect(dx, dy-4, this.width, this.height);

        c.setColor(170, 85, 0);
        c.fillRect(dx, dy-4, this.width, 4);

        // Active room
        c.setColor(255, 255, 85);
        c.fillRect(dx + this.camPos.x*ROOM_WIDTH, 
            dy + this.camPos.y*ROOM_HEIGHT, 
            ROOM_WIDTH, ROOM_HEIGHT);

        c.drawBitmap(this.canvas, dx, dy, Flip.None);

        if (this.flickerTimer < 30) {

            c.setColor(255, 0, 0);
            c.fillRect(dx + this.plPos.x-1, dy + this.plPos.y-2, 3, 3);
        }

        // Unvisited rooms
        c.setColor(170, 85, 0);
        for (let y = 0; y < this.roomCountY; ++ y) {

            for (let x = 0; x < this.roomCountX; ++ x) {

                if ((x != this.camPos.x || y != this.camPos.y) &&
                    !this.visitedRooms[y * this.roomCountX + x]) {

                    c.fillRect(dx + ROOM_WIDTH*x, dy + ROOM_HEIGHT*y,
                        ROOM_WIDTH, ROOM_HEIGHT);
                }
            }
        }

        // Header
        c.drawText(c.bitmaps["font"], 
            this.loc["mapHeader"], 
            c.width/2, dy - 9, 0, 0, true);

    }
}
