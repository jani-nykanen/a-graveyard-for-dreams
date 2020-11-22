/**
 * A Graveyard for Fools
 * 
 * (c) 2020 Jani Nykänen
 */

import { Flip } from "./core/canvas.js";
import { Vector2 } from "./core/vector.js";
import { ROOM_WIDTH, ROOM_HEIGHT } from "./camera.js";


// It's not called "Map" for a good reason
export class GameMap {


    constructor(width, height) {

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
    }


    updateCanvas(data, progress) {

        const COLORS = [
            "rgb(0,85,170)",
            "rgb(0,0,0)",
            "rgb(255,170,0)",
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

        if (ev.input.anyPressed()) {

            this.active = false;

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
    }


    draw(c) {

        if (!this.active) return;

        let dx = c.width/2 - this.width/2;
        let dy = c.height/2 - this.height/2

        c.setColor(0, 0, 0, 0.67);
        c.fillRect(0, 0, c.width, c.height);

        c.setColor(170, 85, 0);
        c.fillRect(dx, dy, this.width, this.height);

        // Active room
        c.setColor(255, 170, 85);
        c.fillRect(dx + this.camPos.x*ROOM_WIDTH, 
            dy + this.camPos.y*ROOM_HEIGHT, 
            ROOM_WIDTH, ROOM_HEIGHT);

        c.drawBitmap(this.canvas, dx, dy, Flip.None);

        if (this.flickerTimer < 30) {

            c.setColor(255, 0, 0);
            c.fillRect(dx + this.plPos.x-1, dy + this.plPos.y-2, 3, 3);
        }

         // Unvisited rooms
        c.setColor(85, 0, 0);
        for (let y = 0; y < this.roomCountY; ++ y) {

            for (let x = 0; x < this.roomCountX; ++ x) {

                if ((x != this.camPos.x || y != this.camPos.y) &&
                    !this.visitedRooms[y * this.roomCountX + x]) {

                    c.fillRect(dx + ROOM_WIDTH*x, dy + ROOM_HEIGHT*y,
                        ROOM_WIDTH, ROOM_HEIGHT);
                }
            }
        }

    }
}
