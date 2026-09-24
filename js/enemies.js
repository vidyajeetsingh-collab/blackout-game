// PROJECT: BLACKOUT
// Enemy Drone AI System

const Enemies = {

    list: [],

    types: {
        surveillanceDrone: {
            name: "SURVEILLANCE DRONE",
            health: 60,
            speed: 2.2,
            damage: 8,
            detectionRange: 25
        },

        combatDrone: {
            name: "COMBAT DRONE",
            health: 120,
            speed: 1.6,
            damage: 15,
            detectionRange: 30
        }
    },

    init() {
        this.list = [];
        console.log("Enemy system initialized.");
    },

    spawn(type, x, y, z) {

        const data = this.types[type];

        if (!data) return null;

        const enemy = {
            type: type,
            name: data.name,

            position: {
                x: x || 0,
                y: y || 2,
                z: z || 0
            },

            health: data.health,
            maxHealth: data.health,

            speed: data.speed,
            damage: data.damage,
            detectionRange: data.detectionRange,

            state: "PATROL",
            alive: true,

            patrolTarget: {
                x: x || 0,
                z: z || 0
            }
        };

        this.list.push(enemy);

        return enemy;
    },

    spawnMissionEnemies(missionNumber) {

        this.list = [];

        const positions = [
            [-12, 2, -12],
            [12, 2, -10],
            [-15, 2, 10],
            [15, 2, 12],
            [0, 3, 18]
        ];

        let count = Math.min(
            2 + missionNumber,
            positions.length
        );

        for (let i = 0; i < count; i++) {

            const type =
                i % 2 === 0
                    ? "surveillanceDrone"
                    : "combatDrone";

            this.spawn(
                type,
                positions[i][0],
                positions[i][1],
                positions[i][2]
            );
        }

        console.log(
            "Mission enemies spawned:",
            this.list.length
        );
    },

    update(deltaTime) {

        if (
            typeof Player === "undefined"
        ) {
            return;
        }

        for (const enemy of this.list) {

            if (!enemy.alive) {
                continue;
            }

            const dx =
                Player.position.x -
                enemy.position.x;

            const dz =
                Player.position.z -
                enemy.position.z;

            const distance =
                Math.hypot(dx, dz);

            // PATROL → DETECT → ATTACK
            if (
                distance <=
                enemy.detectionRange
            ) {
                enemy.state = "ATTACK";
            }

            if (
                enemy.state === "ATTACK" &&
                distance > 1.8
            ) {

                const length =
                    Math.hypot(dx, dz) || 1;

                enemy.position.x +=
                    (dx / length) *
                    enemy.speed *
                    deltaTime;

                enemy.position.z +=
                    (dz / length) *
                    enemy.speed *
                    deltaTime;
            }

            if (
                enemy.state === "ATTACK" &&
                distance <= 1.8
            ) {
                this.attackPlayer(enemy);
            }
        }
    },

    attackPlayer(enemy) {

        // Prevent damage every single frame.
        const now =
            performance.now();

        if (!enemy.lastAttack) {
            enemy.lastAttack = 0;
        }

        if (
            now - enemy.lastAttack <
            1000
        ) {
            return;
        }

        enemy.lastAttack = now;

        if (
            typeof Player !== "undefined" &&
            typeof Player.damage === "function"
        ) {
            Player.damage(
                enemy.damage
            );
        }
    },

    checkHit(damage) {

        // Simple target selection:
        // damage the closest living enemy.
        let closest = null;
        let closestDistance = Infinity;

        for (const enemy of this.list) {

            if (!enemy.alive) {
                continue;
            }

            const dx =
                Player.position.x -
                enemy.position.x;

            const dz =
                Player.position.z -
                enemy.position.z;

            const distance =
                Math.hypot(dx, dz);

            if (
                distance < closestDistance &&
                distance < 35
            ) {
                closest = enemy;
                closestDistance = distance;
            }
        }

        if (closest) {
            this.damageEnemy(
                closest,
                damage
            );
        }
    },

    damageEnemy(enemy, damage) {

        if (!enemy || !enemy.alive) {
            return;
        }

        enemy.health -= damage;

        console.log(
            enemy.name +
            " HP:",
            enemy.health
        );

        if (enemy.health <= 0) {
            this.destroy(enemy);
        }
    },

    destroy(enemy) {

        if (!enemy) return;

        enemy.health = 0;
        enemy.alive = false;
        enemy.state = "DESTROYED";

        console.log(
            enemy.name +
            " destroyed."
        );

        // Automatic loot drop.
        if (
            typeof Inventory !== "undefined" &&
            typeof Inventory.automaticPickup === "function"
        ) {
            Inventory.automaticPickup({
                ammo: 10
            });
        }
    },

    getAliveCount() {

        return this.list.filter(
            enemy => enemy.alive
        ).length;
    },

    clear() {
        this.list = [];
    }
};
