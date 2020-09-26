/**
 * The End of Journey
 * 
 * (c) 2020 Jani Nykänen
 */

import { GamePadListener } from "./gamepad.js";


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


    update() {

        for (let k in this.actions) {

            this.actions[k].state = this.keyStates[this.actions[k].key] | State.Up;
            if (this.actions[k].state == State.Up) {

                if (this.actions[k].button1 != null)
                    this.actions[k].state = this.gamepad.getButtonState(this.actions[k].button1);

                if (this.actions[k].state == State.Up &&
                    this.actions[k].button2 != null)
                    this.actions[k].state = this.gamepad.getButtonState(this.actions[k].button2);
            }
        }
        this.updateStateArray(this.keyStates);
    }

}
