// PROJECT: BLACKOUT
// Weapon System
// Weapon Switching + Firing + Reloading

const Weapons = {

    weapons: [
        {
            name: "PISTOL",
            damage: 20,
            magazine: 12,
            ammo: 60,
            maxMagazine: 12,
            fireRate: 400,
            automatic: false
        },
        {
            name: "SMG",
            damage: 12,
            magazine: 30,
            ammo: 120,
            maxMagazine: 30,
            fireRate: 110,
            automatic: true
        },
        {
            name: "ASSAULT RIFLE",
            damage: 25,
            magazine: 30,
            ammo: 120,
            maxMagazine: 30,
            fireRate: 140,
            automatic: true
        },
        {
            name: "SHOTGUN",
            damage: 60,
            magazine: 6,
            ammo: 36,
            maxMagazine: 6,
            fireRate: 750,
            automatic: false
        },
        {
            name: "SNIPER RIFLE",
            damage: 90,
            magazine: 5,
            ammo: 25,
            maxMagazine: 5,
            fireRate: 1000,
            automatic: false
        }
    ],

    currentIndex: 0,

    lastShot: 0,

    reloading: false,

    firing: false,

    fireTimer: null,

    reloadTimer: null,

    reloadDuration: 1200,

    initialized: false,

    init() {

        this.stopFiring();
        this.cancelReload();

        this.currentIndex = 0;
        this.lastShot = 0;
        this.reloading = false;

        this.setupControls();
        this.updateUI();

        this.initialized = true;

        console.log(
            "BLACKOUT Weapon System initialized."
        );
    },

    getCurrent() {

        return this.weapons[
            this.currentIndex
        ];
    },

    fire() {

        if (
            !this.initialized ||
            this.reloading ||
            this.isGamePaused()
        ) {
            return false;
        }

        const weapon =
            this.getCurrent();

        const now =
            performance.now();

        if (
            now - this.lastShot <
            weapon.fireRate
        ) {
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

        let hit = false;

        if (
            typeof Enemies !== "undefined" &&
            typeof Enemies.hitTarget === "function"
        ) {

            const result =
                Enemies.hitTarget(
                    weapon.damage
                );

            hit = result === true;
        }

        this.updateUI();

        this.showFireFeedback(hit);

        if (
            weapon.magazine <= 0 &&
            weapon.ammo > 0
        ) {

            this.stopFiring();

            this.reload();
        }

        return true;
    },

    startFiring() {

        if (this.firing) {
            return;
        }

        if (this.isGamePaused()) {
            return;
        }

        this.firing = true;

        const weapon =
            this.getCurrent();

        this.fire();

        if (!weapon.automatic) {
            return;
        }

        this.fireTimer =
            setInterval(
                () => {

                    if (
                        !this.firing ||
                        this.isGamePaused()
                    ) {

                        this.stopFiring();
                        return;
                    }

                    this.fire();

                },
                35
            );
    },

    stopFiring() {

        this.firing = false;

        if (this.fireTimer !== null) {

            clearInterval(
                this.fireTimer
            );

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

        const weapon =
            this.getCurrent();

        if (
            weapon.magazine >=
            weapon.maxMagazine
        ) {
            return;
        }

        if (weapon.ammo <= 0) {

            this.showMessage("NO AMMO");

            return;
        }

        this.reloading = true;

        this.updateUI();

        this.showMessage("RELOADING...");

        this.reloadTimer =
            setTimeout(
                () => {

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
                    this.reloadTimer = null;

                    this.updateUI();

                    this.showMessage("RELOADED");

                },
                this.reloadDuration
            );
    },

    cancelReload() {

        if (this.reloadTimer !== null) {

            clearTimeout(
                this.reloadTimer
            );

            this.reloadTimer = null;
        }

        this.reloading = false;
    },

    nextWeapon() {

        this.stopFiring();
        this.cancelReload();

        this.currentIndex++;

        if (
            this.currentIndex >=
            this.weapons.length
        ) {
            this.currentIndex = 0;
        }

        this.lastShot = 0;

        this.updateUI();

        this.showMessage(
            this.getCurrent().name
        );
    },

    previousWeapon() {

        this.stopFiring();
        this.cancelReload();

        this.currentIndex--;

        if (this.currentIndex < 0) {

            this.currentIndex =
                this.weapons.length - 1;
        }

        this.lastShot = 0;

        this.updateUI();

        this.showMessage(
            this.getCurrent().name
        );
    },

    selectWeapon(index) {

        if (
            index < 0 ||
            index >= this.weapons.length
        ) {
            return;
        }

        this.stopFiring();
        this.cancelReload();

        this.currentIndex = index;
        this.lastShot = 0;

        this.updateUI();
    },

    updateUI() {

        const weapon =
            this.getCurrent();

        const weaponElement =
            document.getElementById("weapon");

        const ammoElement =
            document.getElementById("ammo");

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

        const reloadButton =
            document.getElementById(
                "reloadButton"
            );

        if (reloadButton) {

            reloadButton.textContent =
                this.reloading
                    ? "RELOADING"
                    : "RELOAD";
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

                    this.startFiring();
                }
            );

            const stop = () => {
                this.stopFiring();
            };

            fireButton.addEventListener(
                "pointerup",
                stop
            );

            fireButton.addEventListener(
                "pointercancel",
                stop
            );

            fireButton.addEventListener(
                "lostpointercapture",
                stop
            );

            window.addEventListener(
                "pointerup",
                stop
            );

            window.addEventListener(
                "blur",
                stop
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

        this.createReloadButton();

        window.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.repeat ||
                    this.isGamePaused()
                ) {
                    return;
                }

                if (
                    event.key.toLowerCase() === "r"
                ) {

                    this.reload();

                } else if (
                    event.key === "1"
                ) {

                    this.selectWeapon(0);

                } else if (
                    event.key === "2"
                ) {

                    this.selectWeapon(1);

                } else if (
                    event.key === "3"
                ) {

                    this.selectWeapon(2);

                } else if (
                    event.key === "4"
                ) {

                    this.selectWeapon(3);

                } else if (
                    event.key === "5"
                ) {

                    this.selectWeapon(4);
                }
            }
        );
    },

    createReloadButton() {

        const controls =
            document.getElementById(
                "actionButtons"
            );

        if (
            !controls ||
            document.getElementById(
                "reloadButton"
            )
        ) {
            return;
        }

        const button =
            document.createElement("button");

        button.id = "reloadButton";
        button.textContent = "RELOAD";

        controls.appendChild(button);

        button.addEventListener(
            "pointerdown",
            (event) => {

                event.preventDefault();

                this.reload();
            }
        );
    },

    showFireFeedback(hit) {

        const crosshair =
            document.getElementById(
                "crosshair"
            );

        if (!crosshair) {
            return;
        }

        crosshair.textContent =
            hit ? "×" : "+";

        crosshair.style.color =
            hit ? "#ff5555" : "#ffffff";

        if (this.crosshairTimer) {
            clearTimeout(this.crosshairTimer);
        }

        this.crosshairTimer =
            setTimeout(
                () => {

                    crosshair.textContent = "+";
                    crosshair.style.color = "#ffffff";

                },
                120
            );
    },

    showMessage(message) {

        if (
            typeof UI !== "undefined" &&
            typeof UI.showMessage === "function"
        ) {

            UI.showMessage(message);
        }
    },

    isGamePaused() {

        return (
            typeof UI !== "undefined" &&
            UI.paused === true
        );
    },

    addAmmo(amount) {

        const weapon =
            this.getCurrent();

        weapon.ammo +=
            Math.max(0, amount);

        this.updateUI();
    },

    reset() {

        this.stopFiring();
        this.cancelReload();

        this.currentIndex = 0;
        this.lastShot = 0;

        this.weapons[0].magazine = 12;
        this.weapons[0].ammo = 60;

        this.weapons[1].magazine = 30;
        this.weapons[1].ammo = 120;

        this.weapons[2].magazine = 30;
        this.weapons[2].ammo = 120;

        this.weapons[3].magazine = 6;
        this.weapons[3].ammo = 36;

        this.weapons[4].magazine = 5;
        this.weapons[4].ammo = 25;

        this.updateUI();
    }
};