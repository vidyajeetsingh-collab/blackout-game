// PROJECT: BLACKOUT
// Weapon System

const Weapons = {

    list: [
        {
            name: "ASSAULT RIFLE",
            damage: 25,
            magazine: 30,
            ammo: 120,
            fireRate: 0.12,
            accuracy: 0.92
        },
        {
            name: "SMG",
            damage: 18,
            magazine: 35,
            ammo: 140,
            fireRate: 0.08,
            accuracy: 0.82
        },
        {
            name: "SHOTGUN",
            damage: 50,
            magazine: 8,
            ammo: 40,
            fireRate: 0.7,
            accuracy: 0.65
        },
        {
            name: "SNIPER RIFLE",
            damage: 90,
            magazine: 5,
            ammo: 25,
            fireRate: 1.2,
            accuracy: 0.99
        },
        {
            name: "PISTOL",
            damage: 22,
            magazine: 12,
            ammo: 60,
            fireRate: 0.25,
            accuracy: 0.9
        }
    ],

    current: 4,

    ammoInMagazine: 12,

    lastShotTime: 0,

    init() {

        this.current = 4;
        this.ammoInMagazine =
            this.list[this.current].magazine;

        this.updateHUD();

        console.log("Weapon system initialized.");
    },

    getCurrent() {
        return this.list[this.current];
    },

    fire() {

        const weapon = this.getCurrent();

        const now = performance.now() / 1000;

        if (
            now - this.lastShotTime <
            weapon.fireRate
        ) {
            return;
        }

        if (this.ammoInMagazine <= 0) {

            this.reload();
            return;
        }

        this.lastShotTime = now;

        this.ammoInMagazine--;

        console.log(
            "FIRE:",
            weapon.name
        );

        // Check whether the shot hits an enemy.
        if (
            typeof Enemies !== "undefined" &&
            typeof Enemies.checkHit === "function"
        ) {
            Enemies.checkHit(
                weapon.damage
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
            weapon.magazine -
            this.ammoInMagazine;

        const amount =
            Math.min(
                needed,
                weapon.ammo
            );

        this.ammoInMagazine += amount;
        weapon.ammo -= amount;

        console.log(
            "RELOADED:",
            weapon.name
        );

        this.updateHUD();
    },

    switchWeapon(index) {

        if (
            index < 0 ||
            index >= this.list.length
        ) {
            return;
        }

        this.current = index;

        const weapon =
            this.getCurrent();

        this.ammoInMagazine =
            Math.min(
                weapon.magazine,
                weapon.magazine
            );

        this.updateHUD();

        console.log(
            "SWITCHED TO:",
            weapon.name
        );
    },

    nextWeapon() {

        this.current =
            (this.current + 1) %
            this.list.length;

        const weapon =
            this.getCurrent();

        this.ammoInMagazine =
            weapon.magazine;

        this.updateHUD();
    },

    addAmmo(amount) {

        const weapon =
            this.getCurrent();

        weapon.ammo += amount;

        this.updateHUD();
    },

    upgrade(index, upgrades = {}) {

        if (
            index < 0 ||
            index >= this.list.length
        ) {
            return;
        }

        const weapon =
            this.list[index];

        if (upgrades.damage) {
            weapon.damage +=
                upgrades.damage;
        }

        if (upgrades.magazine) {
            weapon.magazine +=
                upgrades.magazine;
        }

        if (upgrades.accuracy) {
            weapon.accuracy +=
                upgrades.accuracy;

            weapon.accuracy =
                Math.min(
                    weapon.accuracy,
                    1
                );
        }

        if (upgrades.fireRate) {
            weapon.fireRate =
                Math.max(
                    0.03,
                    weapon.fireRate -
                    upgrades.fireRate
                );
        }

        this.updateHUD();
    },

    updateHUD() {

        const weapon =
            this.getCurrent();

        if (
            typeof UI !== "undefined" &&
            typeof UI.updateWeapon === "function"
        ) {
            UI.updateWeapon(
                weapon.name,
                this.ammoInMagazine,
                weapon.ammo
            );
        }
    }
};
