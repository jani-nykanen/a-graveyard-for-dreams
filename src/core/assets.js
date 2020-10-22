/**
 * A Graveyard for Fools
 * 
 * (c) 2020 Jani Nykänen
 */

import { Tilemap } from "./tilemap.js";
import { AudioSample } from "./sample.js";


export class AssetPack {


    constructor(audioPlayer) {

        this.bitmaps = {}
        this.tilemaps = {};
        this.samples = {};
        this.music = {};

        this.total = 0;
        this.loaded = 0;

        this.audioPlayer = audioPlayer;
    }


    load(path) {

        this.loadListFile(path);
    } 


    loadTextfile(path, type, cb) {
        
        let xobj = new XMLHttpRequest();
        xobj.overrideMimeType("text/" + type);
        xobj.open("GET", path, true);

        ++ this.total;

        xobj.onreadystatechange = () => {

            if (xobj.readyState == 4 ) {

                if(String(xobj.status) == "200") {
                    
                    if (cb != undefined)
                        cb(xobj.responseText);
                }
                ++ this.loaded;
            }
                
        };
        xobj.send(null);  
    }


    loadListFile(path) {

        this.loadTextfile(path, "json", (str) => 

            this.parseAssetList(JSON.parse(str))
        );
    }


    parseAssetList(data) {

        //
        // The following monsters are required so that
        // Closure compiler can compile things nicely
        //

        // Bitmaps
        for (let k in data["bitmaps"]) {

            this.loadBitmap(
                data["bitmaps"][k]["name"],
                data["bitmapPath"] + data["bitmaps"][k]["path"]
            );
        }

        // Tilemaps
        for (let k in data["tilemaps"]) {

            this.loadTilemap(
                data["tilemaps"][k]["name"],
                data["tilemapPath"] +  data["tilemaps"][k]["path"]
            );
        }

        // Samples
        for (let k in data["samples"]) {

            this.loadSample(
                data["samples"][k]["name"],
                data["samplePath"] +  data["samples"][k]["path"]
            );
        }
    }


    loadBitmap(name, path) {

        ++ this.total;

        let image = new Image();
        image.onload = () => {

            ++ this.loaded;
            this.bitmaps[name] = image;
        }
        image.src = path;
    }


    loadTilemap(name, path) {

        ++ this.total;
        
        this.loadTextfile(path, "xml", (str) => {

            this.tilemaps[name] = new Tilemap(str);
            ++ this.loaded;
        });
    }


    loadSample(name, path) {

        ++ this.total;

        let xobj = new XMLHttpRequest();
        xobj.open("GET", path, true);
        xobj.responseType = "arraybuffer";

        // TODO: Check why this is different than loading text files
        xobj.onload = () => {

            this.audioPlayer.ctx.decodeAudioData(xobj.response, (data) => {
                
                ++ this.loaded;
                this.samples[name] = new AudioSample(this.audioPlayer.ctx, data);

            });
        }
        xobj.send(null);
    }


    hasLoaded() {

        return this.total == 0 ||
            this.loaded >= this.total;
    }


    // Not really percentage, but in range [0, 1]
    dataLoadedPercentage() {

        return this.total == 0 ? 0 :
            this.loaded/this.total;
    }
}

