// PROJECT: BLACKOUT
// Vehicle System
// Cars + Enter/Exit + Driving + Health + Destruction

const Vehicles = {

    vehicles: [],

    activeVehicle: null,

    initialized: false,

    enterDistance: 3.5,

    init() {

        this.vehicles = [];
        this.activeVehicle = null;

        this.spawnVehicles();
        this.setupControls();

        this.initialized = true;

        console.log(
            "BLACKOUT Vehicle system initialized."
        );
    },

    spawnVehicles() {

        const positions = [

            {
                x: 6,
                z: 5,
                rotation: 0
            },

            {
                x: -8,
                z: -12,
                rotation: Math.PI / 2
            },

            {
                x: 22,
                z: 4,
                rotation: Math.PI
            },

            {
                x: -24,
                z: 20,
                rotation: -Math.PI / 2
            }
        ];

        positions.forEach(
            (position, index) => {

                this.vehicles.push({

                    id: index,

                    type: "CAR",

                    x: position.x,

                    y: 0,

                    z: position.z,

                    rotation:
                        position.rotation,

                    speed: 0,

                    maxSpeed: 13,

                    acceleration: 9,

                    brakePower: 15,

                    turnSpeed: 2.2,

                    health: 100,

                    maxHealth: 100,

                    fuel: 100,

                    destroyed: false,

                    occupied: false,

                    color:
                        index % 2 === 0
                            ? "DARK"
                            : "LIGHT"
                });
            }
        );
    },

    update(deltaTime) {

        if (!this.initialized) {
            return;
        }

        for (
            const vehicle of this.vehicles
        ) {

            if (vehicle.destroyed) {
                continue;
            }

            if (
                vehicle ===
                this.activeVehicle
            ) {

                this.driveVehicle(
                    vehicle,
                    deltaTime
                );

            } else {

                // Slowly stop parked vehicles.
                vehicle.speed *=
                    Math.pow(
                        0.05,
                        deltaTime
                    );
            }
        }

        this.updatePlayerPosition();
    },

    driveVehicle(
        vehicle,
        deltaTime
    ) {

        if (
            typeof Player === "undefined"
        ) {
            return;
        }

        const joystick =
            Player.joystick;

        const inputX =
            joystick
                ? joystick.x
                : 0;

        const inputY =
            joystick
                ? joystick.y
                : 0;

        /*
         * Forward direction.
         * The joystick pushes upward
         * when y is negative.
         */
        const throttle =
            -inputY;

        const steering =
            inputX;

        if (
            Math.abs(throttle) >
            0.05
        ) {

            vehicle.speed +=
                throttle *
                vehicle.acceleration *
                deltaTime;

        } else {

            vehicle.speed *=
                Math.pow(
                    0.35,
                    deltaTime
                );
        }

        vehicle.speed =
            Math.max(
                -vehicle.maxSpeed * 0.45,
                Math.min(
                    vehicle.maxSpeed,
                    vehicle.speed
                )
            );

        /*
         * Steering becomes stronger
         * as the vehicle moves.
         */
        if (
            Math.abs(vehicle.speed) >
            0.2 &&
            Math.abs(steering) >
            0.03
        ) {

            const direction =
                vehicle.speed >= 0
                    ? 1
                    : -1;

            vehicle.rotation +=
                steering *
                vehicle.turnSpeed *
                deltaTime *
                direction;
        }

        const forwardX =
            Math.sin(
                vehicle.rotation
            );

        const forwardZ =
            Math.cos(
                vehicle.rotation
            );

        vehicle.x +=
            forwardX *
            vehicle.speed *
            deltaTime;

        vehicle.z +=
            forwardZ *
            vehicle.speed *
            deltaTime;

        /*
         * Keep the vehicle inside
         * the playable city area.
         */
        vehicle.x =
            Math.max(
                -45,
                Math.min(
                    45,
                    vehicle.x
                )
            );

        vehicle.z =
            Math.max(
                -45,
                Math.min(
                    45,
                    vehicle.z
                )
            );

        /*
         * Simple collision with
         * the edge of the city.
         */
        if (
            Math.abs(vehicle.x) >= 44 ||
            Math.abs(vehicle.z) >= 44
        ) {

            vehicle.speed *= -0.25;

            this.damageVehicle(
                vehicle,
                5
            );
        }

        /*
         * Small automatic vehicle
         * damage at very high speed.
         */
        if (
            Math.abs(vehicle.speed) >
            vehicle.maxSpeed * 0.95
        ) {

            vehicle.fuel -=
                deltaTime * 0.5;

            vehicle.fuel =
                Math.max(
                    0,
                    vehicle.fuel
                );
        }
    },

    updatePlayerPosition() {

        if (
            !this.activeVehicle ||
            typeof Player === "undefined"
        ) {
            return;
        }

        const vehicle =
            this.activeVehicle;

        /*
         * Keep player attached to
         * the driver's position.
         */
        Player.position.x =
            vehicle.x;

        Player.position.z =
            vehicle.z;

        Player.position.y =
            0;

        Player.rotation.y =
            vehicle.rotation;
    },

    getNearestVehicle() {

        if (
            typeof Player === "undefined"
        ) {
            return null;
        }

        let nearest = null;

        let nearestDistance =
            this.enterDistance;

        for (
            const vehicle of this.vehicles
        ) {

            if (
                vehicle.destroyed ||
                vehicle.occupied
            ) {
                continue;
            }

            const dx =
                vehicle.x -
                Player.position.x;

            const dz =
                vehicle.z -
                Player.position.z;

            const distance =
                Math.hypot(
                    dx,
                    dz
                );

            if (
                distance <
                nearestDistance
            ) {

                nearestDistance =
                    distance;

                nearest =
                    vehicle;
            }
        }

        return nearest;
    },

    enterNearestVehicle() {

        if (
            this.activeVehicle
        ) {
            return;
        }

        const vehicle =
            this.getNearestVehicle();

        if (!vehicle) {

            console.log(
                "No vehicle nearby."
            );

            return;
        }

        this.enterVehicle(
            vehicle
        );
    },

    enterVehicle(vehicle) {

        if (
            !vehicle ||
            vehicle.destroyed ||
            vehicle.occupied
        ) {
            return;
        }

        vehicle.occupied =
            true;

        this.activeVehicle =
            vehicle;

        vehicle.speed = 0;

        if (
            typeof Camera !== "undefined"
        ) {

            Camera.distance = 8;
            Camera.height = 4;
        }

        this.updateVehicleUI();

        console.log(
            "ENTERED VEHICLE:",
            vehicle.id
        );
    },

    exitVehicle() {

        if (
            !this.activeVehicle ||
            typeof Player === "undefined"
        ) {
            return;
        }

        const vehicle =
            this.activeVehicle;

        const sideX =
            Math.cos(
                vehicle.rotation
            ) * 2;

        const sideZ =
                -Math.sin(
                    vehicle.rotation
                ) * 2;

        Player.position.x =
            vehicle.x +
            sideX;

        Player.position.z =
            vehicle.z +
            sideZ;

        Player.position.y =
            0;

        vehicle.occupied =
            false;

        vehicle.speed =
            0;

        this.activeVehicle =
            null;

        if (
            typeof Camera !== "undefined"
        ) {

            Camera.distance = 6;
            Camera.height = 2.8;
        }

        this.updateVehicleUI();

        console.log(
            "EXITED VEHICLE"
        );
    },

    toggleVehicle() {

        if (
            this.activeVehicle
        ) {

            this.exitVehicle();

        } else {

            this.enterNearestVehicle();
        }
    },

    damageVehicle(
        vehicle,
        amount
    ) {

        if (
            !vehicle ||
            vehicle.destroyed
        ) {
            return;
        }

        vehicle.health -=
            amount;

        vehicle.health =
            Math.max(
                0,
                vehicle.health
            );

        console.log(
            "VEHICLE DAMAGE:",
            amount
        );

        if (
            vehicle.health <= 0
        ) {

            this.destroyVehicle(
                vehicle
            );
        }

        this.updateVehicleUI();
    },

    damageActiveVehicle(
        amount
    ) {

        if (
            !this.activeVehicle
        ) {
            return;
        }

        this.damageVehicle(
            this.activeVehicle,
            amount
        );
    },

    destroyVehicle(vehicle) {

        if (!vehicle) {
            return;
        }

        vehicle.health = 0;
        vehicle.speed = 0;
        vehicle.destroyed = true;
        vehicle.occupied = false;

        if (
            this.activeVehicle ===
            vehicle
        ) {

            this.activeVehicle =
                null;

            if (
                typeof Player !==
                "undefined"
            ) {

                Player.position.x =
                    vehicle.x + 2;

                Player.position.z =
                    vehicle.z;
            }

            if (
                typeof Camera !==
                "undefined"
            ) {

                Camera.distance = 6;
                Camera.height = 2.8;
            }
        }

        this.updateVehicleUI();

        console.log(
            "VEHICLE DESTROYED:",
            vehicle.id
        );
    },

    repairActiveVehicle(
        amount = 25
    ) {

        if (
            !this.activeVehicle
        ) {
            return;
        }

        const vehicle =
            this.activeVehicle;

        if (
            vehicle.destroyed
        ) {
            return;
        }

        vehicle.health =
            Math.min(
                vehicle.maxHealth,
                vehicle.health +
                amount
            );

        this.updateVehicleUI();
    },

    refuelActiveVehicle(
        amount = 25
    ) {

        if (
            !this.activeVehicle
        ) {
            return;
        }

        const vehicle =
            this.activeVehicle;

        vehicle.fuel =
            Math.min(
                100,
                vehicle.fuel +
                amount
            );

        this.updateVehicleUI();
    },

    getActiveVehicle() {

        return this.activeVehicle;
    },

    isDriving() {

        return (
            this.activeVehicle !==
            null
        );
    },

    getAliveVehicles() {

        return this.vehicles.filter(
            vehicle =>
                !vehicle.destroyed
        );
    },

    setupControls() {

        /*
         * Create the vehicle button
         * automatically so index.html
         * does not need another button.
         */

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
                "vehicleButton"
            )
        ) {
            return;
        }

        const button =
            document.createElement(
                "button"
            );

        button.id =
            "vehicleButton";

        button.textContent =
            "ENTER CAR";

        controls.appendChild(
            button
        );

        button.addEventListener(
            "pointerdown",
            (event) => {

                event.preventDefault();

                this.toggleVehicle();
            }
        );

        /*
         * Keyboard support for desktop
         * testing later.
         */
        window.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key.toLowerCase() ===
                    "e"
                ) {

                    this.toggleVehicle();
                }
            }
        );
    },

    updateVehicleUI() {

        const button =
            document.getElementById(
                "vehicleButton"
            );

        if (!button) {
            return;
        }

        if (
            this.activeVehicle
        ) {

            button.textContent =
                "EXIT CAR";

            button.style.opacity =
                "0.65";

        } else {

            button.textContent =
                "ENTER CAR";

            button.style.opacity =
                "1";
        }
    },

    reset() {

        this.vehicles = [];

        this.activeVehicle =
            null;

        this.spawnVehicles();

        if (
            typeof Camera !== "undefined"
        ) {

            Camera.distance = 6;
            Camera.height = 2.8;
        }

        this.updateVehicleUI();
    }
};