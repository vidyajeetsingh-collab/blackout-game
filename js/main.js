
const Game = {
    running: false,
    lastTime: 0,

    init() {
        console.log("Starting PROJECT: BLACKOUT...");

        // Initialize the WebGL engine.
        if (!Engine.init()) {
            console.error("BLACKOUT engine initialization failed.");
            return;
        }

        Renderer.init();

        // Initialize player and camera.
        Player.init();
        Camera.init();

        // Initialize gameplay systems.
        Weapons.init();
        Enemies.init();
        Vehicles.init();
        Inventory.init();
        Save.init();
        World.init();
        UI.init();
        Missions.init();

        // Create and display the main menu.
        Menu.init();

        // Keep gameplay paused while the menu is open.
        UI.paused = true;

        // Connect the main menu buttons.
        Menu.element.addEventListener(
            "blackout:menu-action",
            (event) => {
                const action = event.detail.action;

                // Start a completely new game.
                if (action === "new") {
                    Save.resetSave();

                    Missions.startMission(0);

                    Menu.hide();
                    UI.paused = false;

                    console.log("NEW GAME STARTED.");
                }

                // Continue from a saved game.
                if (action === "continue") {
                    const loaded = Save.loadGame();

                    if (loaded) {
                        Missions.updateObjective();

                        Menu.hide();
                        UI.paused = false;

                        console.log("CONTINUING SAVED GAME.");
                    } else {
                        Menu.setStatus("NO SAVED GAME FOUND");
                    }
                }

                // These options will be connected later.
                if (action === "missions") {
                    Menu.setStatus("CAMPAIGN MENU COMING SOON");
                }

                if (action === "settings") {
                    Menu.setStatus("SETTINGS COMING SOON");
                }
            }
        );

        // Start the game loop.
        this.running = true;
        this.lastTime = performance.now();

        requestAnimationFrame(
            (time) => this.loop(time)
        );

        console.log("PROJECT: BLACKOUT is running.");
    },

    loop(time) {
        if (!this.running) {
            return;
        }

        let deltaTime =
            (time - this.lastTime) / 1000;

        this.lastTime = time;

        deltaTime = Math.min(deltaTime, 0.05);

        // Do not update or render gameplay while paused.
        if (
            typeof UI === "undefined" ||
            !UI.paused
        ) {
            this.update(deltaTime);
            this.render();
        }

        requestAnimationFrame(
            (nextTime) => this.loop(nextTime)
        );
    },

    update(deltaTime) {
        Player.update(deltaTime);

        Camera.update();

        Enemies.update(deltaTime);

        Vehicles.update(deltaTime);

        Inventory.update(deltaTime);

        World.update(deltaTime);

        UI.updateStatus();

        // Check active mission objectives.
        if (
            typeof Missions !== "undefined" &&
            Missions.active &&
            typeof Missions.checkObjective === "function"
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
        if (typeof UI !== "undefined") {
            UI.paused = true;
        }
    },

    resume() {
        if (typeof UI !== "undefined") {
            UI.paused = false;
        }
    },

    restartMission() {
        if (
            typeof Missions !== "undefined" &&
            typeof Missions.startMission === "function"
        ) {
            Missions.startMission(
                Missions.currentMission
            );
        }
    }
};


// Start the game after the page has loaded.
window.addEventListener("load", () => {
    Game.init();
});
