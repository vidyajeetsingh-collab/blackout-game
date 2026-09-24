// PROJECT: BLACKOUT
// Enemy System

const Enemies = {

    list: [],

    types: {
        surveillanceDrone: {
            name: "SURVEILLANCE DRONE",
            health: 40,
            damage: 8,
            speed: 2.5
        },

        combatDrone: {
            name: "COMBAT DRONE",
            health: 100,
            damage: 18,
            speed: 1.8
        }
    },

    init() {
        this.list = [];

        console.log("Enemy system initialized.");
    },

    spawn(type, x, y, z) {

        const data = this.types[type];

        if (!data) {
            console.error("Unknown enemy type:", type);
            return null;
        }

        const enemy = {
            type: type,
            name: data.name,

            x: x,
            y: y,
            z: z,

            health: data.health,
            maxHealth: data.health,

            damage: data.damage,
            speed: data.speed,

            state: "patrol",
            alive: true
        };

        this.list.push(enemy);

        return enemy;
    },

    update(deltaTime) {

        for (const enemy of this.list) {

            if (!enemy.alive) {
                continue;
            }

            const dx =
                Player.position.x - enemy.x;

            const dz =
                Player.position.z - enemy.z;

            const distance =
                Math.sqrt(dx * dx + dz * dz);

            // Patrol → Detect → Attack
            if (distance < 25) {
                enemy.state = "attack";
            } else {
                enemy.state = "patrol";
            }

            if (enemy.state === "attack") {

                if (distance > 5) {

                    const length =
                        Math.sqrt(dx * dx + dz * dz);

                    enemy.x +=
                        (dx / length) *
                        enemy.speed *
                        deltaTime;

                    enemy.z +=
                        (dz / length) *
                        enemy.speed *
                        deltaTime;
                }
            }
        }
    },

    checkHit(damage, accuracy) {

        // Temporary hit detection.
        // Detailed raycasting will be added
        // with the 3D world.

        for (const enemy of this.list) {

            if (!enemy.alive) {
                continue;
            }

            if (Math.random() <= accuracy) {

                this.damageEnemy(
                    enemy,
                    damage
                );

                return;
            }
        }
    },

    damageEnemy(enemy, damage) {

        enemy.health -= damage;

        if (enemy.health <= 0) {
            this.destroy(enemy);
        }
    },

    destroy(enemy) {

        enemy.health = 0;
        enemy.alive = false;

        console.log(
            enemy.name + " destroyed"
        );

        // Simple destruction effect for now.
    },

    clear() {
        this.list = [];
    }
};
