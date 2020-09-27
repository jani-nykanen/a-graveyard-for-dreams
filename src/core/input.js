/**
 * The End of Journey
 * 
 * (c) 2020 Jani Nykänen
 */

import { GamePadListener } from "./gamepad.js";
import { Vector2 } from "./vector.js";


 export const State = {

    Up : 0, 
    Released : 2,
    Down : 1, 
    Pressed : 3, 

    DownOrPressed : 1,
}


export class InputManager {

    constructor() {

        this.keyStates = {};
        this.prevent = {};
        this.actions = {};

        this.gamepad = new GamePadListener();

        this.stick = new Vector2();

        window.addEventListener("keydown", 
            (e) => {

                if (this.keyPressed(e.code)) 
                    e.preventDefault();
            });
        window.addEventListener("keyup", 
            (e) => {

                if (this.keyReleased(e.code))
                    e.preventDefault();
            });   
    
        window.addEventListener("contextmenu", (e) => {

            e.preventDefault();
        });

        // To get the focus when embedded to an iframe
        window.addEventListener("mousemove", (e) => {

            window.focus();
        });
        window.addEventListener("mousedown", (e) => {

            window.focus();
        });
    }

    
    addAction(name, key, button1, button2) {

        this.actions[name] = {
            state: State.Up,
            key: key,
            button1: button1,
            button2: button2
        };
        this.prevent[key] = true;

        return this;
    }

    
    keyPressed(key) {

        if (this.keyStates[key] != State.Down) 
            this.keyStates[key] = State.Pressed;

        return this.prevent[key];
    }


    keyReleased(key) {

        if (this.keyStates[key] != State.Up)
            this.keyStates[key] = State.Released;

        return this.prevent[key];
    }


    updateStateArray(arr) {

        for (let k in arr) {

            if (arr[k] == State.Pressed)
                arr[k] = State.Down;
            else if(arr[k] == State.Released) 
                arr[k] = State.Up;
        }
    }


    updateStick() {

        const DEADZONE = 0.1;

        this.stick.zeros();
        if (this.gamepad.stick.length() > DEADZONE) {

            this.stick = this.gamepad.stick.clone();
        }
        
        if (this.actions["right"].state & State.DownOrPressed) {

            this.stick.x = 1;
        }
        else if (this.actions["left"].state & State.DownOrPressed) {

            this.stick.x = -1;
        }

        if (this.actions["down"].state & State.DownOrPressed) {

            this.stick.y = 1;
        }
        else if (this.actions["up"].state & State.DownOrPressed) {

            this.stick.y = -1;
        }

        // We could normalize the stick here if we were making
        // a top-down game, not a side-scrolling one
        // this.stick.normalize();
    }


    // This one is called before the current scene
    // is "refreshed"
    preUpdate() {

        this.gamepad.update();

        for (let k in this.actions) {

            this.actions[k].state = this.keyStates[this.actions[k].key] | State.Up;
            if (this.actions[k].state == State.Up) {

                if (this.actions[k].button1 != null)
                    this.actions[k].state = this.gamepad
                        .getButtonState(this.actions[k].button1);

                if (this.actions[k].state == State.Up &&
                    this.actions[k].button2 != null) {

                    this.actions[k].state = this.gamepad
                        .getButtonState(this.actions[k].button2);
                }
            }
        }

        this.updateStick();
    }


    // And this one afterwards
    postUpdate() {

        this.updateStateArray(this.keyStates);
    }

}
