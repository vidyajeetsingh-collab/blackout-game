// PROJECT: BLACKOUT
// Main Game Controller

const Game = {

    running: false,
    lastTime: 0,

    init() {

        console.log(
            "Starting PROJECT: BLACKOUT..."
        );

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
        Save.init();
        World.init();
        UI.init();
        Missions.init();

        Save.loadGame();

        if (!Save.hasSave()) {

            Missions.startMission(0);

        } else {

            Missions.updateObjective();
        }

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

        deltaTime =
            Math.min(
                deltaTime,
                0.05
            );

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

        /*
         * Check every mission objective.
         */
        if (
            typeof Missions !==
                "undefined" &&
            Missions.active &&
            typeof Missions.checkObjective ===
                "function"
        ) {

            Missions.checkObjective();
        }
    },

    render() {

        Engine.clear();

        Renderer.render(
            Camera.position,
            Camera.target
        );
    },

    pause() {

        if (
            typeof UI !== "undefined"
        ) {

            UI.paused = true;
        }
    },

    resume() {

        if (
            typeof UI !== "undefined"
        ) {

            UI.paused = false;
        }
    },

    restartMission() {

        if (
            typeof Missions !==
                "undefined" &&
            typeof Missions.startMission ===
                "function"
        ) {

            Missions.startMission(
                Missions.currentMission
            );
        }
    }
};

window.addEventListener(
    "load",
    () => {

        Game.init();

    }
);