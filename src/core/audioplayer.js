/**
 * The End of Journey
 * 
 * (c) 2020 Jani Nykänen
 */

import { clamp } from "./util.js";


export class AudioPlayer {


    constructor() {

        this.ctx = new AudioContext();

        this.gain = this.ctx.createGain();
    }


    playSample(sample, vol) {

        this.gain.gain.value = clamp(vol, 0.0, 1.0);

        sample.play(this.ctx, this.gain);
    }
}
