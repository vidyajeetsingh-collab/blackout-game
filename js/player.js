// PROJECT: BLACKOUT
// Player System
// Camera-Relative Movement + Mobile Controls

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

    initialized: false,

    init() {

        this.position = {
            x: 0,
            y: 0,
            z: 0
        };

        this.rotation = {
            x: 0,
            y: 0
        };

        this.health = 100;

        this.isRunning = false;
        this.isCrouching = false;

        this.joystick = {
            active: false,
            x: 0,
            y: 0
        };

        this.setupJoystick();
        this.setupCrouch();
        this.setupRun();

        this.initialized = true;

        console.log(
            "BLACKOUT Player initialized."
        );
    },

    update(deltaTime) {

        if (!this.initialized) {
            return;
        }

        // Vehicle driving is handled by Vehicles.
        if (
            typeof Vehicles !== "undefined" &&
            Vehicles.isDriving()
        ) {
            return;
        }

        let speed = this.speed;

        if (this.isRunning) {
            speed = this.runSpeed;
        }

        if (this.isCrouching) {
            speed = this.crouchSpeed;
        }

        const inputX = this.joystick.x;
        const inputY = this.joystick.y;

        // No movement input.
        if (
            Math.abs(inputX) < 0.01 &&
            Math.abs(inputY) < 0.01
        ) {
            return;
        }

        // Camera yaw determines movement direction.
        const yaw =
            typeof Camera !== "undefined"
                ? Camera.yaw
                : 0;

        // Camera-relative forward and right vectors.
        const forwardX = Math.sin(yaw);
        const forwardZ = -Math.cos(yaw);

        const rightX = Math.cos(yaw);
        const rightZ = Math.sin(yaw);

        // Joystick up means forward.
        const forwardInput = -inputY;

        let moveX =
            rightX * inputX +
            forwardX * forwardInput;

        let moveZ =
            rightZ * inputX +
            forwardZ * forwardInput;

        // Normalize diagonal movement.
        const magnitude =
            Math.hypot(moveX, moveZ);

        if (magnitude > 1) {
            moveX /= magnitude;
            moveZ /= magnitude;
        }

        this.position.x +=
            moveX * speed * deltaTime;

        this.position.z +=
            moveZ * speed * deltaTime;

        // Keep the player inside the current world bounds.
        this.position.x =
            Math.max(
                -43,
                Math.min(43, this.position.x)
            );

        this.position.z =
            Math.max(
                -43,
                Math.min(43, this.position.z)
            );

        // Face the direction of movement.
        this.rotation.y =
            Math.atan2(moveX, moveZ);
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
                "BLACKOUT: Joystick elements not found."
            );
            return;
        }

        let pointerId = null;

        const updateJoystick = (event) => {

            const rect =
                joystick.getBoundingClientRect();

            const centerX =
                rect.left + rect.width / 2;

            const centerY =
                rect.top + rect.height / 2;

            let dx =
                event.clientX - centerX;

            let dy =
                event.clientY - centerY;

            const maxDistance =
                rect.width * 0.30;

            const distance =
                Math.hypot(dx, dy);

            if (distance > maxDistance) {

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

            this.joystick.active = true;
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
                    !this.joystick.active ||
                    event.pointerId !== pointerId
                ) {
                    return;
                }

                updateJoystick(event);
            }
        );

        const resetJoystick = () => {

            pointerId = null;

            this.joystick.active = false;
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

        const button =
            document.getElementById(
                "crouchButton"
            );

        if (!button) {
            console.error(
                "BLACKOUT: Crouch button not found."
            );
            return;
        }

        button.addEventListener(
            "pointerdown",
            (event) => {

                event.preventDefault();

                this.isCrouching =
                    !this.isCrouching;

                // Crouching cancels running.
                if (this.isCrouching) {
                    this.isRunning = false;
                }

                this.updateMovementButtons();
            }
        );
    },

    setupRun() {

        const button =
            document.getElementById(
                "runButton"
            );

        if (!button) {
            console.error(
                "BLACKOUT: Run button not found."
            );
            return;
        }

        button.addEventListener(
            "pointerdown",
            (event) => {

                event.preventDefault();

                if (this.isCrouching) {
                    this.isCrouching = false;
                }

                this.isRunning =
                    !this.isRunning;

                this.updateMovementButtons();
            }
        );
    },

    updateMovementButtons() {

        const runButton =
            document.getElementById(
                "runButton"
            );

        const crouchButton =
            document.getElementById(
                "crouchButton"
            );

        if (runButton) {

            runButton.textContent =
                this.isRunning
                    ? "WALK"
                    : "RUN";

            runButton.style.opacity =
                this.isRunning
                    ? "0.65"
                    : "1";
        }

        if (crouchButton) {

            crouchButton.textContent =
                this.isCrouching
                    ? "STAND"
                    : "CROUCH";

            crouchButton.style.opacity =
                this.isCrouching
                    ? "0.65"
                    : "1";
        }
    },

    damage(amount) {

        if (this.health <= 0) {
            return;
        }

        this.health =
            Math.max(
                0,
                this.health - amount
            );

        if (
            typeof UI !== "undefined" &&
            typeof UI.updateHealth === "function"
        ) {
            UI.updateHealth(this.health);
        }

        if (this.health <= 0) {
            this.die();
        }
    },

    heal(amount) {

        this.health =
            Math.min(
                100,
                this.health + amount
            );

        if (
            typeof UI !== "undefined" &&
            typeof UI.updateHealth === "function"
        ) {
            UI.updateHealth(this.health);
        }
    },

    die() {

        console.log("PLAYER DOWN");

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

        this.joystick.active = false;
        this.joystick.x = 0;
        this.joystick.y = 0;

        this.updateMovementButtons();

        if (
            typeof UI !== "undefined" &&
            typeof UI.updateHealth === "function"
        ) {
            UI.updateHealth(this.health);
        }
    }
};