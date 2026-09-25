// PROJECT: BLACKOUT
// Enemy System

const Enemies = {

    enemies: [],

    attackDistance: 2.2,

    init() {

        this.enemies = [];

        this.spawnEnemies();

        console.log("Enemy system initialized.");
    },

    spawnEnemies() {

        const positions = [
            { x: 12, z: -10 },
            { x: -15, z: -8 },
            { x: 18, z: 8 },
            { x: -12, z: 15 },
            { x: 25, z: -18 }
        ];

        positions.forEach((position, index) => {

            this.enemies.push({

                id: index,

                type:
                    index % 2 === 0
                        ? "COMBAT DRONE"
                        : "ENEMY",

                x: position.x,
                y: 0,
                z: position.z,

                health:
                    index % 2 === 0
                        ? 80
                        : 100,

                maxHealth:
                    index % 2 === 0
                        ? 80
                        : 100,

                speed:
                    index % 2 === 0
                        ? 1.8
                        : 1.2,

                damage:
                    index % 2 === 0
                        ? 8
                        : 10,

                attackCooldown: 0,

                alive: true
            });
        });
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

            if (enemy.attackCooldown > 0) {
                enemy.attackCooldown -= deltaTime;
            }

            const dx =
                Player.position.x - enemy.x;

            const dz =
                Player.position.z - enemy.z;

            const distance =
                Math.hypot(dx, dz);

            if (
                distance > this.attackDistance
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

            if (
                distance <= this.attackDistance
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

    // =========================================
    // HIT ENEMY IN PLAYER'S AIM DIRECTION
    // =========================================

    hitTarget(damage) {

        if (
            typeof Player === "undefined" ||
            typeof Camera === "undefined"
        ) {
            return;
        }

        let bestEnemy = null;
        let bestScore = Infinity;

        // Camera direction
        const dx =
            Camera.target.x -
            Camera.position.x;

        const dz =
            Camera.target.z -
            Camera.position.z;

        const directionLength =
            Math.hypot(dx, dz);

        if (
            directionLength < 0.001
        ) {
            return;
        }

        const dirX =
            dx / directionLength;

        const dirZ =
            dz / directionLength;

        for (
            const enemy of this.enemies
        ) {

            if (!enemy.alive) {
                continue;
            }

            const toEnemyX =
                enemy.x -
                Camera.position.x;

            const toEnemyZ =
                enemy.z -
                Camera.position.z;

            const distance =
                Math.hypot(
                    toEnemyX,
                    toEnemyZ
                );

            // Weapon range
            if (distance > 45) {
                continue;
            }

            const enemyLength =
                Math.max(distance, 0.001);

            const enemyDirX =
                toEnemyX /
                enemyLength;

            const enemyDirZ =
                toEnemyZ /
                enemyLength;

            // Dot product tells us whether
            // the enemy is in front of us.
            const dot =
                dirX * enemyDirX +
                dirZ * enemyDirZ;

            // About 25 degrees aiming tolerance
            if (dot < 0.90) {
                continue;
            }

            // Prefer the closest enemy
            // that is actually in the aim direction.
            const score =
                distance -
                dot * 5;

            if (
                score < bestScore
            ) {

                bestScore = score;
                bestEnemy = enemy;
            }
        }

        if (!bestEnemy) {
            return;
        }

        bestEnemy.health -= damage;

        console.log(
            "HIT ENEMY:",
            bestEnemy.id,
            "DAMAGE:",
            damage
        );

        if (
            bestEnemy.health <= 0
        ) {

            bestEnemy.health = 0;

            bestEnemy.alive = false;

            console.log(
                "ENEMY ELIMINATED:",
                bestEnemy.id
            );
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