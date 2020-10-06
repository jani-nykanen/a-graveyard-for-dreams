import { AudioSample } from "./sample.js";
/**
 * The End of Journey
 * 
 * (c) 2020 Jani Nykänen
 */

import { Tilemap } from "./tilemap.js";


export class AssetPack {


    constructor(audioPlayer) {

        this.bitmaps = {}
        this.tilemaps = {};
        this.samples = {};

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

        // Load bitmaps
        for (let k in data["bitmaps"]) {

            this.loadBitmap(
                data["bitmaps"][k]["name"],
                data["bitmapPath"] + data["bitmaps"][k]["path"]
            );
        }

        // Load tilemaps
        for (let k in data["tilemaps"]) {

            this.loadTilemap(
                data["tilemaps"][k]["name"],
                data["tilemapPath"] +  data["tilemaps"][k]["path"]
            );
        }

        // Load samples
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

        var request = new XMLHttpRequest();
        request.open("GET", path, true);
        request.responseType = "arraybuffer";

        // TODO: Check why this is different than loading text files
        request.onload = () => {

            this.audioPlayer.ctx.decodeAudioData(request.response, (data) => {
                
                ++ this.loaded;
                this.samples[name] = new AudioSample(this.audioPlayer.ctx, data);

            });
        }
        request.send();
    }


    hasLoaded() {

        return this.total == 0 ||
            this.loaded >= this.total;
    }


    dataLoadedPercentage() {

        return this.total == 0 ? 0 :
            this.loaded/this.total;
    }
}

