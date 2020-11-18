/**
 * A Graveyard for Fools
 * 
 * (c) 2020 Jani Nykänen
 */


export const ItemType = {
    Sword: 0,
    JumpBoots: 1,
    Boomerang: 2,
    Flippers: 3,
};



export class GameProgress {


    constructor() {

        this.maxHealth = 6;
        this.health = this.maxHealth;

        this.gems = 0;
        this.coins = 20;
        this.keys = 0;
        this.orbs = 0;

        this.openedChests = new Array(4);
        for (let i = 0; i < this.openedChests.length; ++ i) {

            this.openedChests[i] = (new Array(4)).fill(false);
        }

        this.openedDoors = (new Array(16)).fill(false);

        // Approximated size, might need to increase later
        this.boughtItems = (new Array(5*2)).fill(false);

        this.obtainedItems = (new Array(32)).fill(false);
    }


    parseObject(obj) {

        this.maxHealth = obj["maxHealth"];
        this.health = this.maxHealth;

        this.gems = obj["gems"];
        this.coins = obj["coins"];
        this.keys = obj["keys"];
        this.orbs = obj["orbs"];

        if (obj["openedChests"] != undefined) {

            for (let i = 0; i < this.openedChests.length; ++ i) {

                this.openedChests[i] = Array.from(obj["openedChests"][i]);
            }
        }
        if (obj["openedDoors"] != undefined)
            this.openedDoors = Array.from(obj["openedDoors"]);

        if (obj["boughtItems"] != undefined)
            this.boughtItems = Array.from(obj["boughtItems"]);

        if (obj["obtainedItems"] != undefined)
            this.obtainedItems = Array.from(obj["obtainedItems"]);    
    }


    reset() {

        this.health = 6; // this.maxHealth;
    }


    reduceHealth(amount) {

        this.health = Math.max(0, this.health - amount);
    }


    addCoins(count) {

        this.coins += count;
    }


    addOrbs(count) {

        this.orbs += count;
    }


    addKeys(count) {

        this.keys += count;
    }


    addHealth(amount) {

        this.health = Math.min(this.maxHealth, this.health + amount);
    }


    addMaxHealth(amount) {

        this.health += amount * 2;
        this.maxHealth += amount * 2;
    }


    getHealthRatio() {

        return this.health / this.maxHealth;
    }


    markChestOpened(type, id) {

        (this.openedChests[type])[id] = true;
        if (type == 1) {

            this.obtainedItems[id] = true;
        }
    }


    isChestOpened(type, id) {

        return (this.openedChests[type])[id];
    }


    markDoorOpened(id) {

        this.openedDoors[id] = true;
    }


    isDoorOpened(id) {

        return this.openedDoors[id];
    }


    setItemBoughtStatus(index, bought) {

        this.boughtItems[index] = bought;
    }


    isItemBought(index) {

        return this.boughtItems[index];
    }


    restoreHealth() {

        this.health = this.maxHealth;
    }


    obtainItem(id) {

        this.obtainedItems[id] = true;
    }


    hasItem(id) {

        return this.obtainedItems[id];
    }
}
