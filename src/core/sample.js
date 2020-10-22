/**
 * A Graveyard for Fools
 * 
 * (c) 2020 Jani Nykänen
 */

import { clamp } from "./util.js";


export class AudioSample {


    constructor(ctx, data) {

        this.data = data;

        this.activeBuffer = null;

        this.gain = ctx.createGain();
    
        this.startTime = 0;
        this.pauseTime = 0;
        this.playVol = 0;
        this.loop = false;
    }


    play(ctx, vol, loop, startTime) {

        if (this.activeBuffer != null) {

            this.activeBuffer.disconnect();
            this.activeBuffer = null;
        }

        let bufferSource = ctx.createBufferSource();
        bufferSource.buffer = this.data;
        bufferSource.loop = Boolean(loop);

        vol = clamp(vol, 0.0, 1.0);
        this.gain.gain.value = vol;

        this.startTime = ctx.currentTime - startTime;
        this.pauseTime = 0;
        this.playVol = vol;
        this.loop = loop;

        bufferSource.connect(this.gain).connect(ctx.destination);
        bufferSource.start(0, startTime);

        this.activeBuffer = bufferSource;
    }


    stop() {

        if (this.activeBuffer == null) return;

        this.activeBuffer.disconnect();
        this.activeBuffer.stop(0);
        this.activeBuffer = null;
    }


    pause(ctx) {

        if (this.activeBuffer == null) return;

        this.pauseTime = ctx.currentTime - this.startTime;

        this.stop();
    }


    resume(ctx) {

        this.play(ctx, this.playVol, this.loop, this.pauseTime);
    }
}
