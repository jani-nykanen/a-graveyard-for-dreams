/**
 * A Graveyard for Dreams
 * 
 * (c) 2020 Jani Nykänen
 */

import { addItemDescription, applyItemEvent, ChestType } from "./chest.js";
import { Flip } from "./core/canvas.js";
import { State } from "./core/input.js";
import { Menu, MenuButton } from "./menu.js";
import { MessageBox } from "./messagebox.js";
import { drawBoxWithOutlines } from "./misc.js";
import { ItemType } from "./progress.js";


/*
 * Insert any spaghetti-related meme here
 */


const ITEM_TYPES = [
    4, 0, 2, 1, 1,
    1, 1, 1, 1, 1
];
const ITEM_IDS = [
    0, 16, 16, 16, 17,
    18, 19, 20, 21, 22
];


// What do you mean I'm hard-coding prices?
// ...well, I am. You were right.
const PRICES = [
    10, 15, 10, 15, 10,
    30, 20, 30, 50, 20
];


const SHOP_ITEM_MAX = 5;


export class Shop {


    constructor(progress, globalMessage, ev) {

        this.progress = progress;
        this.menu = new Array();
        this.active = false;

        // Needed in drawing
        this.loc = ev.assets.localization["en"];

        this.message = new MessageBox(ev);
        this.globalMessage = globalMessage;

        this.itemWaitTime = 0;

        this.id = 0;
    }


    constructMenu(pl, ev) {

        let buttons = this.constructMenuButtons(pl, ev);

        this.menu = new Array();
        for (let j = 0; j < buttons.length; ++ j) {

            this.menu[j] = new Menu(12, true, buttons[j]);
        }
    }


    constructMenuButtons(pl, ev) {

        let loc = ev.assets.localization["en"];
        let names = loc["shopItemNames"];

        let buttons = new Array();

        for (let j = 0; j < names.length; ++ j) {

            buttons.push(new Array());
            
            for (let i = 0; i < names[j].length; ++ i) {

                buttons[j].push(new MenuButton(" " + names[j][i], 
                    (ev) => {

                        let k = j*SHOP_ITEM_MAX +i;

                        if (this.progress.isItemBought(k)) {

                            return;
                        }

                        if (this.progress.coins < PRICES[k]) {

                            this.message.addMessage(loc["cannotAfford"])    
                                .activate((ev) => {}, false);
                        }
                        else {

                            this.message.addMessage(loc["confirmTransaction"])
                                .activate((ev) => {

                                    const ITEM_WAIT = 60;

                                    if (ITEM_TYPES[k] != 4) {

                                        this.progress.setItemBoughtStatus(k, true);
                                        this.menu[this.id].toggleButton(i, false);
                                    }
                                        
                                    this.progress.addCoins(-PRICES[k]);

                                    addItemDescription(this.loc, this.globalMessage, 
                                        ITEM_TYPES[k], ITEM_IDS[k]);

                                    // this.deactivate();

                                    // Sound effect
                                    ev.audio.playSample(ev.assets.samples["treasure"], 0.50);

                                    this.itemWaitTime = ITEM_WAIT;
                                    this.deactivate();
            
                                    pl.setObtainItemPose(ITEM_TYPES[k],
                                        ITEM_TYPES[k] == ChestType.Item ? ITEM_IDS[k] : 0);

                                    ev.audio.pauseMusic();
                                    this.globalMessage.addStartCondition((ev) => {

                                        return (this.itemWaitTime -= ev.step) <= 0;
                                        
                                    }).activate((ev) => {

                                        applyItemEvent(
                                            ITEM_TYPES[k], 
                                            ITEM_IDS[k],
                                            pl);
                                        ev.audio.resumeMusic();

                                    }, false);

                                }, true);
                        }

                    }, false));
            }

            buttons[j].push(new MenuButton(loc["back"], 
                (ev) => {

                    this.deactivate();

                }, true));
        }

        return buttons;
    }  


    disableButtons() {

        for (let j = 0; j < this.menu.length; ++ j) {

            for (let i = 0; i < this.menu[j].buttons.length-1; ++ i) {

                if (this.progress.isItemBought(j*SHOP_ITEM_MAX + i)) {

                    this.menu[j].toggleButton(i, false);
                }
            }
        }
    }


    update(ev) {

        if (!this.active) return;

        if (this.message.active) {

            this.message.update(ev);
            return;
        }

        if (ev.input.actions["back"].state == State.Pressed) {

            // Sound effect
            ev.audio.playSample(ev.assets.samples["deny"], 0.60);

            this.deactivate();
            return;
        }

        this.menu[this.id].update(ev);
    }


    draw(c) {

        const MENU_WIDTH = 148;

        const TOP_BOX_WIDTH = 48;
        const TOP_BOX_HEIGHT = 12;
        const TOP_BOX_OFFSET_Y = 4;

        const Y_OFFSET = -12;
        const MENU_X = 60;
        const MENU_RIGHT = 152;
        const BOTTOM_BOX_TOP_OFFSET = -4;
        const BOTTOM_BOX_HEIGHT = 40;

        if (!this.active) return;

        c.setColor(0, 0, 0, 0.67);
        c.fillRect(0, 0, c.width, c.height);

        let topElementY = c.height/2 - this.menu[this.id].height/2 + Y_OFFSET;

        // "Shop" box
        drawBoxWithOutlines(c,
            c.width/2 - TOP_BOX_WIDTH/2,
            TOP_BOX_OFFSET_Y,
            TOP_BOX_WIDTH, TOP_BOX_HEIGHT);
        c.drawText(c.bitmaps["font"], "SHOP",
            c.width/2, TOP_BOX_OFFSET_Y+2, 0, 0, true);

        // Name box
        drawBoxWithOutlines(c, 
            c.width/2 - MENU_WIDTH/2, 
            topElementY - 2,
            MENU_WIDTH, 
            this.menu[this.id].height);
        // Names
        this.menu[this.id].draw(c, MENU_X +4, c.height/2 + Y_OFFSET);

        // Icons
        for (let i = 0; i < SHOP_ITEM_MAX; ++ i) {

            c.drawBitmapRegion(c.bitmaps["shopicons"],
                (this.id*SHOP_ITEM_MAX + i)*8, 
                this.progress.isItemBought(this.id*SHOP_ITEM_MAX + i) ? 8 : 0, 8, 8,
                MENU_X - (this.menu[this.id].width-8)/2 + 7, 
                topElementY + i*this.menu[this.id].offset, Flip.None);
        }

        // Prices
        let str = "";
        let x = 0;
        let font = "";
        for (let i = 0; i < SHOP_ITEM_MAX; ++ i) {

            if (this.progress.isItemBought(this.id*SHOP_ITEM_MAX + i)) {

                str = this.loc["sold"];
                font = "fontGray";
            }
            else {

                font = this.menu[this.id].cpos == i ? "fontYellow" : "font";
                str = String(PRICES[this.id*SHOP_ITEM_MAX + i]) + String.fromCharCode(6);
            }
            x = MENU_RIGHT - str.length * 8;

            c.drawText(
                c.bitmaps[font], str, 
                x, topElementY + i*this.menu[this.id].offset, 0, 0, false);
        }

        // Bottom box
        let bottomElementY = topElementY + 
            this.menu[this.id].height + 
            BOTTOM_BOX_TOP_OFFSET + 12;
        drawBoxWithOutlines(c, 
            c.width/2 - MENU_WIDTH/2, 
            bottomElementY - 4,
            MENU_WIDTH, 
            BOTTOM_BOX_HEIGHT);

        // Description
        if (this.menu[this.id].cpos < this.menu[this.id].buttons.length-1) {

            str = this.loc["shopItemDesc"][this.id][this.menu[this.id].cpos];
            c.drawText(c.bitmaps["font"], str, 
                8, bottomElementY -2, 0, 1, 
                false);
        }
        
        if (this.message.active) {

            c.setColor(0, 0, 0, 0.67);
            c.fillRect(0, 0, c.width, c.height);

            this.message.draw(c, true);
        }
    }


    activate(id) {

        this.id = id;

        this.active = true;
        this.menu[this.id].activate(this.menu[this.id].buttons.length-1);

        this.itemWaitTime = 0;

        if (!this.progress.hasItem(ItemType.LifePotion) &&
            id == 1) {

            this.menu[this.id].toggleButton(4, true);
            this.progress.setItemBoughtStatus(9, false);
        }
    }


    deactivate() {

        this.menu[this.id].deactivate();
        this.active = false;
    }
}
