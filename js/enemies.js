// PROJECT: BLACKOUT
// Enemy System

const Enemies = {

    enemies: [],

    spawnDistance: 18,
    attackDistance: 2.2,

    init() {

        this.enemies = [];

        this.spawnEnemies();

        console.log(
            "Enemy system initialized."
        );
    },

    spawnEnemies() {

        const positions = [
            { x: 12, z: -10 },
            { x: -15, z: -8 },
            { x: 18, z: 8 },
            { x: -12, z: 15 },
            { x: 25, z: -18 }
        ];

        positions.forEach(
            (position, index) => {

                this.enemies.push({

                    id: index,

                    type: index % 2 === 0
                        ? "COMBAT DRONE"
                        : "ENEMY",

                    x: position.x,
                    y: 0,
                    z: position.z,

                    health: index % 2 === 0
                        ? 80
                        : 100,

                    maxHealth: index % 2 === 0
                        ? 80
                        : 100,

                    speed: index % 2 === 0
                        ? 1.8
                        : 1.2,

                    damage: index % 2 === 0
                        ? 8
                        : 10,

                    attackCooldown: 0,

                    alive: true
                });
            }
        );
    },

    update(deltaTime) {

        if (
            typeof Player === "undefined"
        ) {
            return;
        }

        for (
            const enemy of this.enemies
        ) {

            if (!enemy.alive) {
                continue;
            }

            if (
                enemy.attackCooldown > 0
            ) {

                enemy.attackCooldown -=
                    deltaTime;
            }

            const dx =
                Player.position.x -
                enemy.x;

            const dz =
                Player.position.z -
                enemy.z;

            const distance =
                Math.hypot(dx, dz);

            // Move toward player
            if (
                distance > this.attackDistance &&
                distance < this.spawnDistance + 30
            ) {

                const length =
                    Math.max(distance, 0.001);

                enemy.x +=
                    (dx / length) *
                    enemy.speed *
                    deltaTime;

                enemy.z +=
                    (dz / length) *
                    enemy.speed *
                    deltaTime;
            }

            // Attack player
            if (
                distance <=
                this.attackDistance
            ) {

                if (
                    enemy.attackCooldown <= 0
                ) {

                    Player.damage(
                        enemy.damage
                    );

                    enemy.attackCooldown =
                        1.2;
                }
            }
        }
    },

    hitTarget(damage) {

        if (
            !Player ||
            !Player.position
        ) {
            return;
        }

        let closest = null;
        let closestDistance = Infinity;

        for (
            const enemy of this.enemies
        ) {

            if (!enemy.alive) {
                continue;
            }

            const dx =
                enemy.x -
                Player.position.x;

            const dz =
                enemy.z -
                Player.position.z;

            const distance =
                Math.hypot(dx, dz);

            if (
                distance < closestDistance
            ) {

                closestDistance =
                    distance;

                closest = enemy;
            }
        }

        // Only hit an enemy within
        // reasonable weapon range.
        if (
            closest &&
            closestDistance <= 35
        ) {

            closest.health -= damage;

            if (
                closest.health <= 0
            ) {

                closest.health = 0;

                closest.alive = false;

                console.log(
                    "ENEMY ELIMINATED:",
                    closest.id
                );
            }
        }
    },

    getAliveCount() {

        return this.enemies.filter(
            enemy => enemy.alive
        ).length;
    },

    getAliveEnemies() {

        return this.enemies.filter(
            enemy => enemy.alive
        );
    },

    reset() {

        this.enemies = [];

        this.spawnEnemies();
    }
};