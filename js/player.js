// PROJECT: BLACKOUT
// Player + Mobile Movement System

const Player = {

    position: {
        x: 0,
        y: 0,
        z: 0
    },

    rotation: {
        x: 0,
        y: 0
    },

    health: 100,

    speed: 3.5,
    runSpeed: 6.0,
    crouchSpeed: 1.8,

    isRunning: false,
    isCrouching: false,

    joystick: {
        active: false,
        x: 0,
        y: 0
    },

    init() {

        this.position.x = 0;
        this.position.y = 0;
        this.position.z = 0;

        this.health = 100;

        this.isRunning = false;
        this.isCrouching = false;

        this.setupJoystick();
        this.setupCrouch();

        console.log(
            "Player initialized."
        );
    },

    update(deltaTime) {

        let speed = this.speed;

        if (this.isRunning) {
            speed = this.runSpeed;
        }

        if (this.isCrouching) {
            speed = this.crouchSpeed;
        }

        const moveX =
            this.joystick.x;

        const moveZ =
            this.joystick.y;

        this.position.x +=
            moveX *
            speed *
            deltaTime;

        this.position.z +=
            moveZ *
            speed *
            deltaTime;

        // Keep player inside current world.
        this.position.x =
            Math.max(
                -45,
                Math.min(
                    45,
                    this.position.x
                )
            );

        this.position.z =
            Math.max(
                -45,
                Math.min(
                    45,
                    this.position.z
                )
            );
    },

    setupJoystick() {

        const joystick =
            document.getElementById(
                "movementJoystick"
            );

        const stick =
            document.getElementById(
                "joystickStick"
            );

        if (!joystick || !stick) {

            console.error(
                "Joystick not found."
            );

            return;
        }

        let pointerId = null;

        const updateJoystick =
            (event) => {

                const rect =
                    joystick.getBoundingClientRect();

                const centerX =
                    rect.left +
                    rect.width / 2;

                const centerY =
                    rect.top +
                    rect.height / 2;

                let dx =
                    event.clientX -
                    centerX;

                let dy =
                    event.clientY -
                    centerY;

                const maxDistance =
                    rect.width * 0.30;

                const distance =
                    Math.hypot(
                        dx,
                        dy
                    );

                if (
                    distance > maxDistance
                ) {

                    dx =
                        (dx / distance) *
                        maxDistance;

                    dy =
                        (dy / distance) *
                        maxDistance;
                }

                stick.style.left =
                    `calc(50% + ${dx}px)`;

                stick.style.top =
                    `calc(50% + ${dy}px)`;

                this.joystick.x =
                    dx / maxDistance;

                this.joystick.y =
                    dy / maxDistance;

                this.joystick.active =
                    true;
            };

        joystick.addEventListener(
            "pointerdown",
            (event) => {

                event.preventDefault();

                pointerId =
                    event.pointerId;

                joystick.setPointerCapture(
                    pointerId
                );

                updateJoystick(event);
            }
        );

        joystick.addEventListener(
            "pointermove",
            (event) => {

                if (
                    this.joystick.active &&
                    event.pointerId === pointerId
                ) {

                    updateJoystick(event);
                }
            }
        );

        const resetJoystick = () => {

            pointerId = null;

            this.joystick.active =
                false;

            this.joystick.x = 0;
            this.joystick.y = 0;

            stick.style.left = "50%";
            stick.style.top = "50%";
        };

        joystick.addEventListener(
            "pointerup",
            resetJoystick
        );

        joystick.addEventListener(
            "pointercancel",
            resetJoystick
        );

        joystick.addEventListener(
            "lostpointercapture",
            resetJoystick
        );
    },

    setupCrouch() {

        const crouchButton =
            document.getElementById(
                "crouchButton"
            );

        if (!crouchButton) {

            console.error(
                "Crouch button not found."
            );

            return;
        }

        crouchButton.addEventListener(
            "pointerdown",
            (event) => {

                event.preventDefault();

                this.isCrouching =
                    !this.isCrouching;

                crouchButton.textContent =
                    this.isCrouching
                        ? "STAND"
                        : "CROUCH";

                crouchButton.style.opacity =
                    this.isCrouching
                        ? "0.65"
                        : "1";
            }
        );
    },

    damage(amount) {

        this.health -= amount;

        if (this.health < 0) {
            this.health = 0;
        }

        if (
            typeof UI !== "undefined" &&
            typeof UI.updateHealth === "function"
        ) {

            UI.updateHealth(
                this.health
            );
        }

        if (
            this.health <= 0
        ) {

            this.die();
        }
    },

    heal(amount) {

        this.health += amount;

        if (this.health > 100) {
            this.health = 100;
        }

        if (
            typeof UI !== "undefined" &&
            typeof UI.updateHealth === "function"
        ) {

            UI.updateHealth(
                this.health
            );
        }
    },

    die() {

        console.log(
            "PLAYER DOWN"
        );

        if (
            typeof Missions !== "undefined" &&
            typeof Missions.playerDied === "function"
        ) {

            Missions.playerDied();
        }
    },

    reset() {

        this.health = 100;

        this.position.x = 0;
        this.position.y = 0;
        this.position.z = 0;

        this.rotation.x = 0;
        this.rotation.y = 0;

        this.isRunning = false;
        this.isCrouching = false;

        this.joystick.x = 0;
        this.joystick.y = 0;

        const crouchButton =
            document.getElementById(
                "crouchButton"
            );

        if (crouchButton) {

            crouchButton.textContent =
                "CROUCH";

            crouchButton.style.opacity =
                "1";
        }

        if (
            typeof UI !== "undefined" &&
            typeof UI.updateHealth === "function"
        ) {

            UI.updateHealth(
                this.health
            );
        }
    }
};