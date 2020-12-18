/**
 * A Graveyard for Dreams
 * 
 * (c) 2020 Jani Nykänen
 */

import { negMod } from "./util.js";


export class Tilemap {
    

    constructor() {

        this.width = 0;
        this.height = 0;
        this.layers = new Array();
        this.properties = {};
    }


    parse(s) {

        let doc = (new DOMParser()).parseFromString(s, "text/xml");

        let root = doc.getElementsByTagName("map")[0];
        this.width = Number(root.getAttribute("width"));
        this.height = Number(root.getAttribute("height"));

        let data = root.getElementsByTagName("layer");
        this.layers = new Array();

        // Find the minimal id
        let min = 9999; // "Big number"
        for (let d of data) {

            if (d.id < min) {

                min = d.id;
            }
        }

        let str, content;
        let id;
        for (let i = 0; i < data.length; ++ i) {

            id = data[i].id-min;

            // Get layer data & remove newlines
            str = data[i].getElementsByTagName("data")[0]
                .childNodes[0]
                .nodeValue
                .replace(/(\r\n|\n|\r)/gm, "");
            content = str.split(",");

            this.layers[id] = new Array();
            for (let j = 0; j < content.length; ++ j) {

                this.layers[id][j] = parseInt(content[j]);
            }
        }

        // Read (optional) properties
        this.properties = {};
        let prop = root.getElementsByTagName("properties")[0];

        if (prop != undefined) {

            for (let p of prop.getElementsByTagName("property")) {

                if ( p.getAttribute("name") != undefined) {

                    this.properties[ p.getAttribute("name")] = p.getAttribute("value");
                }
            }
        }   

        return this;
    }


    getTile(layer, x, y) {

        if (x < 0 || y < 0 || x >= this.width || y >= this.height)
            return 0;

        return this.layers[layer][y*this.width + x];
    }


    getLoopedTile(layer, x, y) {

        return this.layers[layer] [negMod(y, this.height) * this.width + negMod(x, this.width)];
    }


    setTile(layer, x, y, v) {

        x = negMod(x, this.width);
        y = negMod(y, this.height);

        this.layers[layer][y*this.width + x] = v;
    }


    cloneLayer(layer) {

        return Array.from(this.layers[layer]); 
    }


    shallowCopy() {

        let copy = new Tilemap();

        for (let l of this.layers) {

            copy.layers.push(Array.from(l));
        }

        copy.width = this.width;
        copy.height = this.height;

        copy.properties = this.properties;

        return copy;
    }
}
