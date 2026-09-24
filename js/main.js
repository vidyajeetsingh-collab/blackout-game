// PROJECT: BLACKOUT
// Main Game Controller + On-Screen Diagnostics

const Game = {

    running: false,
    lastTime: 0,

    // --------------------------------
    // ON-SCREEN DIAGNOSTIC
    // --------------------------------

    diagnosticBox: null,

    createDiagnostic() {

        this.diagnosticBox =
            document.createElement("div");

        this.diagnosticBox.id =
            "blackoutDiagnostic";

        this.diagnosticBox.style.position = "fixed";
        this.diagnosticBox.style.top = "10px";
        this.diagnosticBox.style.left = "10px";
        this.diagnosticBox.style.right = "10px";
        this.diagnosticBox.style.zIndex = "99999";

        this.diagnosticBox.style.background =
            "rgba(0,0,0,0.92)";

        this.diagnosticBox.style.color =
            "#00ff88";

        this.diagnosticBox.style.padding =
            "14px";

        this.diagnosticBox.style.border =
            "2px solid #00ff88";

        this.diagnosticBox.style.borderRadius =
            "10px";

        this.diagnosticBox.style.fontFamily =
            "monospace";

        this.diagnosticBox.style.fontSize =
            "13px";

        this.diagnosticBox.style.lineHeight =
            "1.5";

        this.diagnosticBox.style.maxHeight =
            "70vh";

        this.diagnosticBox.style.overflow =
            "auto";

        this.diagnosticBox.innerHTML =
            "<b>PROJECT: BLACKOUT</b><br>" +
            "Starting...";

        document.body.appendChild(
            this.diagnosticBox
        );
    },

    log(message, success = true) {

        if (!this.diagnosticBox) {
            return;
        }

        const color =
            success ? "#00ff88" : "#ff4444";

        const line =
            document.createElement("div");

        line.style.color = color;

        line.textContent =
            (success ? "✓ " : "✗ ") +
            message;

        this.diagnosticBox.appendChild(
            line
        );

        this.diagnosticBox.scrollTop =
            this.diagnosticBox.scrollHeight;
    },

    error(message) {

        this.log(
            "ERROR: " + message,
            false
        );
    },

    // --------------------------------
    // GAME INITIALIZATION
    // --------------------------------

    init() {

        this.createDiagnostic();

        this.log(
            "GAME INIT"
        );

        try {

            // ENGINE
            this.log(
                "Starting WebGL Engine..."
            );

            if (
                typeof Engine === "undefined"
            ) {

                throw new Error(
                    "Engine is undefined"
                );
            }

            if (!Engine.init()) {

                throw new Error(
                    "Engine.init() failed"
                );
            }

            this.log(
                "ENGINE OK"
            );

            // RENDERER
            this.log(
                "Starting Renderer..."
            );

            if (
                typeof Renderer === "undefined"
            ) {

                throw new Error(
                    "Renderer is undefined"
                );
            }

            Renderer.init();

            this.log(
                "RENDERER OK"
            );

            // PLAYER
            this.log(
                "Starting Player..."
            );

            if (
                typeof Player === "undefined"
            ) {

                throw new Error(
                    "Player is undefined"
                );
            }

            Player.init();

            this.log(
                "PLAYER OK"
            );

            // CAMERA
            this.log(
                "Starting Camera..."
            );

            if (
                typeof Camera === "undefined"
            ) {

                throw new Error(
                    "Camera is undefined"
                );
            }

            Camera.init();

            this.log(
                "CAMERA OK"
            );

            // WEAPONS
            this.log(
                "Starting Weapons..."
            );

            if (
                typeof Weapons === "undefined"
            ) {

                throw new Error(
                    "Weapons is undefined"
                );
            }

            Weapons.init();

            this.log(
                "WEAPONS OK"
            );

            // ENEMIES
            this.log(
                "Starting Enemies..."
            );

            if (
                typeof Enemies === "undefined"
            ) {

                throw new Error(
                    "Enemies is undefined"
                );
            }

            Enemies.init();

            this.log(
                "ENEMIES OK"
            );

            // VEHICLES
            this.log(
                "Starting Vehicles..."
            );

            if (
                typeof Vehicles === "undefined"
            ) {

                throw new Error(
                    "Vehicles is undefined"
                );
            }

            Vehicles.init();

            this.log(
                "VEHICLES OK"
            );

            // INVENTORY
            this.log(
                "Starting Inventory..."
            );

            if (
                typeof Inventory === "undefined"
            ) {

                throw new Error(
                    "Inventory is undefined"
                );
            }

            Inventory.init();

            this.log(
                "INVENTORY OK"
            );

            // WORLD
            this.log(
                "Starting World..."
            );

            if (
                typeof World === "undefined"
            ) {

                throw new Error(
                    "World is undefined"
                );
            }

            World.init();

            this.log(
                "WORLD OK"
            );

            // UI
            this.log(
                "Starting UI..."
            );

            if (
                typeof UI === "undefined"
            ) {

                throw new Error(
                    "UI is undefined"
                );
            }

            UI.init();

            this.log(
                "UI OK"
            );

            // MISSIONS
            this.log(
                "Starting Missions..."
            );

            if (
                typeof Missions === "undefined"
            ) {

                throw new Error(
                    "Missions is undefined"
                );
            }

            Missions.init();

            this.log(
                "MISSIONS OK"
            );

            // SAVE
            this.log(
                "Loading Save System..."
            );

            if (
                typeof Save === "undefined"
            ) {

                throw new Error(
                    "Save is undefined"
                );
            }

            Save.loadGame();

            this.log(
                "SAVE OK"
            );

            // MISSION
            this.log(
                "Starting Mission..."
            );

            if (!Save.hasSave()) {

                Missions.startMission(0);

            } else {

                Missions.updateObjective();
            }

            this.log(
                "MISSION OK"
            );

            // GAME LOOP
            this.running = true;

            this.lastTime =
                performance.now();

            this.log(
                "STARTING GAME LOOP"
            );

            requestAnimationFrame(
                (time) =>
                    this.loop(time)
            );

        } catch (error) {

            this.running = false;

            this.error(
                error.message ||
                String(error)
            );

            console.error(
                error
            );
        }
    },

    // --------------------------------
    // GAME LOOP
    // --------------------------------

    loop(time) {

        if (!this.running) {
            return;
        }

        try {

            let deltaTime =
                (time - this.lastTime) /
                1000;

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

        } catch (error) {

            this.running = false;

            this.error(
                "GAME LOOP: " +
                (
                    error.message ||
                    String(error)
                )
            );

            console.error(
                error
            );

            return;
        }

        requestAnimationFrame(
            (nextTime) =>
                this.loop(nextTime)
        );
    },

    // --------------------------------
    // UPDATE
    // --------------------------------

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

    // --------------------------------
    // RENDER
    // --------------------------------

    render() {

        Engine.clear();

        Renderer.render(
            Camera.position,
            Camera.target
        );
    },

    // --------------------------------
    // MISSION CHECK
    // --------------------------------

    checkMissionState() {

        if (
            !Missions.active
        ) {
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


// --------------------------------
// START GAME
// --------------------------------

window.addEventListener(
    "load",
    () => {

        Game.init();

    }
);