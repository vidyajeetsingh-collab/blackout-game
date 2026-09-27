// PROJECT: BLACKOUT
// Inventory: Medkits, Ammo Pickups and Ammo Limits

const Inventory = {
    initialized: false,

    maxMedkits: 5,
    medkits: 2,

    maxAmmoReserve: 240,
    pickups: [],
    pickupDistance: 2.2,

    init() {
        this.medkits = 2;
        this.pickups = [];
        this.initialized = true;

        this.setupControls();
        this.spawnInitialPickups();
        this.updateUI();

        console.log("BLACKOUT Inventory initialized.");
    },

    setupControls() {
        const controls = document.getElementById("actionButtons");
        if (!controls || document.getElementById("useButton")) return;

        const button = document.createElement("button");
        button.id = "useButton";
        button.textContent = "MEDKIT 2";
        controls.appendChild(button);

        button.addEventListener("pointerdown", event => {
            event.preventDefault();
            this.useMedkit();
        });
    },

    spawnInitialPickups() {
        this.pickups = [
            { id: 0, type: "MEDKIT", x: 5, y: 0.35, z: 12, amount: 1, collected: false },
            { id: 1, type: "PISTOL_AMMO", x: -18, y: 0.35, z: 5, amount: 24, collected: false },
            { id: 2, type: "SMG_AMMO", x: 18, y: 0.35, z: -5, amount: 45, collected: false },
            { id: 3, type: "RIFLE_AMMO", x: -8, y: 0.35, z: -18, amount: 45, collected: false },
            { id: 4, type: "SHOTGUN_AMMO", x: 25, y: 0.35, z: -20, amount: 8, collected: false },
            { id: 5, type: "SNIPER_AMMO", x: -30, y: 0.35, z: -25, amount: 5, collected: false },
            { id: 6, type: "MEDKIT", x: 25, y: 0.35, z: 20, amount: 1, collected: false }
        ];
    },

    update() {
        if (this.initialized) this.checkPickups();
    },

    checkPickups() {
        if (typeof Player === "undefined" || !Player.position) return;

        for (const pickup of this.pickups) {
            if (pickup.collected) continue;

            const dx = pickup.x - Player.position.x;
            const dz = pickup.z - Player.position.z;

            if (Math.hypot(dx, dz) <= this.pickupDistance) {
                this.collectPickup(pickup);
            }
        }
    },

    collectPickup(pickup) {
        if (!pickup || pickup.collected) return;

        let collected = false;

        if (pickup.type === "MEDKIT") {
            if (this.medkits < this.maxMedkits) {
                this.medkits = Math.min(
                    this.maxMedkits,
                    this.medkits + pickup.amount
                );
                collected = true;
            }
        } else {
            collected = this.addAmmoToWeapon(pickup);
        }

        if (!collected) {
            if (typeof UI !== "undefined") {
                UI.showMessage("AMMO OR INVENTORY FULL");
            }
            return;
        }

        pickup.collected = true;

        if (typeof AudioSystem !== "undefined") {
            AudioSystem.pickup();
        }

        if (typeof UI !== "undefined") {
            UI.showMessage("PICKUP: " + pickup.type.replaceAll("_", " "));
        }

        this.updateUI();
    },

    addAmmoToWeapon(pickup) {
        if (typeof Weapons === "undefined") return false;

        const ammoTypes = {
            PISTOL_AMMO: "PISTOL",
            SMG_AMMO: "SMG",
            RIFLE_AMMO: "ASSAULT RIFLE",
            SHOTGUN_AMMO: "SHOTGUN",
            SNIPER_AMMO: "SNIPER RIFLE"
        };

        const weaponName = ammoTypes[pickup.type];
        if (!weaponName) return false;

        const weapon = Weapons.weapons.find(
            item => item.name === weaponName
        );

        if (!weapon) return false;

        const currentAmmo = Math.max(0, Number(weapon.ammo) || 0);
        const room = Math.max(0, this.maxAmmoReserve - currentAmmo);

        if (room <= 0) return false;

        const amount = Math.min(
            room,
            Math.max(0, Number(pickup.amount) || 0)
        );

        if (amount <= 0) return false;

        weapon.ammo = currentAmmo + amount;

        if (typeof Weapons.updateUI === "function") {
            Weapons.updateUI();
        }

        return true;
    },

    useMedkit() {
        if (typeof Player === "undefined") return;

        if (this.medkits <= 0) {
            if (typeof UI !== "undefined") UI.showMessage("NO MEDKITS");
            return;
        }

        if (Player.health >= 100) {
            if (typeof UI !== "undefined") UI.showMessage("HEALTH ALREADY FULL");
            return;
        }

        this.medkits--;
        Player.heal(50);
        this.updateUI();

        if (typeof UI !== "undefined") UI.showMessage("MEDKIT USED");
    },

    addMedkit(amount = 1) {
        this.medkits = Math.min(
            this.maxMedkits,
            this.medkits + Math.max(0, amount)
        );
        this.updateUI();
    },

    removeMedkit(amount = 1) {
        this.medkits = Math.max(0, this.medkits - Math.max(0, amount));
        this.updateUI();
    },

    getMedkits() {
        return this.medkits;
    },

    getPickups() {
        return this.pickups;
    },

    getAvailablePickups() {
        return this.pickups.filter(pickup => !pickup.collected);
    },

    updateUI() {
        const button = document.getElementById("useButton");
        if (button) button.textContent = "MEDKIT " + this.medkits;
    },

    reset() {
        this.medkits = 2;
        this.spawnInitialPickups();
        this.updateUI();
    }
};