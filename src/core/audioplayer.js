/**
 * The End of Journey
 * 
 * (c) 2020 Jani Nykänen
 */

 
export class AudioPlayer {


    constructor() {

        this.ctx = new AudioContext();

        this.musicTrack = null;
    }


    playSample(sample, vol) {

        sample.play(this.ctx, vol, false);
    }


    playMusic(sample, vol) {

        if (this.musicTrack != null) {

            this.musicTrack.stop();
            this.musicTrack = null;
        }

        sample.play(this.ctx, vol, true);
        this.musicTrack = sample;
    }
}
