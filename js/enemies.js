
const Enemies = {
    enemies: [],
    initialized: false,

    settings: {
        detectionRange: 24,
        attackRange: 2.2,
        attackDamage: 7,
        attackCooldown: 1.15,
        moveSpeed: 1.65,
        hitRadius: 1.15
    },

    init() {
        this.enemies = [];

        const spawnPoints = [
            { x: 18, z: 12 },
            { x: 26, z: 25 },
            { x: -18, z: 16 },
            { x: -28, z: -12 },
            { x: 12, z: -26 },
            { x: 34, z: -18 },
            { x: -35, z: 28 },
            { x: 5, z: 38 }
        ];

        spawnPoints.forEach((point, index) => {
            this.enemies.push({
                id: index + 1,
                x: point.x,
                y: 0,
                z: point.z,

                startX: point.x,
                startZ: point.z,

                health: 100,
                maxHealth: 100,
                alive: true,

                type: index % 3 === 0 ? "drone" : "soldier",

                state: "patrol",
                patrolAngle: Math.random() * Math.PI * 2,
                patrolTimer: Math.random() * 3,

                attackTimer: 0,
                hitFlash: 0,
                alert: false
            });
        });

        this.initialized = true;
    },

    update(deltaTime) {
        if (!this.initialized) return;

        const dt = Math.min(deltaTime || 0, 0.05);

        if (typeof Player === "undefined") return;

        this.enemies.forEach(enemy => {
            if (!enemy.alive) return;

            enemy.attackTimer = Math.max(0, enemy.attackTimer - dt);
            enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);

            const dx = Player.x - enemy.x;
            const dz = Player.z - enemy.z;
            const distance = Math.hypot(dx, dz);

            if (distance < this.settings.detectionRange) {
                enemy.alert = true;
                enemy.state = distance <= this.settings.attackRange
                    ? "attack"
                    : "chase";

                if (distance > this.settings.attackRange) {
                    const length = Math.max(distance, 0.001);

                    enemy.x += (dx / length) *
                        this.settings.moveSpeed * dt;

                    enemy.z += (dz / length) *
                        this.settings.moveSpeed * dt;
                } else {
                    this.attackPlayer(enemy);
                }

                return;
            }

            enemy.state = "patrol";
            enemy.alert = false;
            enemy.patrolTimer -= dt;

            if (enemy.patrolTimer <= 0) {
                enemy.patrolAngle += (Math.random() - 0.5) * 2.2;
                enemy.patrolTimer = 1.5 + Math.random() * 3;
            }

            const patrolSpeed = this.settings.moveSpeed * 0.28;

            enemy.x += Math.sin(enemy.patrolAngle) * patrolSpeed * dt;
            enemy.z += Math.cos(enemy.patrolAngle) * patrolSpeed * dt;

            // Keep patrols close to their starting area.
            const fromStartX = enemy.x - enemy.startX;
            const fromStartZ = enemy.z - enemy.startZ;
            const patrolDistance = Math.hypot(fromStartX, fromStartZ);

            if (patrolDistance > 7) {
                enemy.patrolAngle = Math.atan2(
                    enemy.startX - enemy.x,
                    enemy.startZ - enemy.z
                );
            }
        });
    },

    attackPlayer(enemy) {
        if (enemy.attackTimer > 0) return;

        enemy.attackTimer = this.settings.attackCooldown;

        if (typeof Player === "undefined") return;

        // Support the damage method exposed by the player system.
        if (typeof Player.takeDamage === "function") {
            Player.takeDamage(this.settings.attackDamage);
        } else if (typeof Player.damage === "function") {
            Player.damage(this.settings.attackDamage);
        }
    },

    hitTarget(damage) {
        if (!this.initialized) return false;
        if (typeof Player === "undefined") return false;

        const yaw = typeof Camera !== "undefined"
            ? Camera.yaw || 0
            : (Player.rotation?.y || 0);

        // Aim direction follows the camera's horizontal rotation.
        const dirX = Math.sin(yaw);
        const dirZ = Math.cos(yaw);

        let bestEnemy = null;
        let bestDistance = Infinity;

        this.enemies.forEach(enemy => {
            if (!enemy.alive) return;

            const dx = enemy.x - Player.x;
            const dz = enemy.z - Player.z;

            const forwardDistance = dx * dirX + dz * dirZ;

            // Ignore targets behind the player.
            if (forwardDistance <= 0) return;

            const sideDistance = Math.abs(
                dx * dirZ - dz * dirX
            );

            // Wider tolerance at longer distances.
            const tolerance = this.settings.hitRadius +
                forwardDistance * 0.025;

            if (sideDistance > tolerance) return;
            if (forwardDistance > 65) return;

            if (forwardDistance < bestDistance) {
                bestDistance = forwardDistance;
                bestEnemy = enemy;
            }
        });

        if (!bestEnemy) return false;

        const hitDamage = Math.max(0, Number(damage) || 0);

        bestEnemy.health = Math.max(
            0,
            bestEnemy.health - hitDamage
        );

        bestEnemy.hitFlash = 0.16;
        bestEnemy.alert = true;
        bestEnemy.state = "chase";

        if (bestEnemy.health <= 0) {
            bestEnemy.alive = false;
            bestEnemy.state = "dead";

            console.log("ENEMY ELIMINATED:", bestEnemy.id);
        }

        return true;
    },

    getAliveEnemies() {
        return this.enemies.filter(enemy => enemy.alive);
    },

    getAliveCount() {
        return this.enemies.filter(enemy => enemy.alive).length;
    },

    reset() {
        this.init();
    }
};
