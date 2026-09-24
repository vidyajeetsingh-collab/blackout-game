// PROJECT: BLACKOUT
// Main Game Controller

const Game = {

    running: false,
    lastTime: 0,

    init() {

        console.log("PROJECT: BLACKOUT starting...");

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

        this.running = true;
        this.lastTime = performance.now();

        requestAnimationFrame(
            this.loop.bind(this)
        );

        console.log(
            "PROJECT: BLACKOUT ready."
        );
    },

    loop(timestamp) {

        if (!this.running) {
            return;
        }

        const deltaTime =
            Math.min(
                (timestamp - this.lastTime) / 1000,
                0.05
            );

        this.lastTime = timestamp;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame(
            this.loop.bind(this)
        );
    },

    update(deltaTime) {

        Player.update(deltaTime);
        Camera.update();

        Enemies.update(deltaTime);
        Vehicles.update(deltaTime);
        World.update(deltaTime);
    },

    render() {

        Renderer.render();
    }
};

window.addEventListener(
    "load",
    () => {
        Game.init();
    }
);
