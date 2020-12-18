/**
 * A Graveyard for Dreams
 * 
 * (c) 2020 Jani Nykänen
 */

import { Vector2 } from "./core/vector.js";


// Needed when working with Closure compiler
let copyProgress = (progress) => {
    
    return {
    
        "health": progress.health,
        "maxHealth": progress.maxHealth,
        "gems": progress.gems,
        "coins": progress.coins,
        "keys": progress.keys,
        "orbs": progress.orbs,
        "openedChests": progress.openedChests,
        "openedDoors": progress.openedDoors,
        "boughtItems": progress.boughtItems,
        "obtainedItems": progress.obtainedItems,
        "visitedRooms": progress.visitedRooms,
        "nightOrbActivated": progress.nightOrbActivated,
        "isNight": progress.isNight,
        "collectedStars": progress.collectedStars,
        "stars": progress.stars,
        "isIntro": progress.isIntro,
    };
};


export class LoadedData {


    constructor(progress, savePoint) {

        this.progress = progress;
        this.savePoint = savePoint
    }


    applyProgress(progress) {

        if (this.progress != undefined)
            progress.parseObject(this.progress);
    }


    applySavePoint(player) {

        player.respawnToCheckpoint(this.savePoint.clone());
    }
}


export function saveData(player) {

    let data = {};

    data["progress"] = copyProgress(Object.assign(player.progress));
    data["savePoint"] = {"x": player.checkpoint.x, "y": player.checkpoint.y};

    let strData = JSON.stringify(data);

    try {

        window.localStorage.setItem("agff_savedata", strData);
    }
    catch(e) {

        console.log("Save error: " + e);
        return false;
    }

    return true;
}


export function loadData() {

    let dataStr = null;

    try {

        dataStr = window.localStorage.getItem("agff_savedata");
    }
    catch(e) {

        console.log("SAVE ERROR: " + e);
        return null;
    }

    if (dataStr == null) {

        return null;
    }

    let obj = JSON.parse(dataStr);

    return new LoadedData(
            obj["progress"], 
            new Vector2(obj["savePoint"]["x"], obj["savePoint"]["y"])
        );
}
