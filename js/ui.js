// PROJECT: BLACKOUT
// User Interface System

const UI = {

    elements: {},

    init() {

        this.elements.health =
            document.getElementById("health");

        this.elements.weapon =
            document.getElementById("weapon");

        this.elements.ammo =
            document.getElementById("ammo");

        this.elements.objective =
            document.getElementById("objective");

        this.setupButtons();

        this.updateHealth(100);

        this.updateWeapon(
            "PISTOL",
            12,
            60
        );

        this.updateObjective(
            "MISSION 1: SURVIVE THE ENEMY ATTACK"
        );

        console.log("UI initialized.");
    },

    updateHealth(health) {

        if (!this.elements.health) return;

        this.elements.health.textContent =
            "HP: " + Math.max(0, Math.round(health));
    },

    updateWeapon(
        weaponName,
        magazine,
        reserve
    ) {

        if (this.elements.weapon) {
            this.elements.weapon.textContent =
                weaponName;
        }

        if (this.elements.ammo) {
            this.elements.ammo.textContent =
                magazine + " / " + reserve;
        }
    },

    updateObjective(text) {

        if (!this.elements.objective) return;

        this.elements.objective.textContent =
            "OBJECTIVE: " + text;
    },

    setupButtons() {

        const shootButton =
            document.getElementById("shootButton");

        const crouchButton =
            document.getElementById("crouchButton");

        const weaponButton =
            document.getElementById("weaponButton");

        const pauseButton =
            document.getElementById("pauseButton");


        if (shootButton) {

            shootButton.addEventListener(
                "pointerdown",
                (event) => {

                    event.preventDefault();

                    if (
                        typeof Weapons !== "undefined" &&
                        typeof Weapons.fire === "function"
                    ) {
                        Weapons.fire();
                    }
                }
            );
        }


        if (crouchButton) {

            crouchButton.addEventListener(
                "pointerdown",
                (event) => {

                    event.preventDefault();

                    if (
                        typeof Player !== "undefined"
                    ) {
                        Player.isCrouching =
                            !Player.isCrouching;

                        crouchButton.textContent =
                            Player.isCrouching
                                ? "STAND"
                                : "CROUCH";
                    }
                }
            );
        }


        if (weaponButton) {

            weaponButton.addEventListener(
                "pointerdown",
                (event) => {

                    event.preventDefault();

                    if (
                        typeof Weapons !== "undefined" &&
                        typeof Weapons.nextWeapon === "function"
                    ) {
                        Weapons.nextWeapon();
                    }
                }
            );
        }


        if (pauseButton) {

            pauseButton.addEventListener(
                "pointerdown",
                (event) => {

                    event.preventDefault();

                    this.togglePause();
                }
            );
        }
    },

    paused: false,

    togglePause() {

        this.paused = !this.paused;

        if (this.paused) {

            console.log("GAME PAUSED");

            if (
                typeof Save !== "undefined" &&
                typeof Save.saveGame === "function"
            ) {
                Save.saveGame();
            }

        } else {

            console.log("GAME RESUMED");
        }
    }
};
