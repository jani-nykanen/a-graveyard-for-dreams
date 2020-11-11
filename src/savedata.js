/**
 * A Graveyard for Fools
 * 
 * (c) 2020 Jani Nykänen
 */

import { Vector2 } from "./core/vector.js";


// Needed when working with Closure
let copyProgress = (progress) => {
    
    return {
    
        "maxHealth": progress.maxHealth,
        "health": progress.health,
        "gems": progress.gems,
        "coins": progress.coins,
        "keys": progress.keys,
        "orbs": progress.orbs,
        "openedChests": progress.openedChests,
        "openedDoors": progress.openedDoors,
        "boughtItems": progress.boughtItems,
    };
};



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


export function loadData(player) {

    let dataStr = null;

    try {

        dataStr = window.localStorage.getItem("agff_savedata");
    }
    catch(e) {

        console.log("SAVE ERROR: " + e);
        return false;
    }

    if (dataStr == null) {

        return false;
    }

    let obj = JSON.parse(dataStr);

    if (obj["progress"] != undefined) 
        player.progress.parseObject(obj.progress);

    if (obj["savePoint"] != undefined) 
        player.respawnToCheckpoint(new Vector2(obj["savePoint"]["x"], obj["savePoint"]["y"]));

    return true;
}
