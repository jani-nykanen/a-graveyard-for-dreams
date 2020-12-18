/**
 * A Graveyard for Dreams
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

        this.fadeIn(ctx, vol, vol, loop, startTime);
    }


    fadeIn(ctx, initial, end, loop, startTime, fadeTime) {


        if (this.activeBuffer != null) {

            this.activeBuffer.disconnect();
            this.activeBuffer = null;
        }

        let bufferSource = ctx.createBufferSource();
        bufferSource.buffer = this.data;
        bufferSource.loop = Boolean(loop);

        initial = clamp(initial, 0.0, 1.0);
        end = clamp(end, 0.0, 1.0);

        // Not sure if these have any difference
        if (fadeTime != null) {

            this.gain.gain.setValueAtTime(initial, startTime);
        }
        else {

            this.gain.gain.value = initial;
        }

        this.startTime = ctx.currentTime - startTime;
        this.pauseTime = 0;
        this.playVol = initial;
        this.loop = loop;

        bufferSource.connect(this.gain).connect(ctx.destination);
        bufferSource.start(0, startTime);

        if (fadeTime != null) {

            this.gain.gain.exponentialRampToValueAtTime(end, startTime + fadeTime/1000.0);
        }

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
