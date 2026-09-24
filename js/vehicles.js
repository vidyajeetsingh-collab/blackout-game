
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
            id: "car_" + Date.now(),

            x: x,
            y: y,
            z: z,

            rotation: 0,

            health: 100,
            maxHealth: 100,

            speed: 0,
            maxSpeed: 14,

            occupied: false,
            destroyed: false
        };

        this.list.push(vehicle);

        return vehicle;
    },

    enter(vehicle) {

        if (!vehicle || vehicle.destroyed) {
            return;
        }

        vehicle.occupied = true;
        this.currentVehicle = vehicle;

        console.log("Entered vehicle.");
    },

    exit() {

        if (!this.currentVehicle) {
            return;
        }

        this.currentVehicle.occupied = false;

        this.currentVehicle = null;

        console.log("Exited vehicle.");
    },

    accelerate(amount) {

        if (!this.currentVehicle) {
            return;
        }

        const vehicle = this.currentVehicle;

        vehicle.speed += amount;

        vehicle.speed = Math.max(
            -vehicle.maxSpeed * 0.4,
            Math.min(
                vehicle.maxSpeed,
                vehicle.speed
            )
        );
    },

    brake(amount) {

        if (!this.currentVehicle) {
            return;
        }

        const vehicle = this.currentVehicle;

        vehicle.speed *= Math.max(
            0,
            1 - amount
        );
    },

    update(deltaTime) {

        if (!this.currentVehicle) {
            return;
        }

        const vehicle = this.currentVehicle;

        if (vehicle.destroyed) {
            this.exit();
            return;
        }

        const radians = vehicle.rotation;

        vehicle.x +=
            Math.sin(radians) *
            vehicle.speed *
            deltaTime;

        vehicle.z +=
            Math.cos(radians) *
            vehicle.speed *
            deltaTime;

        // Natural slowdown.
        vehicle.speed *= 0.98;
    },

    damage(vehicle, amount) {

        if (!vehicle || vehicle.destroyed) {
            return;
        }

        vehicle.health -= amount;

        if (vehicle.health <= 0) {
            this.destroy(vehicle);
        }
    },

    destroy(vehicle) {

        vehicle.health = 0;
        vehicle.speed = 0;
        vehicle.destroyed = true;
        vehicle.occupied = false;

        if (this.currentVehicle === vehicle) {
            this.currentVehicle = null;
        }

        console.log("Vehicle destroyed.");
    },

    shootFromVehicle() {

        if (!this.currentVehicle) {
            return;
        }

        if (typeof Weapons !== "undefined") {
            Weapons.fire();
        }
    }
};
