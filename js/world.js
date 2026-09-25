// PROJECT: BLACKOUT
// World System
// City Layout + Roads + Zones + Environment

const World = {

    initialized: false,

    citySize: 90,

    zones: [],

    roads: [],

    buildings: [],

    props: [],

    missionPoints: [],

    timeOfDay: 18.5,

    daySpeed: 0.015,

    init() {

        this.initialized = false;

        this.zones = [];
        this.roads = [];
        this.buildings = [];
        this.props = [];
        this.missionPoints = [];

        this.createZones();
        this.createRoads();
        this.createBuildings();
        this.createProps();
        this.createMissionPoints();

        this.initialized = true;

        console.log(
            "BLACKOUT World initialized."
        );

        console.log(
            "Buildings:",
            this.buildings.length
        );

        console.log(
            "Roads:",
            this.roads.length
        );
    },

    createZones() {

        this.zones = [

            {
                id: 0,
                name: "RESIDENTIAL DISTRICT",
                x: -22,
                z: -22,
                width: 36,
                depth: 36
            },

            {
                id: 1,
                name: "DOWNTOWN",
                x: 20,
                z: -20,
                width: 36,
                depth: 36
            },

            {
                id: 2,
                name: "INDUSTRIAL ZONE",
                x: 20,
                z: 22,
                width: 36,
                depth: 30
            },

            {
                id: 3,
                name: "SUBWAY COMPLEX",
                x: -25,
                z: 25,
                width: 30,
                depth: 26
            },

            {
                id: 4,
                name: "CITY CENTER",
                x: 0,
                z: 0,
                width: 18,
                depth: 18
            }
        ];
    },

    createRoads() {

        this.roads = [

            {
                x: 0,
                z: 0,
                width: 7,
                depth: 90,
                rotation: 0
            },

            {
                x: 0,
                z: 0,
                width: 90,
                depth: 7,
                rotation: 0
            },

            {
                x: -22,
                z: 0,
                width: 5,
                depth: 90,
                rotation: 0
            },

            {
                x: 22,
                z: 0,
                width: 5,
                depth: 90,
                rotation: 0
            },

            {
                x: 0,
                z: -22,
                width: 90,
                depth: 5,
                rotation: 0
            },

            {
                x: 0,
                z: 22,
                width: 90,
                depth: 5,
                rotation: 0
            }
        ];
    },

    createBuildings() {

        this.buildings = [];

        /*
         * Residential buildings
         */

        this.addBuilding(
            -34,
            -34,
            7,
            5,
            4
        );

        this.addBuilding(
            -24,
            -34,
            8,
            6,
            5
        );

        this.addBuilding(
            -12,
            -34,
            6,
            7,
            3
        );

        this.addBuilding(
            -34,
            -24,
            6,
            7,
            4
        );

        this.addBuilding(
            -12,
            -24,
            8,
            6,
            5
        );

        this.addBuilding(
            -34,
            -12,
            8,
            6,
            3
        );

        this.addBuilding(
            -24,
            -12,
            6,
            7,
            4
        );

        this.addBuilding(
            -12,
            -12,
            7,
            6,
            3
        );

        /*
         * Downtown buildings
         */

        this.addBuilding(
            12,
            -34,
            8,
            8,
            8
        );

        this.addBuilding(
            26,
            -34,
            7,
            8,
            10
        );

        this.addBuilding(
            36,
            -34,
            6,
            8,
            6
        );

        this.addBuilding(
            12,
            -22,
            8,
            7,
            12
        );

        this.addBuilding(
            26,
            -22,
            8,
            7,
            9
        );

        this.addBuilding(
            37,
            -22,
            5,
            7,
            7
        );

        /*
         * Industrial zone
         */

        this.addBuilding(
            12,
            12,
            12,
            8,
            5
        );

        this.addBuilding(
            30,
            12,
            12,
            8,
            6
        );

        this.addBuilding(
            12,
            27,
            9,
            10,
            4
        );

        this.addBuilding(
            29,
            27,
            13,
            9,
            5
        );

        /*
         * Subway / underground entrance area
         */

        this.addBuilding(
            -34,
            12,
            7,
            8,
            3
        );

        this.addBuilding(
            -22,
            12,
            8,
            7,
            4
        );

        this.addBuilding(
            -34,
            28,
            8,
            7,
            3
        );

        this.addBuilding(
            -20,
            29,
            9,
            6,
            4
        );

        /*
         * City center structures
         */

        this.addBuilding(
            8,
            8,
            6,
            6,
            6
        );

        this.addBuilding(
            -8,
            8,
            6,
            6,
            5
        );

        this.addBuilding(
            8,
            -8,
            6,
            6,
            5
        );

        this.addBuilding(
            -8,
            -8,
            6,
            6,
            4
        );
    },

    addBuilding(
        x,
        z,
        width,
        depth,
        height
    ) {

        this.buildings.push({

            id:
                this.buildings.length,

            x,
            y:
                height / 2,

            z,

            width,
            depth,
            height,

            type:
                height >= 8
                    ? "HIGHRISE"
                    : height >= 5
                        ? "BUILDING"
                        : "LOW_BUILDING"
        });
    },

    createProps() {

        this.props = [];

        /*
         * Street lights
         */

        const lightPositions = [

            [-5, -30],
            [5, -30],
            [-5, -15],
            [5, -15],

            [-30, -5],
            [-15, -5],
            [15, -5],
            [30, -5],

            [-30, 5],
            [-15, 5],
            [15, 5],
            [30, 5],

            [-5, 15],
            [5, 15],
            [-5, 30],
            [5, 30]
        ];

        lightPositions.forEach(
            position => {

                this.props.push({

                    type: "STREET_LIGHT",

                    x:
                        position[0],

                    y: 0,

                    z:
                        position[1]
                });
            }
        );

        /*
         * Barriers
         */

        const barrierPositions = [

            [-18, 3],
            [18, 3],
            [-3, 18],
            [3, 18],
            [-18, -3],
            [18, -3]
        ];

        barrierPositions.forEach(
            position => {

                this.props.push({

                    type: "BARRIER",

                    x:
                        position[0],

                    y: 0,

                    z:
                        position[1]
                });
            }
        );

        /*
         * Trees
         */

        const treePositions = [

            [-38, -8],
            [-38, 8],
            [-8, -38],
            [8, -38],

            [38, -8],
            [38, 8],
            [-8, 38],
            [8, 38],

            [-38, 34],
            [34, 38]
        ];

        treePositions.forEach(
            position => {

                this.props.push({

                    type: "TREE",

                    x:
                        position[0],

                    y: 0,

                    z:
                        position[1]
                });
            }
        );
    },

    createMissionPoints() {

        this.missionPoints = [

            {
                id: 0,
                name: "SAFE ZONE",
                x: 35,
                z: 35
            },

            {
                id: 1,
                name: "SIGNAL SITE",
                x: 0,
                z: -25
            },

            {
                id: 2,
                name: "INDUSTRIAL ZONE",
                x: 28,
                z: 25
            },

            {
                id: 3,
                name: "UNDERGROUND",
                x: -30,
                z: 30
            },

            {
                id: 4,
                name: "NETWORK TOWER",
                x: 0,
                z: 0
            }
        ];
    },

    update(deltaTime) {

        if (!this.initialized) {
            return;
        }

        /*
         * Slow day/night cycle.
         */

        this.timeOfDay +=
            this.daySpeed *
            deltaTime;

        if (
            this.timeOfDay >= 24
        ) {

            this.timeOfDay -= 24;
        }
    },

    isNight() {

        return (
            this.timeOfDay >= 19 ||
            this.timeOfDay < 6
        );
    },

    getZoneAt(
        x,
        z
    ) {

        for (
            const zone of this.zones
        ) {

            const insideX =
                Math.abs(
                    x - zone.x
                ) <=
                zone.width / 2;

            const insideZ =
                Math.abs(
                    z - zone.z
                ) <=
                zone.depth / 2;

            if (
                insideX &&
                insideZ
            ) {

                return zone;
            }
        }

        return null;
    },

    getMissionPoint(
        id
    ) {

        return (
            this.missionPoints.find(
                point =>
                    point.id === id
            ) || null
        );
    },

    getBuildings() {

        return this.buildings;
    },

    getRoads() {

        return this.roads;
    },

    getProps() {

        return this.props;
    },

    getZones() {

        return this.zones;
    },

    getMissionPoints() {

        return this.missionPoints;
    },

    reset() {

        this.init();
    }
};