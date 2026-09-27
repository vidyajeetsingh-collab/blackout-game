
/* =========================================================
   PROJECT: BLACKOUT
   Smarter Enemy AI
   Soldiers: ranged attacks, strafing, distance control
   Drones: aggressive tracking and close-range attacks
   ========================================================= */

const Enemies = {
    enemies: [],
    initialized: false,

    settings: {
        detectionRange: 28,
        soldierLoseTargetTime: 7,

        soldierPreferredRange: 10,
        soldierRangeTolerance: 2.5,
        soldierSpeed: 1.45,
        soldierDamage: 5,
        soldierAttackCooldown: 1.8,
        soldierAttackRange: 20,

        droneAttackRange: 2.5,
        droneSpeed: 2.4,
        droneDamage: 8,
        droneAttackCooldown: 1.2,

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
            const type = index % 3 === 0
                ? "COMBAT DRONE"
                : "SOLDIER";

            const health = type === "COMBAT DRONE"
                ? this.settings.droneHealth
                : this.settings.soldierHealth;

            this.enemies.push({
                id: index + 1,
                type,

                x: point.x,
                y: type === "COMBAT DRONE" ? 2.2 : 0,
                z: point.z,

                startX: point.x,
                startZ: point.z,

                health,
                maxHealth: health,
                alive: true,

                state: "patrol",
                alert: false,
                alertTimer: 0,

                patrolAngle: Math.random() * Math.PI * 2,
                patrolTimer: 1 + Math.random() * 3,

                attackTimer: Math.random() * 1.5,
                strafeDirection: Math.random() < 0.5 ? -1 : 1,
                strafeTimer: 2 + Math.random() * 3,

                hitFlash: 0
            });
        });

        this.initialized = true;
        console.log("BLACKOUT Smart Enemy AI initialized.");
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

        for (const enemy of this.enemies) {
            if (!enemy.alive) continue;

            enemy.attackTimer = Math.max(0, enemy.attackTimer - dt);
            enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);

            const dx = player.x - enemy.x;
            const dz = player.z - enemy.z;
            const distance = Math.hypot(dx, dz);

            if (distance <= this.settings.detectionRange) {
                enemy.alert = true;
                enemy.alertTimer = this.settings.soldierLoseTargetTime;
            } else if (enemy.alertTimer > 0) {
                enemy.alertTimer = Math.max(0, enemy.alertTimer - dt);
            } else {
                enemy.alert = false;
            }

            if (enemy.alert) {
                if (enemy.type === "COMBAT DRONE") {
                    this.updateDrone(enemy, player, distance, dt);
                } else {
                    this.updateSoldier(enemy, player, distance, dt);
                }

                continue;
            }

            this.updatePatrol(enemy, dt);
        }
    },

    updateSoldier(enemy, player, distance, dt) {
        const dx = player.x - enemy.x;
        const dz = player.z - enemy.z;
        const length = Math.max(distance, 0.001);

        const dirX = dx / length;
        const dirZ = dz / length;

        const preferred = this.settings.soldierPreferredRange;
        const tolerance = this.settings.soldierRangeTolerance;

        enemy.strafeTimer -= dt;

        if (enemy.strafeTimer <= 0) {
            enemy.strafeDirection *= -1;
            enemy.strafeTimer = 2 + Math.random() * 3;
        }

        const strafeX = dirZ * enemy.strafeDirection;
        const strafeZ = -dirX * enemy.strafeDirection;

        if (distance > preferred + tolerance) {
            // Close in, but do not rush directly into the player.
            enemy.state = "advance";

            enemy.x += dirX * this.settings.soldierSpeed * dt;
            enemy.z += dirZ * this.settings.soldierSpeed * dt;

            // Small lateral movement makes soldiers less predictable.
            enemy.x += strafeX * this.settings.soldierSpeed * 0.28 * dt;
            enemy.z += strafeZ * this.settings.soldierSpeed * 0.28 * dt;
        } else if (distance < preferred - tolerance) {
            // Back away when the player gets too close.
            enemy.state = "retreat";

            enemy.x -= dirX * this.settings.soldierSpeed * 0.8 * dt;
            enemy.z -= dirZ * this.settings.soldierSpeed * 0.8 * dt;

            enemy.x += strafeX * this.settings.soldierSpeed * 0.45 * dt;
            enemy.z += strafeZ * this.settings.soldierSpeed * 0.45 * dt;
        } else {
            // Hold a firing distance and strafe.
            enemy.state = "strafe";

            enemy.x += strafeX * this.settings.soldierSpeed * 0.65 * dt;
            enemy.z += strafeZ * this.settings.soldierSpeed * 0.65 * dt;
        }

        if (distance <= this.settings.soldierAttackRange) {
            this.attackPlayer(enemy, this.settings.soldierDamage);
        }
    },

    updateDrone(enemy, player, distance, dt) {
        const dx = player.x - enemy.x;
        const dz = player.z - enemy.z;
        const length = Math.max(distance, 0.001);

        if (distance > this.settings.droneAttackRange) {
            enemy.state = "pursue";

            enemy.x += (dx / length) * this.settings.droneSpeed * dt;
            enemy.z += (dz / length) * this.settings.droneSpeed * dt;
        } else {
            enemy.state = "attack";
            this.attackPlayer(enemy, this.settings.droneDamage);
        }

        // Renderer draws drones above the ground.
        enemy.y = 2.2 + Math.sin(
            performance.now() * 0.002 + enemy.id
        ) * 0.18;
    },

    updatePatrol(enemy, dt) {
        enemy.state = "patrol";
        enemy.patrolTimer -= dt;

        if (enemy.patrolTimer <= 0) {
            enemy.patrolAngle += (Math.random() - 0.5) * 2.2;
            enemy.patrolTimer = 1.5 + Math.random() * 3;
        }

        const speed = enemy.type === "COMBAT DRONE"
            ? 0.55
            : 0.42;

        enemy.x += Math.sin(enemy.patrolAngle) * speed * dt;
        enemy.z += Math.cos(enemy.patrolAngle) * speed * dt;

        const dx = enemy.x - enemy.startX;
        const dz = enemy.z - enemy.startZ;

        if (Math.hypot(dx, dz) > 7) {
            enemy.patrolAngle = Math.atan2(
                enemy.startX - enemy.x,
                enemy.startZ - enemy.z
            );
        }

        if (enemy.type === "COMBAT DRONE") {
            enemy.y = 2.2 + Math.sin(
                performance.now() * 0.002 + enemy.id
            ) * 0.18;
        }
    },

    attackPlayer(enemy, damage) {
        if (enemy.attackTimer > 0) return;

        enemy.attackTimer = enemy.type === "COMBAT DRONE"
            ? this.settings.droneAttackCooldown
            : this.settings.soldierAttackCooldown;

        if (
            typeof Player !== "undefined" &&
            typeof Player.damage === "function"
        ) {
            Player.damage(damage);
        }
    },

    /*
     * Called by Weapons.fire().
     * range: weapon effective range
     * isShotgun: random spread for each pellet
     */
    hitTarget(damage, range = 65, isShotgun = false) {
        if (!this.initialized) return false;

        const player = this.getPlayerPosition();
        if (!player) return false;

        const yaw = typeof Camera !== "undefined"
            ? (Camera.yaw || 0)
            : (Player.rotation?.y || 0);

        const aimYaw = yaw + (
            isShotgun ? (Math.random() - 0.5) * 0.24 : 0
        );

        const dirX = Math.sin(aimYaw);
        const dirZ = Math.cos(aimYaw);

        let bestEnemy = null;
        let bestDistance = Infinity;

        for (const enemy of this.enemies) {
            if (!enemy.alive) continue;

            const dx = enemy.x - player.x;
            const dz = enemy.z - player.z;

            const forward = dx * dirX + dz * dirZ;

            if (forward <= 0 || forward > range) continue;

            const side = Math.abs(dx * dirZ - dz * dirX);
            const tolerance = this.settings.hitRadius + forward * 0.025;

            if (side > tolerance) continue;

            if (forward < bestDistance) {
                bestDistance = forward;
                bestEnemy = enemy;
            }
        }

        if (!bestEnemy) return false;

        bestEnemy.health = Math.max(
            0,
            bestEnemy.health - Math.max(0, Number(damage) || 0)
        );

        bestEnemy.hitFlash = 0.16;
        bestEnemy.alert = true;
        bestEnemy.alertTimer = this.settings.soldierLoseTargetTime;
        bestEnemy.state = "alert";

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
            enemy.type === "COMBAT DRONE" &&
            typeof AudioSystem !== "undefined"
        ) {
            AudioSystem.explosion();
        }

        if (enemy.type === "SOLDIER") {
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
