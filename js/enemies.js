
/* =========================================================
   PROJECT: BLACKOUT
   Enemy Combat System
   Player detection, combat, hit detection and ammo drops
   ========================================================= */

const Enemies = {
    enemies: [],
    initialized: false,

    settings: {
        detectionRange: 24,
        attackRange: 2.2,
        attackDamage: 7,
        attackCooldown: 1.15,
        moveSpeed: 1.65,
        hitRadius: 1.15,
        soldierHealth: 100,
        droneHealth: 80
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
            const type = index % 3 === 0 ? "drone" : "soldier";
            const health = type === "drone"
                ? this.settings.droneHealth
                : this.settings.soldierHealth;

            this.enemies.push({
                id: index + 1,
                x: point.x,
                y: type === "drone" ? 2.2 : 0,
                z: point.z,

                startX: point.x,
                startZ: point.z,

                health,
                maxHealth: health,
                alive: true,
                type,

                state: "patrol",
                patrolAngle: Math.random() * Math.PI * 2,
                patrolTimer: Math.random() * 3,

                attackTimer: Math.random() * 0.5,
                hitFlash: 0,
                alert: false
            });
        });

        this.initialized = true;
    },

    getPlayerPosition() {
        if (
            typeof Player === "undefined" ||
            !Player.position
        ) {
            return null;
        }

        return Player.position;
    },

    update(deltaTime) {
        if (!this.initialized) return;

        const dt = Math.min(Math.max(deltaTime || 0, 0), 0.05);
        const player = this.getPlayerPosition();

        if (!player) return;

        this.enemies.forEach(enemy => {
            if (!enemy.alive) return;

            enemy.attackTimer = Math.max(0, enemy.attackTimer - dt);
            enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);

            const dx = player.x - enemy.x;
            const dz = player.z - enemy.z;
            const distance = Math.hypot(dx, dz);

            if (distance <= this.settings.detectionRange) {
                enemy.alert = true;

                if (distance <= this.settings.attackRange) {
                    enemy.state = "attack";
                    this.attackPlayer(enemy);
                } else {
                    enemy.state = "chase";

                    const length = Math.max(distance, 0.001);
                    const speed = this.settings.moveSpeed *
                        (enemy.type === "drone" ? 1.2 : 1);

                    enemy.x += (dx / length) * speed * dt;
                    enemy.z += (dz / length) * speed * dt;

                    // Drones hover slightly above ground.
                    if (enemy.type === "drone") {
                        enemy.y = 2.2 + Math.sin(performance.now() * 0.002 + enemy.id) * 0.15;
                    }
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

        if (typeof Player.damage === "function") {
            Player.damage(this.settings.attackDamage);
        } else if (typeof Player.takeDamage === "function") {
            Player.takeDamage(this.settings.attackDamage);
        }
    },

    /*
     * Called by Weapons.fire().
     * range: weapon's effective range
     * isShotgun: apply a small random spread for each pellet
     */
    hitTarget(damage, range = 65, isShotgun = false) {
        if (!this.initialized) return false;

        const player = this.getPlayerPosition();
        if (!player) return false;

        const yaw = typeof Camera !== "undefined"
            ? (Camera.yaw || 0)
            : (Player.rotation?.y || 0);

        let aimYaw = yaw;

        if (isShotgun) {
            // Each pellet gets a slightly different direction.
            aimYaw += (Math.random() - 0.5) * 0.24;
        }

        const dirX = Math.sin(aimYaw);
        const dirZ = Math.cos(aimYaw);

        let bestEnemy = null;
        let bestDistance = Infinity;

        this.enemies.forEach(enemy => {
            if (!enemy.alive) return;

            const dx = enemy.x - player.x;
            const dz = enemy.z - player.z;

            const forwardDistance = dx * dirX + dz * dirZ;

            if (forwardDistance <= 0 || forwardDistance > range) {
                return;
            }

            const sideDistance = Math.abs(
                dx * dirZ - dz * dirX
            );

            const tolerance = this.settings.hitRadius +
                forwardDistance * 0.025;

            if (sideDistance > tolerance) return;

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

        if (typeof AudioSystem !== "undefined") {
            AudioSystem.impact();
        }

        if (bestEnemy.health <= 0) {
            this.eliminateEnemy(bestEnemy);
        }

        return true;
    },

    eliminateEnemy(enemy) {
        if (!enemy || !enemy.alive) return;

        enemy.alive = false;
        enemy.health = 0;
        enemy.state = "dead";

        if (
            enemy.type === "drone" &&
            typeof AudioSystem !== "undefined"
        ) {
            AudioSystem.explosion();
        }

        // Soldiers may drop ammunition when defeated.
        if (enemy.type === "soldier") {
            this.dropAmmo(enemy);
        }

        console.log("ENEMY ELIMINATED:", enemy.id);
    },

    dropAmmo(enemy) {
        if (
            typeof Inventory === "undefined" ||
            !Array.isArray(Inventory.pickups)
        ) {
            return;
        }

        // Soldiers drop either SMG or assault-rifle ammo.
        const dropType = Math.random() < 0.5
            ? "SMG_AMMO"
            : "RIFLE_AMMO";

        const amount = dropType === "SMG_AMMO" ? 20 : 15;

        const nextId = Inventory.pickups.reduce(
            (max, pickup) => Math.max(max, Number(pickup.id) || 0),
            -1
        ) + 1;

        Inventory.pickups.push({
            id: nextId,
            type: dropType,
            x: enemy.x,
            y: 0.35,
            z: enemy.z,
            amount,
            collected: false
        });
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
