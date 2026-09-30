
 // PROJECT: BLACKOUT
// Mission System — 5-Mission Campaign

const Missions = {
    missions: [
        {
            id: 0,
            name: "MISSION 01",
            title: "BLACKOUT",
            area: "RESIDENTIAL DISTRICT",
            objective: "REACH THE SAFE ZONE",
            description: "Move through the abandoned residential district and reach the extraction point.",
            reward: 100,
            completed: false,
            unlocked: true
        },
        {
            id: 1,
            name: "MISSION 02",
            title: "DEAD SIGNAL",
            area: "DOWNTOWN",
            objective: "ELIMINATE HOSTILES",
            description: "Investigate the lost communications signal and eliminate hostile units.",
            reward: 200,
            completed: false,
            unlocked: false
        },
        {
            id: 2,
            name: "MISSION 03",
            title: "IRON RAIN",
            area: "INDUSTRIAL ZONE",
            objective: "SURVIVE THE ENEMY ATTACK",
            description: "Survive the enemy assault for 60 seconds.",
            reward: 300,
            completed: false,
            unlocked: false
        },
        {
            id: 3,
            name: "MISSION 04",
            title: "UNDERGROUND",
            area: "SUBWAY COMPLEX",
            objective: "SECURE THE UNDERGROUND",
            description: "Enter the underground facility and secure the communications equipment.",
            reward: 400,
            completed: false,
            unlocked: false
        },
        {
            id: 4,
            name: "MISSION 05",
            title: "LAST TRANSMISSION",
            area: "CITY CENTER",
            objective: "RESTORE THE NETWORK",
            description: "Reach the central communications tower and restore the city's network.",
            reward: 1000,
            completed: false,
            unlocked: false
        }
    ],

    currentMission: 0,
    active: false,
    completed: false,
    initialized: false,

    survivalTimer: null,
    survivalSeconds: 60,

    init() {
        this.currentMission = 0;
        this.active = false;
        this.completed = false;
        this.clearSurvivalTimer();
        this.initialized = true;
        this.updateObjective();
        console.log("Mission system initialized.");
    },

    getCurrent() {
        return this.missions[this.currentMission];
    },

    clearSurvivalTimer() {
        if (this.survivalTimer !== null) {
            clearInterval(this.survivalTimer);
            this.survivalTimer = null;
        }
    },

    startMission(index = 0) {
        if (index < 0 || index >= this.missions.length) {
            console.error("Invalid mission:", index);
            return;
        }

        const mission = this.missions[index];

        if (!mission.unlocked) {
            console.log("Mission locked:", mission.title);
            return;
        }

        this.clearSurvivalTimer();

        this.currentMission = index;
        this.active = true;
        this.completed = false;
        this.survivalSeconds = 60;

        this.resetMissionSystems();
        this.updateObjective();

        if (mission.objective === "SURVIVE THE ENEMY ATTACK") {
            this.startSurvivalTimer();
        }

        console.log("MISSION START:", mission.name, "-", mission.title);
    },

    resetMissionSystems() {
        if (typeof Player !== "undefined" && typeof Player.reset === "function") {
            Player.reset();
        }

        if (typeof Weapons !== "undefined" && typeof Weapons.reset === "function") {
            Weapons.reset();
        }

        if (typeof Inventory !== "undefined" && typeof Inventory.reset === "function") {
            Inventory.reset();
        }

        if (typeof Enemies !== "undefined" && typeof Enemies.reset === "function") {
            Enemies.reset();
        }

        if (typeof Vehicles !== "undefined" && typeof Vehicles.reset === "function") {
            Vehicles.reset();
        }

        if (typeof Camera !== "undefined" && typeof Camera.reset === "function") {
            Camera.reset();
        }
    },

    updateObjective() {
        const mission = this.getCurrent();
        if (!mission) return;

        const objective = document.getElementById("objective");
        if (!objective) return;

        if (mission.objective === "SURVIVE THE ENEMY ATTACK") {
            objective.textContent =
                "MISSION 03: SURVIVE — " + this.survivalSeconds + " SECONDS";
        } else {
            objective.textContent =
                "MISSION " + (mission.id + 1) + ": " + mission.objective;
        }
    },

    startSurvivalTimer() {
        this.clearSurvivalTimer();

        this.survivalTimer = setInterval(() => {
            if (!this.active) {
                this.clearSurvivalTimer();
                return;
            }
        // Freeze the countdown while the game is paused.
        if (typeof UI !== "undefined" && UI.paused) {
            return;
        }

            this.survivalSeconds = Math.max(0, this.survivalSeconds - 1);
            this.updateObjective();

            if (this.survivalSeconds <= 0) {
                this.clearSurvivalTimer();
                this.completeMission();
            }
        }, 1000);
    },

    checkObjective() {
        if (!this.active) return false;

        const mission = this.getCurrent();
        if (!mission) return false;

        // Mission 01: Reach the safe zone.
        if (mission.objective === "REACH THE SAFE ZONE") {
            const distance = Math.hypot(
                Player.position.x - 35,
                Player.position.z - 35
            );

            if (distance < 5) {
                this.completeMission();
                return true;
            }
        }

        // Mission 02: Eliminate all hostiles.
        if (mission.objective === "ELIMINATE HOSTILES") {
            if (
                typeof Enemies !== "undefined" &&
                Enemies.getAliveCount() === 0
            ) {
                this.completeMission();
                return true;
            }
        }

        // Mission 03 is completed by the survival timer.
        // Mission 04: Reach the underground objective.
        if (mission.objective === "SECURE THE UNDERGROUND") {
            const distance = Math.hypot(
                Player.position.x + 30,
                Player.position.z - 30
            );

            if (distance < 6) {
                this.completeMission();
                return true;
            }
        }

        // Mission 05: Reach the network objective.
        if (mission.objective === "RESTORE THE NETWORK") {
            const distance = Math.hypot(
                Player.position.x,
                Player.position.z
            );

            if (distance < 5) {
                this.completeMission();
                return true;
            }
        }

        return false;
    },

    completeMission() {
        if (!this.active) return;

        const mission = this.getCurrent();
        if (!mission) return;

        this.clearSurvivalTimer();

        mission.completed = true;
        this.active = false;
        this.completed = true;

        console.log("MISSION COMPLETE:", mission.title);

        const nextIndex = this.currentMission + 1;

        if (nextIndex < this.missions.length) {
            this.missions[nextIndex].unlocked = true;
        }

        if (typeof Save !== "undefined" && typeof Save.saveGame === "function") {
            Save.saveGame();
        }

        this.showMissionComplete(mission);
    },

    showMissionComplete(mission) {
        const objective = document.getElementById("objective");
        if (!objective) return;

        objective.textContent =
            "MISSION COMPLETE: " + mission.title +
            " | REWARD: " + mission.reward;

        const nextIndex = this.currentMission + 1;

        if (nextIndex < this.missions.length) {
            setTimeout(() => {
                if (!this.active) {
                    this.startMission(nextIndex);
                }
            }, 2500);
        } else {
            objective.textContent =
                "CAMPAIGN COMPLETE — LAST TRANSMISSION RESTORED";
        }
    },

    playerDied() {
        this.active = false;
        this.completed = false;
        this.clearSurvivalTimer();

        const objective = document.getElementById("objective");
        if (objective) {
            objective.textContent = "MISSION FAILED — RESTARTING...";
        }

        setTimeout(() => {
            this.startMission(this.currentMission);
        }, 1800);
    },

    getMission(index) {
        if (index < 0 || index >= this.missions.length) {
            return null;
        }
        return this.missions[index];
    },

    getCurrentMissionNumber() {
        return this.currentMission + 1;
    },

    getCompletedCount() {
        return this.missions.filter(mission => mission.completed).length;
    },

    isCampaignComplete() {
        return this.getCompletedCount() === this.missions.length;
    },

    reset() {
        this.clearSurvivalTimer();

        this.currentMission = 0;
        this.active = false;
        this.completed = false;
        this.survivalSeconds = 60;

        for (let i = 0; i < this.missions.length; i++) {
            this.missions[i].completed = false;
            this.missions[i].unlocked = i === 0;
        }

        this.updateObjective();
    }
};
