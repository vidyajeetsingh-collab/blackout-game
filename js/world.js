
// PROJECT: BLACKOUT
// World System

const World = {

    areas: [
        {
            id: "residential",
            name: "RESIDENTIAL DISTRICT",
            unlocked: true
        },
        {
            id: "downtown",
            name: "DOWNTOWN",
            unlocked: false
        },
        {
            id: "industrial",
            name: "INDUSTRIAL DISTRICT",
            unlocked: false
        },
        {
            id: "underground",
            name: "UNDERGROUND COMPLEX",
            unlocked: false
        }
    ],

    cars: [],

    init() {

        this.cars = [];

        // Initial abandoned/usable cars.
        this.spawnCars();

        console.log(
            "BLACKOUT world initialized."
        );
    },

    spawnCars() {

        const positions = [
            [-12, 0, -8],
            [8, 0, -15],
            [18, 0, 12],
            [-20, 0, 18]
        ];

        for (const position of positions) {

            if (typeof Vehicles !== "undefined") {

                const car = Vehicles.spawn(
                    position[0],
                    position[1],
                    position[2]
                );

                this.cars.push(car);
            }
        }
    },

    unlockArea(id) {

        const area = this.areas.find(
            item => item.id === id
        );

        if (area) {
            area.unlocked = true;
        }
    },

    isAreaUnlocked(id) {

        const area = this.areas.find(
            item => item.id === id
        );

        return area
            ? area.unlocked
            : false;
    },

    update(deltaTime) {

        // World streaming and 3D city
        // generation will be added here.
    },

    reset() {

        this.cars = [];

        this.spawnCars();
    }
};
