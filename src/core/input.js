/**
 * The End of Journey
 * 
 * (c) 2020 Jani Nykänen
 */


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

    
    addAction(name, key) {

        this.actions[name] = {
            state: State.Up,
            key: key
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
        }
        this.updateStateArray(this.keyStates);
    }

}
