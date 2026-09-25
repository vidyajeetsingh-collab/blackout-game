/* =========================================
   PROJECT: BLACKOUT
   Settings System
========================================= */

const Settings = {
    element: null,

    defaults: {
        graphics: "medium",
        sensitivity: 50,
        sound: true,
        performance: false
    },

    values: {},

    init() {
        this.load();
        this.createScreen();
    },

    load() {
        try {
            const saved = localStorage.getItem("blackout-settings");

            this.values = saved
                ? { ...this.defaults, ...JSON.parse(saved) }
                : { ...this.defaults };
        } catch (error) {
            this.values = { ...this.defaults };
        }
    },

    save() {
        try {
            localStorage.setItem(
                "blackout-settings",
                JSON.stringify(this.values)
            );
        } catch (error) {
            console.warn("Could not save settings.");
        }

        window.dispatchEvent(
            new CustomEvent("blackout:settings-changed", {
                detail: { ...this.values }
            })
        );
    },

    createScreen() {
        if (this.element) return;

        const style = document.createElement("style");

        style.textContent = `
            #blackout-settings {
                position: fixed;
                inset: 0;
                z-index: 10001;
                display: none;
                align-items: center;
                justify-content: center;
                padding: 18px;
                background: rgba(2, 7, 16, 0.94);
                color: #eaf4ff;
                font-family: Arial, sans-serif;
                box-sizing: border-box;
            }

            #blackout-settings * {
                box-sizing: border-box;
            }

            #blackout-settings .settings-panel {
                width: 100%;
                max-width: 520px;
                max-height: 90vh;
                overflow-y: auto;
                padding: 24px;
                border: 1px solid #174a68;
                border-radius: 16px;
                background: linear-gradient(
                    145deg,
                    #101f32,
                    #07111f
                );
                box-shadow: 0 0 35px rgba(0, 190, 255, 0.12);
            }

            #blackout-settings .settings-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                margin-bottom: 22px;
            }

            #blackout-settings h2 {
                margin: 0;
                color: #55d8ff;
                font-size: 24px;
                letter-spacing: 2px;
            }

            #blackout-settings .settings-subtitle {
                margin: 7px 0 0;
                color: #8ea6bd;
                font-size: 12px;
            }

            #blackout-settings .settings-close {
                width: 42px;
                height: 42px;
                border: 1px solid #29445d;
                border-radius: 10px;
                background: #14263a;
                color: white;
                font-size: 23px;
                cursor: pointer;
            }

            #blackout-settings .settings-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 16px;
                padding: 17px 0;
                border-bottom: 1px solid #203348;
            }

            #blackout-settings .settings-label {
                font-size: 15px;
                font-weight: bold;
            }

            #blackout-settings .settings-description {
                margin-top: 5px;
                color: #8ea6bd;
                font-size: 12px;
                line-height: 1.4;
            }

            #blackout-settings select {
                width: 130px;
                padding: 10px;
                border: 1px solid #28516b;
                border-radius: 8px;
                background: #0b1929;
                color: white;
                font-size: 14px;
            }

            #blackout-settings input[type="range"] {
                width: 130px;
                accent-color: #31cfff;
            }

            #blackout-settings .settings-toggle {
                width: 48px;
                height: 27px;
                flex-shrink: 0;
                position: relative;
                border: 0;
                border-radius: 20px;
                background: #34475a;
                cursor: pointer;
            }

            #blackout-settings .settings-toggle::after {
                content: "";
                position: absolute;
                top: 4px;
                left: 4px;
                width: 19px;
                height: 19px;
                border-radius: 50%;
                background: white;
                transition: transform 0.18s;
            }

            #blackout-settings .settings-toggle.active {
                background: #00a9d8;
            }

            #blackout-settings .settings-toggle.active::after {
                transform: translateX(21px);
            }

            #blackout-settings .settings-footer {
                display: flex;
                gap: 12px;
                margin-top: 24px;
            }

            #blackout-settings .settings-button {
                flex: 1;
                min-height: 46px;
                padding: 12px;
                border: 1px solid #17617e;
                border-radius: 9px;
                background: #0c263a;
                color: #dff8ff;
                font-weight: bold;
                cursor: pointer;
            }

            #blackout-settings .settings-button.primary {
                border-color: #00bce9;
                background: #00a6d1;
                color: #03111b;
            }

            #blackout-settings .settings-status {
                min-height: 18px;
                margin-top: 14px;
                color: #62e5ad;
                text-align: center;
                font-size: 12px;
            }

            @media (max-width: 420px) {
                #blackout-settings .settings-panel {
                    padding: 18px;
                }

                #blackout-settings .settings-row {
                    gap: 8px;
                }

                #blackout-settings .settings-label {
                    font-size: 14px;
                }

                #blackout-settings select {
                    width: 112px;
                }

                #blackout-settings input[type="range"] {
                    width: 105px;
                }
            }
        `;

        document.head.appendChild(style);

        this.element = document.createElement("div");
        this.element.id = "blackout-settings";

        this.element.innerHTML = `
            <div class="settings-panel">

                <div class="settings-header">
                    <div>
                        <h2>SETTINGS</h2>
                        <p class="settings-subtitle">
                            Configure your gameplay
                        </p>
                    </div>

                    <button
                        class="settings-close"
                        data-action="close"
                        aria-label="Close settings"
                    >×</button>
                </div>

                <div class="settings-row">
                    <div>
                        <div class="settings-label">
                            Graphics Quality
                        </div>
                        <div class="settings-description">
                            Choose visual quality
                        </div>
                    </div>

                    <select id="blackout-graphics">
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>

                <div class="settings-row">
                    <div>
                        <div class="settings-label">
                            Camera Sensitivity
                        </div>
                        <div class="settings-description">
                            <span id="blackout-sensitivity-value">
                                50
                            </span>%
                        </div>
                    </div>

                    <input
                        id="blackout-sensitivity"
                        type="range"
                        min="10"
                        max="100"
                        value="50"
                    >
                </div>

                <div class="settings-row">
                    <div>
                        <div class="settings-label">
                            Sound
                        </div>
                        <div class="settings-description">
                            Enable or disable game audio
                        </div>
                    </div>

                    <button
                        class="settings-toggle"
                        id="blackout-sound"
                        aria-label="Toggle sound"
                        aria-pressed="true"
                    ></button>
                </div>

                <div class="settings-row">
                    <div>
                        <div class="settings-label">
                            Performance Mode
                        </div>
                        <div class="settings-description">
                            Prioritize smoother gameplay
                        </div>
                    </div>

                    <button
                        class="settings-toggle"
                        id="blackout-performance"
                        aria-label="Toggle performance mode"
                        aria-pressed="false"
                    ></button>
                </div>

                <div class="settings-footer">
                    <button
                        class="settings-button"
                        data-action="reset"
                    >
                        RESET
                    </button>

                    <button
                        class="settings-button primary"
                        data-action="close"
                    >
                        SAVE & CLOSE
                    </button>
                </div>

                <div
                    class="settings-status"
                    id="blackout-settings-status"
                    aria-live="polite"
                ></div>

            </div>
        `;

        document.body.appendChild(this.element);
        this.bindEvents();
        this.updateScreen();
    },

    bindEvents() {
        this.element.addEventListener("click", (event) => {
            const actionButton = event.target.closest("[data-action]");

            if (actionButton) {
                const action = actionButton.dataset.action;

                if (action === "close") this.close();
                if (action === "reset") this.reset();

                return;
            }

            if (event.target === this.element) {
                this.close();
            }
        });

        const graphics = this.element.querySelector(
            "#blackout-graphics"
        );

        graphics.addEventListener("change", () => {
            this.values.graphics = graphics.value;
            this.changed();
        });

        const sensitivity = this.element.querySelector(
            "#blackout-sensitivity"
        );

        sensitivity.addEventListener("input", () => {
            this.values.sensitivity = Number(sensitivity.value);

            this.element.querySelector(
                "#blackout-sensitivity-value"
            ).textContent = sensitivity.value;

            this.changed();
        });

        this.element.querySelector(
            "#blackout-sound"
        ).addEventListener("click", () => {
            this.values.sound = !this.values.sound;
            this.updateScreen();
            this.changed();
        });

        this.element.querySelector(
            "#blackout-performance"
        ).addEventListener("click", () => {
            this.values.performance = !this.values.performance;
            this.updateScreen();
            this.changed();
        });

        document.addEventListener("keydown", (event) => {
            if (
                event.key === "Escape" &&
                this.element.style.display === "flex"
            ) {
                this.close();
            }
        });
    },

    updateScreen() {
        if (!this.element) return;

        this.element.querySelector(
            "#blackout-graphics"
        ).value = this.values.graphics;

        this.element.querySelector(
            "#blackout-sensitivity"
        ).value = this.values.sensitivity;

        this.element.querySelector(
            "#blackout-sensitivity-value"
        ).textContent = this.values.sensitivity;

        this.setToggle(
            "#blackout-sound",
            this.values.sound
        );

        this.setToggle(
            "#blackout-performance",
            this.values.performance
        );
    },

    setToggle(selector, enabled) {
        const button = this.element.querySelector(selector);

        button.classList.toggle("active", enabled);
        button.setAttribute("aria-pressed", String(enabled));
    },

    changed() {
        this.save();

        const status = this.element.querySelector(
            "#blackout-settings-status"
        );

        status.textContent = "Settings saved";
    },

    reset() {
        this.values = { ...this.defaults };
        this.updateScreen();
        this.save();

        this.element.querySelector(
            "#blackout-settings-status"
        ).textContent = "Settings reset to default";
    },

    open() {
        if (!this.element) this.createScreen();

        this.updateScreen();
        this.element.style.display = "flex";
    },

    close() {
        if (!this.element) return;

        this.element.style.display = "none";

        window.dispatchEvent(
            new CustomEvent("blackout:settings-closed")
        );
    }
};

window.Settings = Settings;