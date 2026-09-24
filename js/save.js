// PROJECT: BLACKOUT
// Local Save System

const Save = {

    key: "blackout_save",

    saveGame() {

        const data = {
            mission: Missions.currentMission,
            health: Player.health,
            weapons: Inventory.weapons,
            items: Inventory.items
        };

        localStorage.setItem(
            this.key,
            JSON.stringify(data)
        );

        console.log("Game saved.");
    },

    loadGame() {

        const raw =
            localStorage.getItem(this.key);

        if (!raw) {
            console.log("No save found.");
            return false;
        }

        try {

            const data = JSON.parse(raw);

            Missions.currentMission =
                data.mission || 0;

            Player.health =
                data.health ?? 100;

            Inventory.weapons =
                data.weapons || ["pistol"];

            Inventory.items =
                data.items || [];

            UI.updateHealth(Player.health);
            Missions.updateObjective();

            console.log("Game loaded.");

            return true;

        } catch (error) {

            console.error(
                "Save data could not be loaded.",
                error
            );

            return false;
        }
    },

    deleteSave() {

        localStorage.removeItem(this.key);

        console.log("Save deleted.");
    }
};
