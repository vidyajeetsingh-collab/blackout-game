const Game = {

    running: false,
    lastTime: 0,

    init() {

        console.log("1. GAME INIT");

        if (!Engine.init()) {
            console.error("2. ENGINE FAILED");
            return;
        }

        console.log("2. ENGINE OK");

        Renderer.init();

        console.log("3. RENDERER INIT FINISHED");

        Player.init();

        console.log("4. PLAYER OK");

        Camera.init();

        console.log("5. CAMERA OK");

        Weapons.init();
        console.log("6. WEAPONS OK");

        Enemies.init();
        console.log("7. ENEMIES OK");

        Vehicles.init();
        console.log("8. VEHICLES OK");

        Inventory.init();
        console.log("9. INVENTORY OK");

        World.init();
        console.log("10. WORLD OK");

        UI.init();
        console.log("11. UI OK");

        Missions.init();
        console.log("12. MISSIONS OK");

        Save.loadGame();
        console.log("13. SAVE OK");

        if (!Save.hasSave()) {
            Missions.startMission(0);
        } else {
            Missions.updateObjective();
        }

        console.log("14. MISSION OK");

        this.running = true;
        this.lastTime = performance.now();

        console.log("15. STARTING GAME LOOP");

        requestAnimationFrame(
            (time) => this.loop(time)
        );
    },

    loop(time) {

        if (!this.running) return;

        let deltaTime =
            (time - this.lastTime) / 1000;

        this.lastTime = time;

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

        if (!Missions.active) return;

        const mission =
            Missions.getCurrent();

        if (!mission) return;

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