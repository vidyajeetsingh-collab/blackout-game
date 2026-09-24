// PROJECT: BLACKOUT
// Mission System

const Missions = {

    currentMission: 0,

    missions: [
        {
            id: 1,
            name: "BLACKOUT",
            area: "RESIDENTIAL DISTRICT",
            objective: "SURVIVE THE ENEMY ATTACK",
            completed: false
        },
        {
            id: 2,
            name: "DEAD SIGNAL",
            area: "DOWNTOWN",
            objective: "ESCAPE THE AREA",
            completed: false
        },
        {
            id: 3,
            name: "GHOST GRID",
            area: "COMMERCIAL DISTRICT",
            objective: "SURVIVE THE ENEMY ATTACK",
            completed: false
        },
        {
            id: 4,
            name: "IRON VEIL",
            area: "INDUSTRIAL DISTRICT",
            objective: "ESCAPE THE AREA",
            completed: false
        },
        {
            id: 5,
            name: "LAST TRANSMISSION",
            area: "UNDERGROUND COMPLEX",
            objective: "SURVIVE THE ENEMY ATTACK",
            completed: false
        }
    ],

    init() {
        this.currentMission = 0;

        console.log(
            "Mission system initialized."
        );

        this.updateObjective();
    },

    getCurrent() {
        return this.missions[
            this.currentMission
        ];
    },

    startMission(index) {

        if (
            index < 0 ||
            index >= this.missions.length
        ) {
            return;
        }

        this.currentMission = index;

        const mission = this.getCurrent();

        console.log(
            "Starting Mission " +
            mission.id +
            ": " +
            mission.name
        );

        this.updateObjective();

        if (typeof Enemies !== "undefined") {
            Enemies.clear();
        }

        this.spawnMissionEnemies();
    },

    spawnMissionEnemies() {

        if (typeof Enemies === "undefined") {
            return;
        }

        const count =
            3 + this.currentMission * 2;

        for (let i = 0; i < count; i++) {

            const type =
                i % 2 === 0
                    ? "surveillanceDrone"
                    : "combatDrone";

            Enemies.spawn(
                type,
                (Math.random() - 0.5) * 40,
                3 + Math.random() * 8,
                (Math.random() - 0.5) * 40
            );
        }
    },

    updateObjective() {

        const mission = this.getCurrent();

        if (
            mission &&
            typeof UI !== "undefined"
        ) {
            UI.updateObjective(
                mission.objective
            );
        }
    },

    completeMission() {

        const mission = this.getCurrent();

        if (!mission) {
            return;
        }

        mission.completed = true;

        console.log(
            "MISSION COMPLETE:",
            mission.name
        );

        Save.saveGame();
    },

    playerDied() {

        console.log(
            "MISSION FAILED — RESTARTING"
        );

        // The complete restart system
        // will be connected later.
        this.startMission(
            this.currentMission
        );
    }
};
