// PROJECT: BLACKOUT
// Inventory System
// Medkits + Ammo + Pickups + Limits

const Inventory = {

    initialized: false,

    maxMedkits: 5,

    medkits: 2,

    maxAmmoReserve: 999,

    pickups: [],

    pickupDistance: 2.2,

    init() {

        this.medkits = 2;

        this.pickups = [];

        this.initialized = true;

        this.setupControls();

        this.spawnInitialPickups();

        this.updateUI();

        console.log(
            "BLACKOUT Inventory initialized."
        );
    },

    setupControls() {

        const controls =
            document.getElementById(
                "actionButtons"
            );

        if (!controls) {

            console.error(
                "Action buttons container not found."
            );

            return;
        }

        if (
            document.getElementById(
                "useButton"
            )
        ) {
            return;
        }

        const button =
            document.createElement(
                "button"
            );

        button.id =
            "useButton";

        button.textContent =
            "MEDKIT";

        controls.appendChild(
            button
        );

        button.addEventListener(
            "pointerdown",
            (event) => {

                event.preventDefault();

                this.useMedkit();
            }
        );
    },

    spawnInitialPickups() {

        this.pickups = [

            {
                id: 0,
                type: "MEDKIT",
                x: 5,
                y: 0.35,
                z: 12,
                amount: 1,
                collected: false
            },

            {
                id: 1,
                type: "PISTOL_AMMO",
                x: -18,
                y: 0.35,
                z: 5,
                amount: 24,
                collected: false
            },

            {
                id: 2,
                type: "SMG_AMMO",
                x: 18,
                y: 0.35,
                z: -5,
                amount: 45,
                collected: false
            },

            {
                id: 3,
                type: "RIFLE_AMMO",
                x: -8,
                y: 0.35,
                z: -18,
                amount: 45,
                collected: false
            },

            {
                id: 4,
                type: "MEDKIT",
                x: 25,
                y: 0.35,
                z: 20,
                amount: 1,
                collected: false
            }
        ];
    },

    update(deltaTime) {

        if (!this.initialized) {
            return;
        }

        this.checkPickups();
    },

    checkPickups() {

        if (
            typeof Player ===
            "undefined"
        ) {
            return;
        }

        for (
            const pickup of this.pickups
        ) {

            if (
                pickup.collected
            ) {
                continue;
            }

            const dx =
                pickup.x -
                Player.position.x;

            const dz =
                pickup.z -
                Player.position.z;

            const distance =
                Math.hypot(
                    dx,
                    dz
                );

            if (
                distance <=
                this.pickupDistance
            ) {

                this.collectPickup(
                    pickup
                );
            }
        }
    },

    collectPickup(pickup) {

        if (
            !pickup ||
            pickup.collected
        ) {
            return;
        }

        let collected = false;

        if (
            pickup.type ===
            "MEDKIT"
        ) {

            if (
                this.medkits <
                this.maxMedkits
            ) {

                this.medkits +=
                    pickup.amount;

                this.medkits =
                    Math.min(
                        this.medkits,
                        this.maxMedkits
                    );

                collected = true;
            }

        } else {

            collected =
                this.addAmmoToWeapon(
                    pickup
                );
        }

        if (!collected) {

            console.log(
                "Inventory full:"
            );

            return;
        }

        pickup.collected =
            true;

        console.log(
            "PICKUP:",
            pickup.type,
            pickup.amount
        );

        this.updateUI();
    },

    addAmmoToWeapon(pickup) {

        if (
            typeof Weapons ===
            "undefined"
        ) {
            return false;
        }

        let weaponName = "";

        if (
            pickup.type ===
            "PISTOL_AMMO"
        ) {

            weaponName =
                "PISTOL";

        } else if (
            pickup.type ===
            "SMG_AMMO"
        ) {

            weaponName =
                "SMG";

        } else if (
            pickup.type ===
            "RIFLE_AMMO"
        ) {

            weaponName =
                "ASSAULT RIFLE";
        }

        if (!weaponName) {
            return false;
        }

        const weapon =
            Weapons.weapons.find(
                item =>
                    item.name ===
                    weaponName
            );

        if (!weapon) {
            return false;
        }

        if (
            weapon.ammo >=
            this.maxAmmoReserve
        ) {

            return false;
        }

        weapon.ammo =
            Math.min(
                this.maxAmmoReserve,
                weapon.ammo +
                pickup.amount
            );

        if (
            typeof Weapons.updateUI ===
            "function"
        ) {

            Weapons.updateUI();
        }

        return true;
    },

    useMedkit() {

        if (
            typeof Player ===
            "undefined"
        ) {
            return;
        }

        if (
            this.medkits <= 0
        ) {

            console.log(
                "NO MEDKITS"
            );

            return;
        }

        if (
            Player.health >= 100
        ) {

            console.log(
                "HEALTH ALREADY FULL"
            );

            return;
        }

        this.medkits--;

        Player.heal(50);

        this.updateUI();

        console.log(
            "MEDKIT USED"
        );
    },

    addMedkit(amount = 1) {

        this.medkits =
            Math.min(
                this.maxMedkits,
                this.medkits +
                amount
            );

        this.updateUI();
    },

    removeMedkit(amount = 1) {

        this.medkits =
            Math.max(
                0,
                this.medkits -
                amount
            );

        this.updateUI();
    },

    getMedkits() {

        return this.medkits;
    },

    getPickups() {

        return this.pickups;
    },

    getAvailablePickups() {

        return this.pickups.filter(
            pickup =>
                !pickup.collected
        );
    },

    updateUI() {

        const button =
            document.getElementById(
                "useButton"
            );

        if (!button) {
            return;
        }

        button.textContent =
            "MEDKIT " +
            this.medkits;
    },

    reset() {

        this.medkits = 2;

        this.spawnInitialPickups();

        this.updateUI();
    }
};