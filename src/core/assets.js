/**
 * The End of Journey
 * 
 * (c) 2020 Jani Nykänen
 */

import { Tilemap } from "./tilemap.js";


export class AssetPack {


    constructor() {

        this.bitmaps = {}
        this.tilemaps = {};

        this.total = 0;
        this.loaded = 0;
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


    hasLoaded() {

        return this.total == 0 ||
            this.loaded >= this.total;
    }


    dataLoadedPercentage() {

        return this.total == 0 ? 0 :
            this.loaded/this.total;
    }
}

