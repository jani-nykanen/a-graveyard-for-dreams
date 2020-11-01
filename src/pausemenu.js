/**
 * A Graveyard for Fools
 * 
 * (c) 2020 Jani Nykänen
 */

import { Menu, MenuButton } from "./menu.js";
import { MessageBox } from "./messagebox.js";
import { drawBoxWithOutlines } from "./misc.js";


export class PauseMenu {


    constructor(resetCB, quitCB) {

        this.message = new MessageBox();
        this.menu = new Menu(12, true,
        [

            new MenuButton("Resume", (ev) => {

                this.deactivate(ev);
            }, false),

            new MenuButton("Respawn", (ev) => {

                this.showRespawnMessage();
            }, false),

            new MenuButton("Quit", (ev) => {

                quitCB(ev);
                this.deactivate(ev);
            }, false),
        ]);

        this.resetCB = resetCB;

        this.active = false;
    }


    activate() {

        this.active = true;
        this.menu.activate(0);
    }


    deactivate(ev) {

        this.menu.deactivate();
        this.active = false;

        ev.audio.resumeMusic();
    }


    showRespawnMessage() {

        this.message.addMessage("Respawn in the\nlatest check-\npoint?")
            .activate((ev) => {

                this.resetCB(ev);

                this.menu.deactivate();
                this.active = false;
            }, true);
    }


    update(ev) {

        if (!this.active) return;

        if (this.message.active) {

            this.message.update(ev);
            return;
        }

        this.menu.update(ev);
    }


    draw(c) {

        const BOX_WIDTH = 64;
        const BOX_HEIGHT = 40;

        if (!this.active) return;

        c.setColor(0, 0, 0, 0.67);
        c.fillRect(0, 0, c.width, c.height);

        if (this.message.active) {

            this.message.draw(c, true);
            return;
        }

        drawBoxWithOutlines(c, 
            c.width/2 - BOX_WIDTH/2, c.height/2 - BOX_HEIGHT/2, 
            BOX_WIDTH, BOX_HEIGHT);

        this.menu.draw(c, c.width/2, c.height/2 +1);
    }
}
