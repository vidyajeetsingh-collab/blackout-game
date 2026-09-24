// PROJECT: BLACKOUT
// Main Game Controller

const Game = {

    running: false,
    lastTime: 0,

    init() {

        console.log("Starting PROJECT: BLACKOUT...");

        // ENGINE
        if (!Engine.init()) {
            return;
        }

        // RENDERER
        Renderer.init();

        // PLAYER
        Player.init();

        // CAMERA
        Camera.init();

        // WEAPONS
        Weapons.init();

        // ENEMIES
        Enemies.init();

        // VEHICLES
        Vehicles.init();

        // INVENTORY
        Inventory.init();

        // WORLD
        World.init();

        // UI
        UI.init();

        // MISSIONS
        Missions.init();

        // SAVE
        Save.loadGame();

        // START / LOAD MISSION
        if (!Save.hasSave()) {

            Missions.startMission(0);

        } else {

            Missions.updateObjective();
        }

        // START GAME LOOP
        this.running = true;

        this.lastTime =
            performance.now();

        requestAnimationFrame(
            (time) => this.loop(time)
        );

        console.log(
            "PROJECT: BLACKOUT is running."
        );
    },

    loop(time) {

        if (!this.running) {
            return;
        }

        let deltaTime =
            (time - this.lastTime) / 1000;

        this.lastTime = time;

        // Prevent huge jumps after
        // tab switching or lag.
        deltaTime =
            Math.min(
                deltaTime,
                0.05
            );

        // Don't update the game while paused.
        if (
            typeof UI === "undefined" ||
            !UI.paused
        ) {

            this.update(
                deltaTime
            );

            this.render();
        }

        requestAnimationFrame(
            (nextTime) =>
                this.loop(nextTime)
        );
    },

    update(deltaTime) {

        Player.update(
            deltaTime
        );

        Camera.update();

        Enemies.update(
            deltaTime
        );

        Vehicles.update(
            deltaTime
        );

        World.update(
            deltaTime
        );

        this.checkMissionState();
    },

    render() {

        Engine.clear();

        Renderer.render(
            Camera.position,
            Camera.target
        );
    },

    checkMissionState() {

        if (!Missions.active) {
            return;
        }

        const mission =
            Missions.getCurrent();

        if (!mission) {
            return;
        }

        if (
            mission.objective ===
            "SURVIVE THE ENEMY ATTACK"
        ) {

            if (
                Enemies.getAliveCount() === 0
            ) {

                Missions.completeMission();
            }
        }
    }
};


// Start game after page loads
window.addEventListener(
    "load",
    () => {
        Game.init();
    }
);