/**
 * The End of Journey
 * 
 * (c) 2020 Jani Nykänen
 */

 
export class AudioPlayer {


    constructor() {

        this.ctx = new AudioContext();
    }


    playSample(sample, vol) {

        sample.play(this.ctx, vol);
    }
}
