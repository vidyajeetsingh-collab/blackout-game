
const Menu = {
    element: null,
    visible: false,

    init() {
        if (this.element) return;

        this.addStyles();
        this.createMenu();
        this.bindEvents();

        this.show();
    },

    addStyles() {
        if (document.getElementById("blackout-menu-styles")) return;

        const style = document.createElement("style");
        style.id = "blackout-menu-styles";

        style.textContent = `
            #blackoutMainMenu {
                position: fixed;
                inset: 0;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
                background:
                    radial-gradient(ellipse at 50% 45%,
                        rgba(0, 130, 190, .16), transparent 55%),
                    linear-gradient(135deg, #030711, #0a1525 55%, #02050b);
                color: #eafaff;
                font-family: Arial, sans-serif;
            }

            #blackoutMainMenu.hidden {
                display: none;
            }

            #blackoutMainMenu .menu-grid {
                position: absolute;
                inset: -50%;
                opacity: .12;
                background-image:
                    linear-gradient(#00cfff 1px, transparent 1px),
                    linear-gradient(90deg, #00cfff 1px, transparent 1px);
                background-size: 55px 55px;
                transform: perspective(450px) rotateX(55deg);
                animation: blackoutGridMove 18s linear infinite;
                pointer-events: none;
            }

            @keyframes blackoutGridMove {
                from { background-position: 0 0; }
                to { background-position: 0 220px; }
            }

            #blackoutMainMenu .menu-content {
                position: relative;
                z-index: 1;
                width: min(88%, 420px);
                text-align: center;
                padding: 24px 0;
            }

            #blackoutMainMenu .menu-kicker {
                color: #00d9ff;
                font-size: 11px;
                font-weight: bold;
                letter-spacing: 5px;
                margin-bottom: 15px;
            }

            #blackoutMainMenu .menu-title {
                margin: 0;
                font-size: clamp(38px, 9vw, 64px);
                line-height: .95;
                font-weight: 900;
                letter-spacing: 2px;
                text-shadow: 0 0 28px rgba(0, 195, 255, .3);
            }

            #blackoutMainMenu .menu-title span {
                display: block;
                color: #00cfff;
            }

            #blackoutMainMenu .menu-subtitle {
                margin: 20px 0 30px;
                color: #91a9bd;
                font-size: 12px;
                letter-spacing: 2px;
            }

            #blackoutMainMenu .menu-buttons {
                display: grid;
                gap: 12px;
            }

            #blackoutMainMenu .menu-btn {
                width: 100%;
                min-height: 52px;
                border: 1px solid #24516a;
                border-radius: 5px;
                background: rgba(8, 24, 39, .88);
                color: #eafaff;
                font-size: 14px;
                font-weight: bold;
                letter-spacing: 2px;
                cursor: pointer;
                transition: background .2s, border-color .2s,
                            transform .2s;
            }

            #blackoutMainMenu .menu-btn.primary {
                border-color: #00cfff;
                background: linear-gradient(100deg, #006e91, #00425e);
                box-shadow: 0 0 22px rgba(0, 207, 255, .12);
            }

            #blackoutMainMenu .menu-btn:active {
                transform: scale(.98);
            }

            #blackoutMainMenu .menu-btn:hover {
                border-color: #00d9ff;
                background-color: #10334a;
            }

            #blackoutMainMenu .menu-footer {
                margin-top: 28px;
                color: #536b7e;
                font-size: 10px;
                letter-spacing: 2px;
            }

            #blackoutMainMenu .menu-status {
                min-height: 18px;
                margin-top: 14px;
                color: #ffca72;
                font-size: 12px;
            }

            @media (max-height: 500px) {
                #blackoutMainMenu .menu-content {
                    padding: 10px 0;
                }

                #blackoutMainMenu .menu-kicker {
                    margin-bottom: 8px;
                }

                #blackoutMainMenu .menu-title {
                    font-size: 38px;
                }

                #blackoutMainMenu .menu-subtitle {
                    margin: 10px 0 14px;
                }

                #blackoutMainMenu .menu-buttons {
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                }

                #blackoutMainMenu .menu-btn {
                    min-height: 42px;
                    font-size: 11px;
                }

                #blackoutMainMenu .menu-footer {
                    margin-top: 12px;
                }
            }
        `;

        document.head.appendChild(style);
    },

    createMenu() {
        const menu = document.createElement("div");
        menu.id = "blackoutMainMenu";

        menu.innerHTML = `
            <div class="menu-grid"></div>

            <div class="menu-content">
                <div class="menu-kicker">
                    TACTICAL OPERATIONS
                </div>

                <h1 class="menu-title">
                    PROJECT
                    <span>BLACKOUT</span>
                </h1>

                <div class="menu-subtitle">
                    COMMUNICATIONS LOST · MISSION ACTIVE
                </div>

                <div class="menu-buttons">
                    <button class="menu-btn primary"
                            data-menu-action="new">
                        ▶ &nbsp; NEW GAME
                    </button>

                    <button class="menu-btn"
                            data-menu-action="continue">
                        CONTINUE
                    </button>

                    <button class="menu-btn"
                            data-menu-action="missions">
                        CAMPAIGN
                    </button>

                    <button class="menu-btn"
                            data-menu-action="settings">
                        SETTINGS
                    </button>
                </div>

                <div class="menu-status"
                     id="blackoutMenuStatus"></div>

                <div class="menu-footer">
                    BLACKOUT PROJECT · FIELD SYSTEMS
                </div>
            </div>
        `;

        document.body.appendChild(menu);
        this.element = menu;
    },

    bindEvents() {
        this.element.addEventListener("click", event => {
            const button = event.target.closest("[data-menu-action]");
            if (!button) return;

            const action = button.dataset.menuAction;

            // Notify the game when a menu option is selected.
            this.element.dispatchEvent(
                new CustomEvent("blackout:menu-action", {
                    bubbles: true,
                    detail: { action }
                })
            );

            if (action === "new") {
                this.setStatus("NEW GAME SELECTED");
            } else if (action === "continue") {
                this.setStatus("CONTINUE SELECTED");
            } else if (action === "missions") {
                this.setStatus("CAMPAIGN SELECTED");
            } else if (action === "settings") {
                this.setStatus("SETTINGS SELECTED");
            }
        });
    },

    setStatus(message) {
        const status = document.getElementById("blackoutMenuStatus");
        if (status) status.textContent = message;
    },

    show() {
        if (!this.element) return;
        this.element.classList.remove("hidden");
        this.visible = true;
    },

    hide() {
        if (!this.element) return;
        this.element.classList.add("hidden");
        this.visible = false;
    },

    toggle() {
        this.visible ? this.hide() : this.show();
    }
};
