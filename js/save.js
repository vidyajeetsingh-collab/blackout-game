// PROJECT: BLACKOUT
// Local Save System

const Save = {

    storageKey: "PROJECT_BLACKOUT_SAVE",

    saveData: null,

    init() {

        this.saveData = null;

        console.log(
            "BLACKOUT Save system initialized."
        );
    },

    hasSave() {

        try {

            return (
                localStorage.getItem(
                    this.storageKey
                ) !== null
            );

        } catch (error) {

            console.error(
                "Save check failed:",
                error
            );

            return false;
        }
    },

    saveGame() {

        try {

            const data = {

                version: 1,

                timestamp:
                    Date.now(),

                player: this.getPlayerData(),

                weapons:
                    this.getWeaponsData(),

                inventory:
                    this.getInventoryData(),

                missions:
                    this.getMissionData(),

                vehicles:
                    this.getVehicleData()
            };

            localStorage.setItem(
                this.storageKey,
                JSON.stringify(data)
            );

            this.saveData = data;

            console.log(
                "GAME SAVED."
            );

            return true;

        } catch (error) {

            console.error(
                "GAME SAVE FAILED:",
                error
            );

            return false;
        }
    },

    loadGame() {

        try {

            const raw =
                localStorage.getItem(
                    this.storageKey
                );

            if (!raw) {

                this.saveData = null;

                console.log(
                    "NO SAVE DATA FOUND."
                );

                return false;
            }

            const data =
                JSON.parse(raw);

            if (!data) {
                return false;
            }

            this.saveData = data;

            this.applyPlayerData(
                data.player
            );

            this.applyWeaponsData(
                data.weapons
            );

            this.applyInventoryData(
                data.inventory
            );

            this.applyMissionData(
                data.missions
            );

            this.applyVehicleData(
                data.vehicles
            );

            console.log(
                "GAME SAVE LOADED."
            );

            return true;

        } catch (error) {

            console.error(
                "GAME LOAD FAILED:",
                error
            );

            this.saveData = null;

            return false;
        }
    },

    getPlayerData() {

        if (
            typeof Player ===
            "undefined"
        ) {
            return null;
        }

        return {

            x:
                Player.position.x,

            y:
                Player.position.y,

            z:
                Player.position.z,

            health:
                Player.health,

            crouching:
                Player.isCrouching,

            running:
                Player.isRunning
        };
    },

    applyPlayerData(data) {

        if (
            !data ||
            typeof Player ===
            "undefined"
        ) {
            return;
        }

        if (
            typeof data.x ===
            "number"
        ) {

            Player.position.x =
                data.x;
        }

        if (
            typeof data.y ===
            "number"
        ) {

            Player.position.y =
                data.y;
        }

        if (
            typeof data.z ===
            "number"
        ) {

            Player.position.z =
                data.z;
        }

        if (
            typeof data.health ===
            "number"
        ) {

            Player.health =
                Math.max(
                    0,
                    Math.min(
                        100,
                        data.health
                    )
                );
        }

        Player.isCrouching =
            data.crouching === true;

        Player.isRunning =
            data.running === true;

        if (
            typeof UI !==
                "undefined" &&
            typeof UI.updateHealth ===
                "function"
        ) {

            UI.updateHealth(
                Player.health
            );
        }
    },

    getWeaponsData() {

        if (
            typeof Weapons ===
            "undefined"
        ) {
            return null;
        }

        return {

            currentIndex:
                Weapons.currentIndex,

            weapons:
                Weapons.weapons.map(
                    weapon => ({

                        name:
                            weapon.name,

                        magazine:
                            weapon.magazine,

                        ammo:
                            weapon.ammo
                    })
                )
        };
    },

    applyWeaponsData(data) {

        if (
            !data ||
            typeof Weapons ===
            "undefined"
        ) {
            return;
        }

        if (
            typeof data.currentIndex ===
            "number"
        ) {

            Weapons.currentIndex =
                Math.max(
                    0,
                    Math.min(
                        Weapons.weapons.length - 1,
                        data.currentIndex
                    )
                );
        }

        if (
            Array.isArray(
                data.weapons
            )
        ) {

            for (
                const savedWeapon
                of data.weapons
            ) {

                const weapon =
                    Weapons.weapons.find(
                        item =>
                            item.name ===
                            savedWeapon.name
                    );

                if (!weapon) {
                    continue;
                }

                if (
                    typeof savedWeapon.magazine ===
                    "number"
                ) {

                    weapon.magazine =
                        Math.max(
                            0,
                            savedWeapon.magazine
                        );
                }

                if (
                    typeof savedWeapon.ammo ===
                    "number"
                ) {

                    weapon.ammo =
                        Math.max(
                            0,
                            savedWeapon.ammo
                        );
                }
            }
        }

        if (
            typeof Weapons.updateUI ===
            "function"
        ) {

            Weapons.updateUI();
        }
    },

    getInventoryData() {

        if (
            typeof Inventory ===
            "undefined"
        ) {
            return null;
        }

        return {

            medkits:
                Inventory.medkits
        };
    },

    applyInventoryData(data) {

        if (
            !data ||
            typeof Inventory ===
            "undefined"
        ) {
            return;
        }

        if (
            typeof data.medkits ===
            "number"
        ) {

            Inventory.medkits =
                Math.max(
                    0,
                    Math.min(
                        Inventory.maxMedkits,
                        data.medkits
                    )
                );
        }

        if (
            typeof Inventory.updateUI ===
            "function"
        ) {

            Inventory.updateUI();
        }
    },

    getMissionData() {

        if (
            typeof Missions ===
            "undefined"
        ) {
            return null;
        }

        return {

            currentMission:
                Missions.currentMission,

            active:
                Missions.active,

            completed:
                Missions.completed,

            missions:
                Missions.missions.map(
                    mission => ({

                        id:
                            mission.id,

                        completed:
                            mission.completed,

                        unlocked:
                            mission.unlocked
                    })
                )
        };
    },

    applyMissionData(data) {

        if (
            !data ||
            typeof Missions ===
            "undefined"
        ) {
            return;
        }

        if (
            typeof data.currentMission ===
            "number"
        ) {

            Missions.currentMission =
                Math.max(
                    0,
                    Math.min(
                        Missions.missions.length - 1,
                        data.currentMission
                    )
                );
        }

        Missions.active =
            data.active === true;

        Missions.completed =
            data.completed === true;

        if (
            Array.isArray(
                data.missions
            )
        ) {

            for (
                const savedMission
                of data.missions
            ) {

                const mission =
                    Missions.missions.find(
                        item =>
                            item.id ===
                            savedMission.id
                    );

                if (!mission) {
                    continue;
                }

                mission.completed =
                    savedMission.completed === true;

                mission.unlocked =
                    savedMission.unlocked === true;
            }
        }

        if (
            typeof Missions.updateObjective ===
            "function"
        ) {

            Missions.updateObjective();
        }
    },

    getVehicleData() {

        if (
            typeof Vehicles ===
            "undefined"
        ) {
            return null;
        }

        return {

            vehicles:
                Vehicles.vehicles.map(
                    vehicle => ({

                        id:
                            vehicle.id,

                        x:
                            vehicle.x,

                        y:
                            vehicle.y,

                        z:
                            vehicle.z,

                        rotation:
                            vehicle.rotation,

                        speed:
                            vehicle.speed,

                        health:
                            vehicle.health,

                        fuel:
                            vehicle.fuel,

                        destroyed:
                            vehicle.destroyed
                    })
                )
        };
    },

    applyVehicleData(data) {

        if (
            !data ||
            !Array.isArray(
                data.vehicles
            ) ||
            typeof Vehicles ===
                "undefined"
        ) {
            return;
        }

        for (
            const savedVehicle
            of data.vehicles
        ) {

            const vehicle =
                Vehicles.vehicles.find(
                    item =>
                        item.id ===
                        savedVehicle.id
                );

            if (!vehicle) {
                continue;
            }

            if (
                typeof savedVehicle.x ===
                "number"
            ) {

                vehicle.x =
                    savedVehicle.x;
            }

            if (
                typeof savedVehicle.y ===
                "number"
            ) {

                vehicle.y =
                    savedVehicle.y;
            }

            if (
                typeof savedVehicle.z ===
                "number"
            ) {

                vehicle.z =
                    savedVehicle.z;
            }

            if (
                typeof savedVehicle.rotation ===
                "number"
            ) {

                vehicle.rotation =
                    savedVehicle.rotation;
            }

            if (
                typeof savedVehicle.speed ===
                "number"
            ) {

                vehicle.speed =
                    savedVehicle.speed;
            }

            if (
                typeof savedVehicle.health ===
                "number"
            ) {

                vehicle.health =
                    savedVehicle.health;
            }

            if (
                typeof savedVehicle.fuel ===
                "number"
            ) {

                vehicle.fuel =
                    savedVehicle.fuel;
            }

            vehicle.destroyed =
                savedVehicle.destroyed === true;

            vehicle.occupied =
                false;
        }

        if (
            typeof Vehicles.updateVehicleUI ===
            "function"
        ) {

            Vehicles.updateVehicleUI();
        }
    },

    deleteSave() {

        try {

            localStorage.removeItem(
                this.storageKey
            );

            this.saveData = null;

            console.log(
                "SAVE DATA DELETED."
            );

            return true;

        } catch (error) {

            console.error(
                "SAVE DELETE FAILED:",
                error
            );

            return false;
        }
    },

    resetSave() {

        this.deleteSave();

        if (
            typeof Missions !==
                "undefined" &&
            typeof Missions.reset ===
                "function"
        ) {

            Missions.reset();
        }

        if (
            typeof Player !==
                "undefined" &&
            typeof Player.reset ===
                "function"
        ) {

            Player.reset();
        }

        if (
            typeof Weapons !==
                "undefined" &&
            typeof Weapons.reset ===
                "function"
        ) {

            Weapons.reset();
        }

        if (
            typeof Inventory !==
                "undefined" &&
            typeof Inventory.reset ===
                "function"
        ) {

            Inventory.reset();
        }

        if (
            typeof Vehicles !==
                "undefined" &&
            typeof Vehicles.reset ===
                "function"
        ) {

            Vehicles.reset();
        }

        console.log(
            "BLACKOUT SAVE RESET."
        );
    }
};