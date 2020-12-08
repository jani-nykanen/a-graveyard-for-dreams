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

    Snorkel: 4,
    Lubricant: 5,
    DownAttack: 6,
    ProteinBar: 7,

    StickyGlove: 8,
    TinyWings: 9,
    Beans: 10,
    FireBall: 11,

    FairyDust: 12,
    Gem: 13,
    Helmet: 14,
    Clothes: 15,

    DreamMap: 16,
    RunningBoots: 17,
    Chestplate: 18,
    Pills: 19,
    TreasureTracker: 20,
    
    Dummy: 21,
    LifePotion: 22,
    GoldenSword: 23,
    GoldenBoomerang: 24,
};



export class GameProgress {


    constructor(roomCountX, roomCountY) {

        this.maxHealth = 6;
        this.health = this.maxHealth;

        this.gems = 0;
        this.coins = 0;
        this.keys = 0;
        this.orbs = 0;

        this.openedChests = new Array(4);
        for (let i = 0; i < this.openedChests.length; ++ i) {

            this.openedChests[i] = (new Array(4)).fill(false);
        }

        this.openedDoors = (new Array(16)).fill(false);

        this.collectedStars = (new Array(16)).fill(false);
        this.stars = 0;

        // Approximated size, might need to increase later
        this.boughtItems = (new Array(5*2)).fill(false);

        this.obtainedItems = (new Array(32)).fill(false);

        this.visitedRooms = (new Array(roomCountX * roomCountY)).fill(false),
        this.roomCountX = roomCountX;
        this.roomCountY = roomCountY;

        // Only needed for the map
        this.isIntro = false;
    
        this.nightOrbActivated = false;
        this.isNight = false;
    }


    parseObject(obj) {

        this.maxHealth = obj["maxHealth"];
        this.health = obj["health"];

        this.nightOrbActivated = obj["nightOrbActivated"];
        this.isNight = obj["isNight"];

        this.gems = Number(obj["gems"]) | 0;
        this.coins = Number(obj["coins"]) | 0;
        this.keys = Number(obj["keys"]) | 0;
        this.orbs = Number(obj["orbs"]) | 0;
        this.stars = Number(obj["stars"]) | 0;

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

        if (obj["visitedRooms"] != undefined)
            this.visitedRooms = Array.from(obj["visitedRooms"]);

        if (obj["collectedStars"] != undefined)
            this.collectedStars = Array.from(obj["collectedStars"]);   
    }


    reset() {

        this.health = 6;
        if (this.hasItem(ItemType.FairyDust)) {

            this.health = Math.min(this.maxHealth, 12);
        }
    }


    reduceHealth(amount) {

        if (this.hasItem(ItemType.Chestplate)) {

            amount = Math.max(1, amount-1);
        }

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

        if (this.hasItem(ItemType.Pills)) {

            amount *= 2;
        }

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

        const GEM_COIN_BONUS = 50;

        this.obtainedItems[id] = true;

        // Hard-coded stuff hooray
        if (id == ItemType.Gem) {

            this.addCoins(GEM_COIN_BONUS);
        }
    }


    removeItem(id) {

        this.obtainedItems[id] = false;
    }


    hasItem(id) {

        return this.obtainedItems[id];
    }


    markRoomVisited(x, y) {

        if (this.isIntro) return;

        this.visitedRooms[y * this.roomCountX + x] = true;
    }


    isRoomVisited(x, y) {

        return this.visitedRooms[y * this.roomCountX + x];
    }


    markStarCollected(id) {

        this.collectedStars[id] = true;
        ++ this.stars;
    }


    hasStar(id) {

        return this.collectedStars[id];
    }

}
