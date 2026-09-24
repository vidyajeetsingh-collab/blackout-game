// PROJECT: BLACKOUT
// Inventory System

const Inventory = {

    weapons: [],
    items: [],
    maxItems: 20,

    init() {
        this.weapons = ["PISTOL"];
        this.items = [];

        console.log("Inventory initialized.");
    },

    addWeapon(name) {

        if (!name) return;

        if (!this.hasWeapon(name)) {
            this.weapons.push(name);
            console.log("Weapon added:", name);
        }
    },

    hasWeapon(name) {
        return this.weapons.includes(name);
    },

    addItem(item) {

        if (!item) return;

        if (this.items.length >= this.maxItems) {
            console.log("Inventory full.");
            return;
        }

        this.items.push(item);

        console.log("Item added:", item);
    },

    useMedkit() {

        const index =
            this.items.indexOf("MEDKIT");

        if (index === -1) {
            return false;
        }

        this.items.splice(index, 1);

        if (
            typeof Player !== "undefined" &&
            typeof Player.heal === "function"
        ) {
            Player.heal(40);
        }

        console.log("Medkit used.");

        return true;
    },

    automaticPickup(loot) {

        if (!loot) return;

        if (loot.ammo) {

            if (
                typeof Weapons !== "undefined" &&
                typeof Weapons.addAmmo === "function"
            ) {
                Weapons.addAmmo(loot.ammo);
            }
        }

        if (loot.item) {
            this.addItem(loot.item);
        }

        if (loot.medkit) {
            this.addItem("MEDKIT");
        }
    },

    getWeapons() {
        return [...this.weapons];
    },

    getItems() {
        return [...this.items];
    },

    clear() {
        this.weapons = ["PISTOL"];
        this.items = [];
    }
};
