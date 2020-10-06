/**
 * The End of Journey
 * 
 * (c) 2020 Jani Nykänen
 */


export class AudioSample {


    constructor(player, data) {

        this.data = data;

        this.activeBuffer = null;
    }


    play(ctx, gain) {

        if (this.activeBuffer != null) {

            this.activeBuffer.disconnect();
            this.activeBuffer = null;
        }

        let bufferSource = ctx.createBufferSource();
        bufferSource.buffer = this.data;

        bufferSource.connect(gain).connect(ctx.destination);
        bufferSource.start(0);

        this.activeBuffer = bufferSource;
    }
}
