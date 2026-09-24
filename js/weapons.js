// PROJECT: BLACKOUT
// Weapon System

const Weapons = {

    list: [
        {
            id: "assault_rifle",
            name: "ASSAULT RIFLE",
            damage: 25,
            magazine: 30,
            ammo: 120,
            fireRate: 650,
            accuracy: 0.85
        },
        {
            id: "smg",
            name: "SMG",
            damage: 18,
            magazine: 35,
            ammo: 140,
            fireRate: 450,
            accuracy: 0.72
        },
        {
            id: "shotgun",
            name: "SHOTGUN",
            damage: 55,
            magazine: 8,
            ammo: 40,
            fireRate: 900,
            accuracy: 0.55
        },
        {
            id: "sniper",
            name: "SNIPER RIFLE",
            damage: 90,
            magazine: 5,
            ammo: 25,
            fireRate: 1400,
            accuracy: 0.98
        },
        {
            id: "pistol",
            name: "PISTOL",
            damage: 20,
            magazine: 12,
            ammo: 60,
            fireRate: 500,
            accuracy: 0.9
        }
    ],

    currentIndex: 4,

    currentAmmo: 12,

    init() {
        this.currentAmmo =
            this.list[this.currentIndex].magazine;

        this.updateHUD();

        console.log("Weapon system initialized.");
    },

    getCurrent() {
        return this.list[this.currentIndex];
    },

    switchWeapon(index) {
        if (index < 0 || index >= this.list.length) {
            return;
        }

        this.currentIndex = index;

        const weapon = this.getCurrent();

        this.currentAmmo = Math.min(
            weapon.magazine,
            weapon.ammo
        );

        this.updateHUD();
    },

    nextWeapon() {
        this.switchWeapon(
            (this.currentIndex + 1) %
            this.list.length
        );
    },

    fire() {

        const weapon = this.getCurrent();

        if (this.currentAmmo <= 0) {
            this.reload();
            return;
        }

        this.currentAmmo--;

        console.log(
            weapon.name + " fired"
        );

        if (typeof Enemies !== "undefined") {
            Enemies.checkHit(
                weapon.damage,
                weapon.accuracy
            );
        }

        this.updateHUD();
    },

    reload() {

        const weapon = this.getCurrent();

        if (weapon.ammo <= 0) {
            return;
        }

        const needed =
            weapon.magazine - this.currentAmmo;

        const amount =
            Math.min(needed, weapon.ammo);

        this.currentAmmo += amount;
        weapon.ammo -= amount;

        this.updateHUD();

        console.log("Reloaded.");
    },

    addAmmo(amount) {

        const weapon = this.getCurrent();

        weapon.ammo += amount;

        this.updateHUD();
    },

    updateHUD() {

        if (typeof UI === "undefined") {
            return;
        }

        const weapon = this.getCurrent();

        UI.updateWeapon(
            weapon.name,
            this.currentAmmo,
            weapon.ammo
        );
    }
};
