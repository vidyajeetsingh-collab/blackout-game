// PROJECT: BLACKOUT
// Complete Weapon System
// Firing, Reloading, Ammo Limits, Switching

const Weapons = {
    weapons: [
        {
            name: "PISTOL",
            damage: 20,
            magazine: 12,
            ammo: 60,
            maxMagazine: 12,
            fireRate: 400,
            automatic: false,
            pellets: 1,
            range: 65,
            reloadDuration: 1000
        },
        {
            name: "SMG",
            damage: 12,
            magazine: 30,
            ammo: 120,
            maxMagazine: 30,
            fireRate: 110,
            automatic: true,
            pellets: 1,
            range: 55,
            reloadDuration: 1400
        },
        {
            name: "ASSAULT RIFLE",
            damage: 25,
            magazine: 30,
            ammo: 120,
            maxMagazine: 30,
            fireRate: 140,
            automatic: true,
            pellets: 1,
            range: 65,
            reloadDuration: 1600
        },
        {
            name: "SHOTGUN",
            damage: 15,
            magazine: 6,
            ammo: 36,
            maxMagazine: 6,
            fireRate: 750,
            automatic: false,
            pellets: 6,
            range: 24,
            reloadDuration: 1800
        },
        {
            name: "SNIPER RIFLE",
            damage: 90,
            magazine: 5,
            ammo: 25,
            maxMagazine: 5,
            fireRate: 1000,
            automatic: false,
            pellets: 1,
            range: 100,
            reloadDuration: 2000
        }
    ],

    currentIndex: 0,
    lastShot: 0,
    reloading: false,
    firing: false,
    fireTimer: null,
    reloadTimer: null,
    reloadDuration: 1200,
    maxAmmoReserve: 240,
    initialized: false,

    init() {
        this.stopFiring();
        this.cancelReload();

        this.currentIndex = 0;
        this.lastShot = 0;

        this.setupControls();
        this.updateUI();

        this.initialized = true;
        console.log("BLACKOUT Weapon System initialized.");
    },

    getCurrent() {
        return this.weapons[this.currentIndex];
    },

    fire() {
        if (
            !this.initialized ||
            this.reloading ||
            this.isGamePaused()
        ) {
            return false;
        }

        const weapon = this.getCurrent();
        const now = performance.now();

        if (now - this.lastShot < weapon.fireRate) {
            return false;
        }

        if (weapon.magazine <= 0) {
            if (weapon.ammo > 0) {
                this.reload();
            } else {
                this.showMessage("OUT OF AMMO");
            }
            return false;
        }

        this.lastShot = now;
        weapon.magazine--;

        const soundNames = {
            "PISTOL": "pistol",
            "SMG": "smg",
            "ASSAULT RIFLE": "rifle",
            "SHOTGUN": "shotgun",
            "SNIPER RIFLE": "sniper"
        };

        if (typeof AudioSystem !== "undefined") {
            AudioSystem.playShot(soundNames[weapon.name] || "pistol");
        }

        let hit = false;

        if (
            typeof Enemies !== "undefined" &&
            typeof Enemies.hitTarget === "function"
        ) {
            const pellets = Math.max(1, weapon.pellets || 1);

            for (let i = 0; i < pellets; i++) {
                // Shotgun pellets are separate hit attempts.
                const result = Enemies.hitTarget(
                    weapon.damage,
                    weapon.range,
                    weapon.name === "SHOTGUN"
                );

                if (result === true) hit = true;
            }
        }

        this.updateUI();
        this.showFireFeedback(hit);

        if (weapon.magazine <= 0) {
            this.stopFiring();

            if (weapon.ammo > 0) {
                this.reload();
            } else {
                this.showMessage("MAGAZINE EMPTY");
            }
        }

        return true;
    },

    startFiring() {
        if (this.firing || this.isGamePaused()) return;

        this.firing = true;
        const weapon = this.getCurrent();

        this.fire();

        if (!weapon.automatic) return;

        this.fireTimer = setInterval(() => {
            if (!this.firing || this.isGamePaused()) {
                this.stopFiring();
                return;
            }

            this.fire();
        }, 35);
    },

    stopFiring() {
        this.firing = false;

        if (this.fireTimer !== null) {
            clearInterval(this.fireTimer);
            this.fireTimer = null;
        }
    },

    reload() {
        if (
            !this.initialized ||
            this.reloading
        ) {
            return;
        }

        this.stopFiring();

        const weapon = this.getCurrent();

        if (weapon.magazine >= weapon.maxMagazine) {
            this.showMessage("MAGAZINE FULL");
            return;
        }

        if (weapon.ammo <= 0) {
            this.showMessage("NO AMMO");
            return;
        }

        this.reloading = true;

        if (typeof AudioSystem !== "undefined") {
            AudioSystem.reload();
        }

        this.updateUI();
        this.showMessage("RELOADING...");

        this.reloadTimer = setTimeout(() => {
            const needed = weapon.maxMagazine - weapon.magazine;
            const available = Math.min(needed, weapon.ammo);

            weapon.magazine += available;
            weapon.ammo -= available;

            this.reloading = false;
            this.reloadTimer = null;

            this.updateUI();
            this.showMessage("RELOADED");
        }, weapon.reloadDuration || this.reloadDuration);
    },

    cancelReload() {
        if (this.reloadTimer !== null) {
            clearTimeout(this.reloadTimer);
            this.reloadTimer = null;
        }

        this.reloading = false;
    },

    nextWeapon() {
        this.selectWeapon((this.currentIndex + 1) % this.weapons.length);
        this.showMessage(this.getCurrent().name);
    },

    previousWeapon() {
        this.selectWeapon(
            (this.currentIndex - 1 + this.weapons.length) %
            this.weapons.length
        );

        this.showMessage(this.getCurrent().name);
    },

    selectWeapon(index) {
        if (
            !Number.isInteger(index) ||
            index < 0 ||
            index >= this.weapons.length
        ) {
            return;
        }

        if (index === this.currentIndex) return;

        this.stopFiring();
        this.cancelReload();

        this.currentIndex = index;
        this.lastShot = 0;

        this.updateUI();
    },

    updateUI() {
        const weapon = this.getCurrent();

        const weaponElement = document.getElementById("weapon");
        const ammoElement = document.getElementById("ammo");
        const reloadButton = document.getElementById("reloadButton");

        if (weaponElement) {
            weaponElement.textContent = weapon.name;
        }

        if (ammoElement) {
            ammoElement.textContent = this.reloading
                ? "RELOADING..."
                : weapon.magazine + " / " + weapon.ammo;
        }

        if (reloadButton) {
            reloadButton.textContent = this.reloading
                ? "RELOADING"
                : "RELOAD";
        }
    },

    setupControls() {
        const fireButton = document.getElementById("shootButton");
        const weaponButton = document.getElementById("weaponButton");

        if (fireButton && !fireButton.dataset.weaponBound) {
            fireButton.dataset.weaponBound = "true";

            fireButton.addEventListener("pointerdown", event => {
                event.preventDefault();
                this.startFiring();
            });

            const stop = () => this.stopFiring();

            fireButton.addEventListener("pointerup", stop);
            fireButton.addEventListener("pointercancel", stop);
            fireButton.addEventListener("lostpointercapture", stop);
            window.addEventListener("pointerup", stop);
            window.addEventListener("blur", stop);
        }

        if (weaponButton && !weaponButton.dataset.weaponBound) {
            weaponButton.dataset.weaponBound = "true";

            weaponButton.addEventListener("pointerdown", event => {
                event.preventDefault();
                this.nextWeapon();
            });
        }

        this.createReloadButton();

        if (!this.keyboardBound) {
            this.keyboardBound = true;

            window.addEventListener("keydown", event => {
                if (event.repeat || this.isGamePaused()) return;

                switch (event.key.toLowerCase()) {
                    case "r":
                        this.reload();
                        break;
                    case "1":
                    case "2":
                    case "3":
                    case "4":
                    case "5":
                        this.selectWeapon(Number(event.key) - 1);
                        break;
                }
            });
        }
    },

    keyboardBound: false,

    createReloadButton() {
        const controls = document.getElementById("actionButtons");

        if (
            !controls ||
            document.getElementById("reloadButton")
        ) {
            return;
        }

        const button = document.createElement("button");
        button.id = "reloadButton";
        button.textContent = "RELOAD";
        controls.appendChild(button);

        button.addEventListener("pointerdown", event => {
            event.preventDefault();
            this.reload();
        });
    },

    showFireFeedback(hit) {
        const crosshair = document.getElementById("crosshair");
        if (!crosshair) return;

        crosshair.textContent = hit ? "×" : "+";
        crosshair.style.color = hit ? "#ff5555" : "#ffffff";

        if (this.crosshairTimer) {
            clearTimeout(this.crosshairTimer);
        }

        this.crosshairTimer = setTimeout(() => {
            crosshair.textContent = "+";
            crosshair.style.color = "#ffffff";
        }, 120);
    },

    showMessage(message) {
        if (typeof UI !== "undefined" && UI.showMessage) {
            UI.showMessage(message);
        }
    },

    isGamePaused() {
        return typeof UI !== "undefined" && UI.paused === true;
    },

    addAmmo(amount, weaponIndex = this.currentIndex) {
        const weapon = this.weapons[weaponIndex];
        if (!weapon) return 0;

        const room = Math.max(0, this.maxAmmoReserve - weapon.ammo);
        const added = Math.min(room, Math.max(0, Number(amount) || 0));

        weapon.ammo += added;
        this.updateUI();

        return added;
    },

    reset() {
        this.stopFiring();
        this.cancelReload();

        this.currentIndex = 0;
        this.lastShot = 0;

        const startingAmmo = [
            [12, 60],
            [30, 120],
            [30, 120],
            [6, 36],
            [5, 25]
        ];

        this.weapons.forEach((weapon, index) => {
            weapon.magazine = startingAmmo[index][0];
            weapon.ammo = startingAmmo[index][1];
        });

        this.updateUI();
    }
};