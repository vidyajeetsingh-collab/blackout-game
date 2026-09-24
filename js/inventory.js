// PROJECT: BLACKOUT
// Inventory System

const Inventory = {

    weapons: [],
    items: [],

    init() {
        this.weapons = [
            "pistol"
        ];

        this.items = [];

        console.log("Inventory initialized.");
    },

    addWeapon(weaponId) {

        if (!this.weapons.includes(weaponId)) {
            this.weapons.push(weaponId);
        }

        console.log(
            "Weapon added:",
            weaponId
        );
    },

    hasWeapon(weaponId) {
        return this.weapons.includes(weaponId);
    },

    addItem(item) {

        this.items.push(item);

        console.log(
            "Item collected:",
            item
        );
    },

    useMedkit() {

        const index = this.items.indexOf(
            "medkit"
        );

        if (index === -1) {
            return false;
        }

        if (Player.health >= 100) {
            return false;
        }

        this.items.splice(index, 1);

        Player.heal(50);

        return true;
    },

    automaticPickup(item) {

        if (!item) {
            return;
        }

        if (item.type === "ammo") {
            Weapons.addAmmo(item.amount || 10);
        }

        else if (item.type === "medkit") {
            this.addItem("medkit");
        }

        else if (item.type === "weapon") {
            this.addWeapon(item.weaponId);
        }
    },

    clear() {
        this.weapons = ["pistol"];
        this.items = [];
    }
};
