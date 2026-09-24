// PROJECT: BLACKOUT
// Vehicle System

const Vehicles = {

    list: [],
    currentVehicle: null,

    init() {
        this.list = [];
        this.currentVehicle = null;

        console.log("Vehicle system initialized.");
    },

    spawn(x, y, z) {

        const vehicle = {
            type: "CAR",

            position: {
                x: x || 0,
                y: y || 0,
                z: z || 0
            },

            rotation: 0,

            health: 100,
            maxHealth: 100,

            speed: 0,
            maxSpeed: 12,

            acceleration: 8,
            braking: 12,

            occupied: false,
            destroyed: false
        };

        this.list.push(vehicle);

        return vehicle;
    },

    spawnCityVehicles() {

        this.list = [];

        const positions = [
            [-8, 0, -5],
            [8, 0, -8],
            [-15, 0, 8],
            [14, 0, 12],
            [0, 0, 15]
        ];

        for (const position of positions) {
            this.spawn(
                position[0],
                position[1],
                position[2]
            );
        }

        console.log(
            "City vehicles spawned:",
            this.list.length
        );
    },

    findNearestVehicle(maxDistance = 4) {

        if (
            typeof Player === "undefined"
        ) {
            return null;
        }

        let nearest = null;
        let nearestDistance = maxDistance;

        for (const vehicle of this.list) {

            if (vehicle.destroyed) {
                continue;
            }

            const dx =
                Player.position.x -
                vehicle.position.x;

            const dz =
                Player.position.z -
                vehicle.position.z;

            const distance =
                Math.hypot(dx, dz);

            if (distance < nearestDistance) {
                nearest = vehicle;
                nearestDistance = distance;
            }
        }

        return nearest;
    },

    enter(vehicle) {

        if (!vehicle || vehicle.destroyed) {
            return false;
        }

        if (this.currentVehicle) {
            return false;
        }

        vehicle.occupied = true;
        this.currentVehicle = vehicle;

        console.log("Entered vehicle.");

        return true;
    },

    exit() {

        if (!this.currentVehicle) {
            return false;
        }

        this.currentVehicle.occupied = false;

        this.currentVehicle.speed = 0;

        this.currentVehicle = null;

        console.log("Exited vehicle.");

        return true;
    },

    toggleNearestVehicle() {

        if (this.currentVehicle) {
            this.exit();
            return;
        }

        const vehicle =
            this.findNearestVehicle();

        if (vehicle) {
            this.enter(vehicle);
        }
    },

    accelerate(amount, deltaTime) {

        const vehicle =
            this.currentVehicle;

        if (!vehicle || vehicle.destroyed) {
            return;
        }

        vehicle.speed +=
            amount *
            vehicle.acceleration *
            deltaTime;

        vehicle.speed =
            Math.max(
                -vehicle.maxSpeed * 0.4,
                Math.min(
                    vehicle.maxSpeed,
                    vehicle.speed
                )
            );
    },

    brake(deltaTime) {

        const vehicle =
            this.currentVehicle;

        if (!vehicle) {
            return;
        }

        if (vehicle.speed > 0) {

            vehicle.speed =
                Math.max(
                    0,
                    vehicle.speed -
                    vehicle.braking *
                    deltaTime
                );

        } else if (vehicle.speed < 0) {

            vehicle.speed =
                Math.min(
                    0,
                    vehicle.speed +
                    vehicle.braking *
                    deltaTime
                );
        }
    },

    steer(direction, deltaTime) {

        const vehicle =
            this.currentVehicle;

        if (!vehicle || vehicle.destroyed) {
            return;
        }

        const steeringStrength = 2.2;

        vehicle.rotation +=
            direction *
            steeringStrength *
            deltaTime *
            (Math.abs(vehicle.speed) /
                vehicle.maxSpeed);
    },

    update(deltaTime) {

        const vehicle =
            this.currentVehicle;

        if (!vehicle || vehicle.destroyed) {
            return;
        }

        const forwardX =
            Math.sin(vehicle.rotation);

        const forwardZ =
            Math.cos(vehicle.rotation);

        vehicle.position.x +=
            forwardX *
            vehicle.speed *
            deltaTime;

        vehicle.position.z +=
            forwardZ *
            vehicle.speed *
            deltaTime;

        // Keep vehicles inside the playable city area.
        vehicle.position.x =
            Math.max(
                -45,
                Math.min(
                    45,
                    vehicle.position.x
                )
            );

        vehicle.position.z =
            Math.max(
                -45,
                Math.min(
                    45,
                    vehicle.position.z
                )
            );

        // Friction.
        vehicle.speed *=
            Math.pow(
                0.96,
                deltaTime * 60
            );

        // Keep player with vehicle.
        if (
            typeof Player !== "undefined"
        ) {
            Player.position.x =
                vehicle.position.x;

            Player.position.z =
                vehicle.position.z;
        }
    },

    damage(vehicle, amount) {

        if (
            !vehicle ||
            vehicle.destroyed
        ) {
            return;
        }

        vehicle.health -= amount;

        if (vehicle.health <= 0) {
            this.destroy(vehicle);
        }
    },

    destroy(vehicle) {

        if (!vehicle) {
            return;
        }

        vehicle.health = 0;
        vehicle.speed = 0;
        vehicle.destroyed = true;
        vehicle.occupied = false;

        if (
            this.currentVehicle === vehicle
        ) {
            this.currentVehicle = null;
        }

        console.log(
            "Vehicle destroyed."
        );
    },

    shootFromVehicle() {

        if (!this.currentVehicle) {
            return;
        }

        console.log(
            "Player fired from vehicle."
        );

        if (
            typeof Weapons !== "undefined" &&
            typeof Weapons.fire === "function"
        ) {
            Weapons.fire();
        }
    },

    clear() {

        this.list = [];
        this.currentVehicle = null;
    }
};
