// PROJECT: BLACKOUT
// World System

const World = {

    initialized: false,

    init() {

        this.initialized = true;

        console.log(
            "BLACKOUT World initialized."
        );
    },

    update(deltaTime) {

        // World update loop.
        // Kept lightweight for mobile performance.

        if (!this.initialized) {
            return;
        }

        // Future systems can be updated here:
        // buildings
        // traffic
        // lighting
        // weather
        // mission areas
        // destructible objects
    },

    reset() {

        this.initialized = false;

    }
};