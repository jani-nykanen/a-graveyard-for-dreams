/**
 * A Graveyard for Dreams
 * 
 * (c) 2020 Jani Nykänen
 */


import { Scene } from "./core/scene.js";
import { MessageBox } from "./messagebox.js";
import { Game } from "./game.js";
import { Sprite } from "./core/sprite.js";
import { Flip } from "./core/canvas.js";


export class StoryIntro extends Scene {


    constructor(ev, param) {

        super(ev, param);

        let loc = ev.assets.localization["en"];
        
        this.message = new MessageBox(ev);
        for (let m of loc["storyIntro"]) {

            this.message.addMessage(m);
        }

        this.sprEye = new Sprite(64, 32);
        this.sprEye.setFrame(0, 1);

        this.eyeState = 0;
    }


    refresh(ev) {

        // F**k this is pretty

        // Eye appears
        if (this.eyeState == 0) {

            if (this.sprEye.row == 1) {

                this.sprEye.animate(1, 0, 3, 10, ev.step);
                if (this.sprEye.frame == 3) {

                    this.sprEye.setFrame(0, 0);
                }
            }
            else {

                this.sprEye.animate(0, 0, 3, 8, ev.step);
                if (this.sprEye.frame == 3) {

                    this.eyeState = 1;

                    this.message.activate((ev) => {

                        this.eyeState = 2;
                        this.message.deactivate();
            
                    }, false);
                }
            }
        }
        // Text phase
        else if (this.eyeState == 1) {

            this.message.update(ev);
        }
        // Eye disappears
        else {

            if (this.sprEye.row == 0) {

                this.sprEye.animate(0, 3, 0, 8, ev.step);
                if (this.sprEye.frame == 0) {

                    this.sprEye.setFrame(3, 1);
                }
            }
            else {

                this.sprEye.animate(1, 3, -1, 10, ev.step);
                if (this.sprEye.frame == -1) {

                    ev.changeScene(Game);
                }
            }
        }
    }


    dispose() {

        return null;
    }


    redraw(c) {

        c.clear(0, 0, 0);

        c.moveTo(0, 0);
        this.sprEye.draw(c, c.bitmaps["eye"], c.width/2-32, 20, Flip.None);

        c.moveTo(0, 24);
        this.message.draw(c, false);
    }

}
