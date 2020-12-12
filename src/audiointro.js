/**
 * A Graveyard for Fools
 * 
 * (c) 2020 Jani Nykänen
 */

import { Menu, MenuButton } from "./menu.js";
import { Scene } from "./core/scene.js";
import { TitleScreen } from "./titlescreen.js";
import { Intro } from "./intro.js";


export class AudioIntro extends Scene {


    constructor(ev, param) {

        super(ev, param);

        let loc = ev.assets.localization["en"];

        this.menu = new Menu(12, true,
            [
                new MenuButton(
                    loc["yes"], (ev) => {

                        ev.audio.toggle(true);
                        ev.audio.setGlobalSampleVolume(0.40);   

                        ev.changeScene(Intro);
                        
                    }, false),
                new MenuButton(
                    loc["no"], (ev) => {

                        ev.audio.toggle(false);
                        ev.changeScene(Intro);
                    }, true)
            ]);

        this.questionText = loc["audiointro"];
    }


    refresh(ev) {

        this.menu.update(ev);
    }


    redraw(c) {

        c.clear(0, 85, 170);

        c.drawText(c.bitmaps["font"],
            this.questionText,
            32, c.height/2 - 32, 0, 2, false);

        this.menu.draw(c, c.width/2, c.height/2+16);
    }

}
