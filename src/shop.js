/**
 * A Graveyard for Fools
 * 
 * (c) 2020 Jani Nykänen
 */

import { Menu, MenuButton } from "./menu.js";
import { drawBoxWithOutlines } from "./misc.js";


export class Shop {


    constructor(progress, ev) {

        this.progress = progress;

        this.menu = new Menu(12, true, this.constructMenuButtons(ev));

        this.active = false;
    }


    constructMenuButtons(ev) {

        let loc = ev.assets.localization["en"];

        let buttons = new Array();

        for (let i = 0; i < loc["shopItemNames1"].length; ++ i) {

            buttons.push(new MenuButton(loc["shopItemNames1"][i], 
                (ev) => {}, false));
        }
        buttons.push(new MenuButton(loc["back"], 
            (ev) => {

                this.deactivate();

            }, true));

        return buttons;
    }


    update(ev) {

        if (!this.active) return;

        this.menu.update(ev);
    }


    draw(c) {

        const Y_OFFSET = -16;

        if (!this.active) return;

        drawBoxWithOutlines(c, 
            c.width/2 - this.menu.width/2 -4, 
            c.height/2 - this.menu.height/2 + Y_OFFSET -4,
            this.menu.width + 8, this.menu.height + 8);
        this.menu.draw(c, c.width/2, c.height/2 + Y_OFFSET);
    }


    activate() {

        this.active = true;
        this.menu.activate(this.menu.buttons.length-1);
    }


    deactivate() {

        this.menu.deactivate();
        this.active = false;
    }
}
