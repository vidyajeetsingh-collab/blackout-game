// PROJECT: BLACKOUT
// Local Save System

const Save = {

    key: "project_blackout_save",

    saveGame() {

        try {

            const data = {
                mission:
                    typeof Missions !== "undefined"
                        ? Missions.current
                        : 0,

                health:
                    typeof Player !== "undefined"
                        ? Player.health
                        : 100,

                weapons:
                    typeof Inventory !== "undefined"
                        ? Inventory.getWeapons()
                        : ["PISTOL"],

                items:
                    typeof Inventory !== "undefined"
                        ? Inventory.getItems()
                        : [],

                completed:
                    typeof Missions !== "undefined"
                        ? Missions.completed
                        : []
            };

            localStorage.setItem(
                this.key,
                JSON.stringify(data)
            );

            console.log("GAME SAVED");

            return true;

        } catch (error) {

            console.error(
                "Save failed:",
                error
            );

            return false;
        }
    },

    loadGame() {

        try {

            const raw =
                localStorage.getItem(
                    this.key
                );

            if (!raw) {
                console.log(
                    "No saved game found."
                );
                return false;
            }

            const data =
                JSON.parse(raw);

            if (
                typeof Missions !== "undefined"
            ) {
                Missions.current =
                    data.mission || 0;

                Missions.completed =
                    Array.isArray(data.completed)
                        ? data.completed
                        : [];
            }

            if (
                typeof Player !== "undefined"
            ) {
                Player.health =
                    typeof data.health === "number"
                        ? data.health
                        : 100;
            }

            if (
                typeof Inventory !== "undefined"
            ) {

                Inventory.weapons =
                    Array.isArray(data.weapons)
                        ? data.weapons
                        : ["PISTOL"];

                Inventory.items =
                    Array.isArray(data.items)
                        ? data.items
                        : [];
            }

            if (
                typeof UI !== "undefined"
            ) {

                UI.updateHealth(
                    Player.health
                );
            }

            console.log("GAME LOADED");

            return true;

        } catch (error) {

            console.error(
                "Load failed:",
                error
            );

            return false;
        }
    },

    deleteSave() {

        localStorage.removeItem(
            this.key
        );

        console.log(
            "SAVE DATA DELETED"
        );
    },

    hasSave() {

        return (
            localStorage.getItem(
                this.key
            ) !== null
        );
    }
};
