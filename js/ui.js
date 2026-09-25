// PROJECT: BLACKOUT
// Tactical HUD + Pause Menu + Mission Information

const UI = {

    paused: false,
    initialized: false,

    elements: {},

    init() {

        this.paused = false;

        this.cacheElements();
        this.createPauseMenu();
        this.createStatusPanel();
        this.setupControls();

        this.updateHealth(
            Player.health
        );

        this.updateMission();
        this.updateStatus();

        this.initialized = true;

        console.log(
            "BLACKOUT UI initialized."
        );
    },

    cacheElements() {

        this.elements = {

            health:
                document.getElementById("health"),

            weapon:
                document.getElementById("weapon"),

            ammo:
                document.getElementById("ammo"),

            objective:
                document.getElementById("objective"),

            pauseButton:
                document.getElementById("pauseButton"),

            gameUI:
                document.getElementById("gameUI")
        };
    },

    createPauseMenu() {

        if (
            document.getElementById(
                "pauseMenu"
            )
        ) {
            return;
        }

        const menu =
            document.createElement("div");

        menu.id = "pauseMenu";

        Object.assign(
            menu.style,
            {
                position: "fixed",
                inset: "0",
                zIndex: "1000",
                display: "none",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(3, 7, 12, 0.88)",
                color: "#f2f6fa",
                fontFamily: "Arial, sans-serif",
                padding: "20px",
                boxSizing: "border-box"
            }
        );

        const panel =
            document.createElement("div");

        Object.assign(
            panel.style,
            {
                width: "min(100%, 360px)",
                padding: "24px",
                background: "#101923",
                border: "1px solid #344858",
                borderRadius: "12px",
                boxSizing: "border-box",
                textAlign: "center",
                boxShadow: "0 12px 40px rgba(0,0,0,.4)"
            }
        );

        const heading =
            document.createElement("h2");

        heading.textContent =
            "PROJECT: BLACKOUT";

        Object.assign(
            heading.style,
            {
                margin: "0 0 8px",
                letterSpacing: "1px",
                fontSize: "22px"
            }
        );

        const subtitle =
            document.createElement("p");

        subtitle.textContent =
            "PAUSED";

        Object.assign(
            subtitle.style,
            {
                color: "#55d9ef",
                fontWeight: "bold",
                letterSpacing: "3px",
                margin: "0 0 22px"
            }
        );

        const makeButton = (
            id,
            label,
            callback
        ) => {

            const button =
                document.createElement("button");

            button.id = id;
            button.textContent = label;

            Object.assign(
                button.style,
                {
                    display: "block",
                    width: "100%",
                    minHeight: "46px",
                    margin: "10px 0",
                    padding: "12px",
                    border: "1px solid #3b5868",
                    borderRadius: "7px",
                    background: "#1b2b39",
                    color: "#ffffff",
                    fontSize: "15px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    touchAction: "manipulation"
                }
            );

            button.addEventListener(
                "click",
                callback
            );

            panel.appendChild(button);

            return button;
        };

        panel.appendChild(heading);
        panel.appendChild(subtitle);

        makeButton(
            "resumeGameButton",
            "RESUME GAME",
            () => this.resume()
        );

        makeButton(
            "restartGameButton",
            "RESTART MISSION",
            () => {

                this.resume();

                if (
                    typeof Game !== "undefined"
                ) {

                    Game.restartMission();
                }
            }
        );

        makeButton(
            "saveGameButton",
            "SAVE GAME",
            () => {

                if (
                    typeof Save !== "undefined"
                ) {

                    const saved =
                        Save.saveGame();

                    this.showMessage(
                        saved
                            ? "GAME SAVED"
                            : "SAVE FAILED"
                    );
                }
            }
        );

        const hint =
            document.createElement("p");

        hint.textContent =
            "Progress is saved on this device.";

        Object.assign(
            hint.style,
            {
                color: "#93a5b4",
                fontSize: "12px",
                margin: "18px 0 0"
            }
        );

        panel.appendChild(hint);
        menu.appendChild(panel);

        document.body.appendChild(menu);

        this.elements.pauseMenu = menu;
        this.elements.pauseSubtitle = subtitle;
    },

    createStatusPanel() {

        if (
            document.getElementById(
                "blackoutStatus"
            )
        ) {
            return;
        }

        const panel =
            document.createElement("div");

        panel.id = "blackoutStatus";

        Object.assign(
            panel.style,
            {
                position: "fixed",
                top: "58px",
                left: "10px",
                zIndex: "20",
                padding: "6px 9px",
                background: "rgba(5, 12, 18, .72)",
                color: "#d5e6ed",
                border: "1px solid rgba(100, 160, 180, .25)",
                borderRadius: "5px",
                fontFamily: "Arial, sans-serif",
                fontSize: "11px",
                lineHeight: "1.6",
                pointerEvents: "none",
                maxWidth: "180px"
            }
        );

        panel.innerHTML = `
            <div id="missionStatus">MISSION 01</div>
            <div id="zoneStatus">CITY DISTRICT</div>
            <div id="vehicleStatus">ON FOOT</div>
            <div id="medkitStatus">MEDKITS: 2</div>
        `;

        document.body.appendChild(panel);

        this.elements.missionStatus =
            document.getElementById(
                "missionStatus"
            );

        this.elements.zoneStatus =
            document.getElementById(
                "zoneStatus"
            );

        this.elements.vehicleStatus =
            document.getElementById(
                "vehicleStatus"
            );

        this.elements.medkitStatus =
            document.getElementById(
                "medkitStatus"
            );
    },

    setupControls() {

        const pauseButton =
            this.elements.pauseButton;

        if (pauseButton) {

            pauseButton.addEventListener(
                "click",
                () => this.togglePause()
            );
        }

        window.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key === "Escape" ||
                    event.key.toLowerCase() === "p"
                ) {

                    event.preventDefault();

                    this.togglePause();
                }
            }
        );
    },

    togglePause() {

        if (this.paused) {

            this.resume();

        } else {

            this.pause();
        }
    },

    pause() {

        this.paused = true;

        const menu =
            this.elements.pauseMenu;

        if (menu) {
            menu.style.display = "flex";
        }

        if (
            this.elements.pauseButton
        ) {

            this.elements.pauseButton.textContent =
                "▶";
        }

        if (
            this.elements.pauseSubtitle
        ) {

            this.elements.pauseSubtitle.textContent =
                "PAUSED";
        }
    },

    resume() {

        this.paused = false;

        const menu =
            this.elements.pauseMenu;

        if (menu) {
            menu.style.display = "none";
        }

        if (
            this.elements.pauseButton
        ) {

            this.elements.pauseButton.textContent =
                "Ⅱ";
        }
    },

    updateHealth(health) {

        const element =
            this.elements.health;

        if (!element) {
            return;
        }

        const value =
            Math.max(
                0,
                Math.min(
                    100,
                    Math.round(health)
                )
            );

        element.textContent =
            "HP: " + value;

        if (value > 60) {

            element.style.color =
                "#68f0a0";

        } else if (value > 30) {

            element.style.color =
                "#ffd166";

        } else {

            element.style.color =
                "#ff5d5d";
        }
    },

    updateMission() {

        const objective =
            this.elements.objective;

        if (
            !objective ||
            typeof Missions === "undefined"
        ) {
            return;
        }

        const mission =
            Missions.getCurrent();

        if (!mission) {
            return;
        }

        objective.textContent =
            "MISSION " +
            String(mission.id + 1).padStart(2, "0") +
            ": " +
            mission.objective;

        if (
            this.elements.missionStatus
        ) {

            this.elements.missionStatus.textContent =
                "MISSION " +
                String(mission.id + 1).padStart(2, "0") +
                " — " +
                mission.title;
        }
    },

    updateStatus() {

        if (!this.initialized && !this.elements) {
            return;
        }

        if (
            typeof Player !== "undefined" &&
            typeof World !== "undefined" &&
            this.elements.zoneStatus
        ) {

            const zone =
                World.getZoneAt(
                    Player.position.x,
                    Player.position.z
                );

            this.elements.zoneStatus.textContent =
                zone
                    ? zone.name
                    : "OUTSKIRTS";
        }

        if (
            this.elements.vehicleStatus &&
            typeof Vehicles !== "undefined"
        ) {

            const vehicle =
                Vehicles.getActiveVehicle();

            if (vehicle) {

                this.elements.vehicleStatus.textContent =
                    "CAR · HP " +
                    Math.round(vehicle.health) +
                    " · FUEL " +
                    Math.round(vehicle.fuel);

            } else {

                this.elements.vehicleStatus.textContent =
                    "ON FOOT";
            }
        }

        if (
            this.elements.medkitStatus &&
            typeof Inventory !== "undefined"
        ) {

            this.elements.medkitStatus.textContent =
                "MEDKITS: " +
                Inventory.getMedkits();
        }
    },

    showMessage(message) {

        let toast =
            document.getElementById(
                "blackoutToast"
            );

        if (!toast) {

            toast =
                document.createElement("div");

            toast.id =
                "blackoutToast";

            Object.assign(
                toast.style,
                {
                    position: "fixed",
                    left: "50%",
                    bottom: "100px",
                    transform: "translateX(-50%)",
                    zIndex: "2000",
                    padding: "12px 18px",
                    borderRadius: "6px",
                    background: "#122431",
                    border: "1px solid #55d9ef",
                    color: "#ffffff",
                    fontFamily: "Arial, sans-serif",
                    fontSize: "14px",
                    fontWeight: "bold",
                    textAlign: "center",
                    pointerEvents: "none"
                }
            );

            document.body.appendChild(toast);
        }

        toast.textContent = message;
        toast.style.display = "block";

        if (this.toastTimeout) {
            clearTimeout(this.toastTimeout);
        }

        this.toastTimeout =
            setTimeout(() => {

                toast.style.display = "none";

            }, 1800);
    }
};