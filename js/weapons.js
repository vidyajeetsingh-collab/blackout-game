// PROJECT: BLACKOUT
// Weapon System

const Weapons = {

    weapons: [
        {
            name: "PISTOL",
            damage: 20,
            magazine: 12,
            ammo: 60,
            maxMagazine: 12,
            fireRate: 400
        },
        {
            name: "SMG",
            damage: 12,
            magazine: 30,
            ammo: 120,
            maxMagazine: 30,
            fireRate: 110
        },
        {
            name: "ASSAULT RIFLE",
            damage: 25,
            magazine: 30,
            ammo: 120,
            maxMagazine: 30,
            fireRate: 140
        },
        {
            name: "SHOTGUN",
            damage: 60,
            magazine: 6,
            ammo: 36,
            maxMagazine: 6,
            fireRate: 750
        },
        {
            name: "SNIPER RIFLE",
            damage: 90,
            magazine: 5,
            ammo: 25,
            maxMagazine: 5,
            fireRate: 1000
        }
    ],

    currentIndex: 0,
    lastShot: 0,
    reloading: false,

    init() {

        this.currentIndex = 0;
        this.lastShot = 0;
        this.reloading = false;

        this.updateUI();

        this.setupControls();

        console.log(
            "Weapon system initialized."
        );
    },

    getCurrent() {

        return this.weapons[
            this.currentIndex
        ];
    },

    fire() {

        if (this.reloading) {
            return;
        }

        const weapon =
            this.getCurrent();

        const now =
            performance.now();

        if (
            now - this.lastShot <
            weapon.fireRate
        ) {
            return;
        }

        if (weapon.magazine <= 0) {

            this.reload();

            return;
        }

        this.lastShot = now;

        weapon.magazine--;

        console.log(
            "FIRE:",
            weapon.name
        );

        // Try to damage an enemy in front
        // if the enemy system supports it.
        if (
            typeof Enemies !== "undefined" &&
            typeof Enemies.hitTarget === "function"
        ) {

            Enemies.hitTarget(
                weapon.damage
            );
        }

        this.updateUI();

        // Automatic reload
        if (
            weapon.magazine <= 0 &&
            weapon.ammo > 0
        ) {

            setTimeout(
                () => this.reload(),
                250
            );
        }
    },

    reload() {

        if (this.reloading) {
            return;
        }

        const weapon =
            this.getCurrent();

        if (
            weapon.magazine >=
            weapon.maxMagazine
        ) {
            return;
        }

        if (weapon.ammo <= 0) {
            return;
        }

        this.reloading = true;

        this.updateUI();

        setTimeout(() => {

            const needed =
                weapon.maxMagazine -
                weapon.magazine;

            const available =
                Math.min(
                    needed,
                    weapon.ammo
                );

            weapon.magazine +=
                available;

            weapon.ammo -=
                available;

            this.reloading = false;

            this.updateUI();

        }, 900);
    },

    nextWeapon() {

        this.currentIndex++;

        if (
            this.currentIndex >=
            this.weapons.length
        ) {

            this.currentIndex = 0;
        }

        this.reloading = false;

        this.updateUI();
    },

    previousWeapon() {

        this.currentIndex--;

        if (
            this.currentIndex < 0
        ) {

            this.currentIndex =
                this.weapons.length - 1;
        }

        this.reloading = false;

        this.updateUI();
    },

    updateUI() {

        const weapon =
            this.getCurrent();

        const weaponElement =
            document.getElementById(
                "weapon"
            );

        const ammoElement =
            document.getElementById(
                "ammo"
            );

        if (weaponElement) {

            weaponElement.textContent =
                weapon.name;
        }

        if (ammoElement) {

            if (this.reloading) {

                ammoElement.textContent =
                    "RELOADING...";

            } else {

                ammoElement.textContent =
                    weapon.magazine +
                    " / " +
                    weapon.ammo;
            }
        }
    },

    setupControls() {

        const fireButton =
            document.getElementById(
                "shootButton"
            );

        const weaponButton =
            document.getElementById(
                "weaponButton"
            );

        if (fireButton) {

            fireButton.addEventListener(
                "pointerdown",
                (event) => {

                    event.preventDefault();

                    this.fire();
                }
            );
        }

        if (weaponButton) {

            weaponButton.addEventListener(
                "pointerdown",
                (event) => {

                    event.preventDefault();

                    this.nextWeapon();
                }
            );
        }
    },

    addAmmo(amount) {

        const weapon =
            this.getCurrent();

        weapon.ammo += amount;

        this.updateUI();
    },

    reset() {

        this.currentIndex = 0;
        this.reloading = false;

        for (
            const weapon of this.weapons
        ) {

            weapon.magazine =
                weapon.maxMagazine;
        }

        this.updateUI();
    }
};