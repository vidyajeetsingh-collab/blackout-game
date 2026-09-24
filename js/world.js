// PROJECT: BLACKOUT
// World + City Area System

const World = {

    areas: {
        RESIDENTIAL: {
            name: "RESIDENTIAL",
            unlocked: true
        },

        DOWNTOWN: {
            name: "DOWNTOWN",
            unlocked: false
        },

        COMMERCIAL: {
            name: "COMMERCIAL",
            unlocked: false
        },

        INDUSTRIAL: {
            name: "INDUSTRIAL",
            unlocked: false
        },

        UNDERGROUND: {
            name: "UNDERGROUND",
            unlocked: false
        }
    },

    currentArea: "RESIDENTIAL",

    init() {

        this.currentArea = "RESIDENTIAL";

        this.areas.RESIDENTIAL.unlocked = true;

        console.log(
            "World initialized."
        );
    },

    updateArea(areaName) {

        if (!this.areas[areaName]) {
            return false;
        }

        if (!this.areas[areaName].unlocked) {
            console.log(
                "Area locked:",
                areaName
            );

            return false;
        }

        this.currentArea = areaName;

        console.log(
            "Current area:",
            areaName
        );

        return true;
    },

    unlockArea(areaName) {

        if (!this.areas[areaName]) {
            return;
        }

        this.areas[areaName].unlocked = true;

        console.log(
            "Area unlocked:",
            areaName
        );
    },

    unlockMissionArea(missionNumber) {

        const order = [
            "RESIDENTIAL",
            "DOWNTOWN",
            "COMMERCIAL",
            "INDUSTRIAL",
            "UNDERGROUND"
        ];

        const index =
            missionNumber - 1;

        if (
            index >= 0 &&
            index < order.length
        ) {
            this.unlockArea(
                order[index]
            );
        }
    },

    isUnlocked(areaName) {

        return !!(
            this.areas[areaName] &&
            this.areas[areaName].unlocked
        );
    },

    getCurrentArea() {

        return this.currentArea;
    },

    getUnlockedAreas() {

        return Object.values(
            this.areas
        ).filter(
            area => area.unlocked
        );
    },

    reset() {

        for (const key in this.areas) {
            this.areas[key].unlocked =
                key === "RESIDENTIAL";
        }

        this.currentArea =
            "RESIDENTIAL";
    }
};
