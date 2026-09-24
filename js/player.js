// PROJECT: BLACKOUT
// Player System

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

    init() {
        this.position.x = 0;
        this.position.y = 0;
        this.position.z = 0;

        this.health = 100;

        console.log("Player initialized.");
    },

    update(deltaTime) {
        let speed = this.speed;

        if (this.isRunning) {
            speed = this.runSpeed;
        }

        if (this.isCrouching) {
            speed = this.crouchSpeed;
        }

        // Movement will be connected to the
        // mobile joystick in the next systems.
    },

    damage(amount) {
        this.health -= amount;

        if (this.health < 0) {
            this.health = 0;
        }

        UI.updateHealth(this.health);

        if (this.health <= 0) {
            this.die();
        }
    },

    heal(amount) {
        this.health += amount;

        if (this.health > 100) {
            this.health = 100;
        }

        UI.updateHealth(this.health);
    },

    die() {
        console.log("PLAYER DOWN");

        if (typeof Missions !== "undefined") {
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

        UI.updateHealth(this.health);
    }
};
