// PROJECT: BLACKOUT
// Main Game Controller

const Game = {

    running: false,
    lastTime: 0,

    init() {

        console.log("Starting PROJECT: BLACKOUT...");

        if (!Engine.init()) {
            return;
        }

        Renderer.init();
        Player.init();
        Camera.init();
        Weapons.init();
        Enemies.init();
        Vehicles.init();
        Inventory.init();
        World.init();
        UI.init();
        Missions.init();

        Save.loadGame();

        // Start the first mission if no save exists.
        if (!Save.hasSave()) {
            Missions.startMission(0);
        } else {
            Missions.updateObjective();
        }

        this.running = true;
        this.lastTime = performance.now();

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

        // Prevent huge jumps after tab/app switching.
        deltaTime =
            Math.min(deltaTime, 0.05);

        if (
            typeof UI === "undefined" ||
            !UI.paused
        ) {

            this.update(deltaTime);
            this.render();
        }

        requestAnimationFrame(
            (nextTime) =>
                this.loop(nextTime)
        );
    },

    update(deltaTime) {

        Player.update(deltaTime);

        Camera.update();

        Enemies.update(deltaTime);

        Vehicles.update(deltaTime);

        World.update(deltaTime);

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

        // Survival mission:
        // complete when all enemies are destroyed.
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

window.addEventListener(
    "load",
    () => {
        Game.init();
    }
);
