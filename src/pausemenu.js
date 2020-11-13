/**
 * A Graveyard for Fools
 * 
 * (c) 2020 Jani Nykänen
 */

import { Menu, MenuButton } from "./menu.js";
import { MessageBox } from "./messagebox.js";
import { drawBoxWithOutlines } from "./misc.js";


export class PauseMenu {


    constructor(resetCB, quitCB, ev) {

        let loc = ev.assets.localization["en"];

        this.message = new MessageBox(ev);
        this.menu = new Menu(12, true,
        [

            new MenuButton(loc["resume"], (ev) => {

                this.deactivate(ev);
            }, false),

            new MenuButton(loc["respawn"], (ev) => {

                this.showRespawnMessage(ev);
            }, false),

            new MenuButton(loc["quit"], (ev) => {

                this.showQuitMessage(ev);
            }, false),
        ]);

        this.resetCB = resetCB;
        this.quitCB = quitCB;

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


    showRespawnMessage(ev) {

        let loc = ev.assets.localization["en"];

        this.message.addMessage(loc["respawnText"])
            .activate((ev) => {

                this.resetCB(ev);

                this.menu.deactivate();
                this.active = false;
            }, true);
    }


    showQuitMessage(ev) {

        let loc = ev.assets.localization["en"];

        this.message.addMessage(loc["quitText"])
            .activate((ev) => {

                this.quitCB(ev);

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

        const BOX_WIDTH = 68;
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
