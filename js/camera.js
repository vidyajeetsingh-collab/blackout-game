// PROJECT: BLACKOUT
// Third-Person Camera

const Camera = {
    position: {
        x: 0,
        y: 2.8,
        z: 6
    },

    target: {
        x: 0,
        y: 1.4,
        z: 0
    },

    distance: 6,
    height: 2.8,

    yaw: 0,
    pitch: -0.15,

    sensitivity: 0.005,

    init() {
        this.followPlayer();

        console.log("Third-person camera initialized.");
    },

    followPlayer() {
        const yaw = this.yaw;

        this.position.x =
            Player.position.x -
            Math.sin(yaw) * this.distance;

        this.position.z =
            Player.position.z -
            Math.cos(yaw) * this.distance;

        this.position.y =
            Player.position.y + this.height;

        this.target.x = Player.position.x;
        this.target.y = Player.position.y + 1.4;
        this.target.z = Player.position.z;
    },

    rotate(deltaX, deltaY) {
        this.yaw -= deltaX * this.sensitivity;
        this.pitch -= deltaY * this.sensitivity;

        // Prevent extreme vertical camera angles.
        this.pitch = Math.max(
            -0.9,
            Math.min(0.5, this.pitch)
        );

        this.followPlayer();
    },

    update() {
        this.followPlayer();
    },

    reset() {
        this.yaw = 0;
        this.pitch = -0.15;

        this.followPlayer();
    }
};
