/**
 * A Graveyard for Fools
 * 
 * (c) 2020 Jani Nykänen
 */

import { State } from "./core/input.js";
import { Menu, MenuButton } from "./menu.js";
import { drawBoxWithOutlines } from "./misc.js";


// What do you mean I'm hard-coding prices?
// ...well, I am. You were right
const PRICES = [
    20, 10, 20, 30, 10
];


export class Shop {


    constructor(progress, ev) {

        this.progress = progress;

        this.menu = new Menu(12, true, this.constructMenuButtons(ev));

        this.active = false;

        // Needed in drawing
        this.loc = ev.assets.localization["en"];
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

        if (ev.input.actions["back"].state == State.Pressed) {

            // Sound effect
            ev.audio.playSample(ev.assets.samples["deny"], 0.60);

            this.deactivate();
            return;
        }

        this.menu.update(ev);
    }


    draw(c) {

        const TOP_BOX_WIDTH = 48;
        const TOP_BOX_HEIGHT = 12;
        const TOP_BOX_OFFSET_Y = 4;

        const Y_OFFSET = -12;
        const MENU_X = 60;
        const MENU_RIGHT = 144;
        const BOTTOM_BOX_TOP_OFFSET = -4;
        const BOTTOM_BOX_HEIGHT = 40;

        if (!this.active) return;

        c.setColor(0, 0, 0, 0.67);
        c.fillRect(0, 0, c.width, c.height);

        let topElementY = c.height/2 - this.menu.height/2 + Y_OFFSET ;

        // "Shop" box
        drawBoxWithOutlines(c,
            c.width/2 - TOP_BOX_WIDTH/2,
            TOP_BOX_OFFSET_Y,
            TOP_BOX_WIDTH, TOP_BOX_HEIGHT);
        c.drawText(c.bitmaps["font"], "SHOP",
            c.width/2, TOP_BOX_OFFSET_Y+2, 0, 0, true);

        // Content box
        drawBoxWithOutlines(c, 
            MENU_X - this.menu.width/2 -4, 
            topElementY - 2,
            c.width - (c.width/2 - MENU_X) + 4, 
            this.menu.height);

        // Name
        this.menu.draw(c, MENU_X, c.height/2 + Y_OFFSET);

        // Prices
        let str = "";
        let x = 0;
        for (let i = 0; i < PRICES.length; ++ i) {

            str = String(PRICES[i]) + String.fromCharCode(6);
            x = MENU_RIGHT - str.length * 8;

            c.drawText(
                c.bitmaps[this.menu.cpos == i ? "fontYellow" : "font"], str, 
                x, topElementY + i*this.menu.offset, 0, 0, false);
        }

        // Bottom box
        let bottomElementY = topElementY + 
            this.menu.height + 
            BOTTOM_BOX_TOP_OFFSET + 12;
        drawBoxWithOutlines(c, 
            MENU_X - this.menu.width/2 -4, 
            bottomElementY - 4,
            c.width - (c.width/2 - MENU_X) + 4, 
            BOTTOM_BOX_HEIGHT);

        // Description
        if (this.menu.cpos < this.menu.buttons.length-1) {

            str = this.loc["shopItemDesc1"] [this.menu.cpos];
            c.drawText(c.bitmaps["font"], str, 
                MENU_X - this.menu.width/2, bottomElementY -2, 0, 1, 
                false);
        }
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
