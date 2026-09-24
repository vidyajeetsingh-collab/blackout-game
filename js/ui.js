// PROJECT: BLACKOUT
// User Interface System

const UI = {

    init() {

        this.healthElement =
            document.getElementById("health");

        this.weaponElement =
            document.getElementById("weapon");

        this.ammoElement =
            document.getElementById("ammo");

        this.objectiveElement =
            document.getElementById("objective");

        this.setupButtons();

        this.updateHealth(100);

        console.log(
            "BLACKOUT UI initialized."
        );
    },

    updateHealth(health) {

        if (!this.healthElement) {
            return;
        }

        this.healthElement.textContent =
            "HP: " + Math.max(0, health);
    },

    updateWeapon(
        weaponName,
        currentAmmo,
        reserveAmmo
    ) {

        if (this.weaponElement) {

            this.weaponElement.textContent =
                weaponName;
        }

        if (this.ammoElement) {

            this.ammoElement.textContent =
                currentAmmo +
                " / " +
                reserveAmmo;
        }
    },

    updateObjective(text) {

        if (!this.objectiveElement) {
            return;
        }

        this.objectiveElement.textContent =
            "OBJECTIVE: " + text;
    },

    setupButtons() {

        const shoot =
            document.getElementById(
                "shootButton"
            );

        const crouch =
            document.getElementById(
                "crouchButton"
            );

        const weapon =
            document.getElementById(
                "weaponButton"
            );

        if (shoot) {

            shoot.addEventListener(
                "pointerdown",
                () => {
                    Weapons.fire();
                }
            );
        }

        if (crouch) {

            crouch.addEventListener(
                "pointerdown",
                () => {

                    Player.isCrouching =
                        !Player.isCrouching;

                    crouch.textContent =
                        Player.isCrouching
                            ? "STAND"
                            : "CROUCH";
                }
            );
        }

        if (weapon) {

            weapon.addEventListener(
                "pointerdown",
                () => {
                    Weapons.nextWeapon();
                }
            );
        }
    }
};
