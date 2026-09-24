// PROJECT: BLACKOUT
// Mission System

const Missions = {

    current: 0,

    completed: [],

    data: [
        {
            id: 1,
            name: "BLACKOUT",
            area: "RESIDENTIAL",
            objective: "SURVIVE THE ENEMY ATTACK",
            reward: "ASSAULT RIFLE"
        },
        {
            id: 2,
            name: "DEAD SIGNAL",
            area: "DOWNTOWN",
            objective: "ESCAPE THE AREA",
            reward: "SMG"
        },
        {
            id: 3,
            name: "GHOST GRID",
            area: "COMMERCIAL",
            objective: "SURVIVE THE ENEMY ATTACK",
            reward: "SHOTGUN"
        },
        {
            id: 4,
            name: "IRON VEIL",
            area: "INDUSTRIAL",
            objective: "ESCAPE THE AREA",
            reward: "SNIPER RIFLE"
        },
        {
            id: 5,
            name: "LAST TRANSMISSION",
            area: "UNDERGROUND",
            objective: "SURVIVE THE ENEMY ATTACK",
            reward: "PISTOL + AMMO"
        }
    ],

    active: false,

    init() {

        this.current = 0;
        this.active = false;

        console.log(
            "Mission system initialized."
        );

        this.updateObjective();
    },

    getCurrent() {

        return this.data[this.current];
    },

    startMission(index = 0) {

        if (
            index < 0 ||
            index >= this.data.length
        ) {
            return;
        }

        this.current = index;
        this.active = true;

        const mission =
            this.getCurrent();

        console.log(
            "Starting mission:",
            mission.name
        );

        if (
            typeof Player !== "undefined"
        ) {
            Player.reset();
        }

        if (
            typeof Enemies !== "undefined"
        ) {
            Enemies.spawnMissionEnemies(
                mission.id
            );
        }

        if (
            typeof Vehicles !== "undefined"
        ) {
            Vehicles.spawnCityVehicles();
        }

        if (
            typeof World !== "undefined" &&
            typeof World.updateArea === "function"
        ) {
            World.updateArea(
                mission.area
            );
        }

        this.updateObjective();
    },

    updateObjective() {

        const mission =
            this.getCurrent();

        if (!mission) {
            return;
        }

        if (
            typeof UI !== "undefined" &&
            typeof UI.updateObjective === "function"
        ) {
            UI.updateObjective(
                "MISSION " +
                mission.id +
                ": " +
                mission.objective
            );
        }
    },

    completeMission() {

        if (!this.active) {
            return;
        }

        const mission =
            this.getCurrent();

        if (
            !this.completed.includes(
                mission.id
            )
        ) {
            this.completed.push(
                mission.id
            );
        }

        this.active = false;

        this.giveReward();

        console.log(
            "MISSION COMPLETE:",
            mission.name
        );

        if (
            typeof Save !== "undefined" &&
            typeof Save.saveGame === "function"
        ) {
            Save.saveGame();
        }
    },

    giveReward() {

        const mission =
            this.getCurrent();

        if (!mission) {
            return;
        }

        if (
            typeof Inventory === "undefined"
        ) {
            return;
        }

        const rewards = {
            1: "ASSAULT RIFLE",
            2: "SMG",
            3: "SHOTGUN",
            4: "SNIPER RIFLE",
            5: "PISTOL"
        };

        const weaponName =
            rewards[mission.id];

        if (
            typeof Inventory.addWeapon ===
            "function"
        ) {
            Inventory.addWeapon(
                weaponName
            );
        }

        if (
            typeof Weapons !== "undefined" &&
            typeof Weapons.addAmmo ===
            "function"
        ) {
            Weapons.addAmmo(30);
        }

        if (
            typeof Player !== "undefined" &&
            typeof Player.heal === "function"
        ) {
            Player.heal(25);
        }
    },

    playerDied() {

        console.log(
            "PLAYER DIED — RESTARTING MISSION"
        );

        this.active = false;

        this.restartMission();
    },

    restartMission() {

        const missionIndex =
            this.current;

        this.startMission(
            missionIndex
        );
    },

    nextMission() {

        if (
            this.current >=
            this.data.length - 1
        ) {
            console.log(
                "CAMPAIGN COMPLETE"
            );

            this.active = false;
            return;
        }

        this.startMission(
            this.current + 1
        );
    },

    isCompleted(index) {

        const mission =
            this.data[index];

        if (!mission) {
            return false;
        }

        return this.completed.includes(
            mission.id
        );
    },

    resetProgress() {

        this.current = 0;
        this.completed = [];
        this.active = false;
    }
};
