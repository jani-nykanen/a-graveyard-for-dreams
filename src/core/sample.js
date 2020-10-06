/**
 * The End of Journey
 * 
 * (c) 2020 Jani Nykänen
 */

import { clamp } from "./util.js";


export class AudioSample {


    constructor(ctx, data) {

        this.data = data;

        this.activeBuffer = null;

        this.gain = ctx.createGain();
    }


    play(ctx, vol) {

        if (this.activeBuffer != null) {

            this.activeBuffer.disconnect();
            this.activeBuffer = null;
        }

        let bufferSource = ctx.createBufferSource();
        bufferSource.buffer = this.data;

        this.gain.gain.value = clamp(vol, 0.0, 1.0);

        bufferSource.connect(this.gain).connect(ctx.destination);
        bufferSource.start(0);

        this.activeBuffer = bufferSource;
    }
}
