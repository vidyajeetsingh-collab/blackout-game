// =========================================
// PROJECT: BLACKOUT
// Third-Person Camera + Mobile Swipe
// Settings Sensitivity Integration
// =========================================

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

    // Original camera sensitivity.
    sensitivity: 0.006,

    touch: {
        active: false,
        x: 0,
        y: 0
    },

    init() {

        this.followPlayer();
        this.setupTouchCamera();

        console.log(
            "Third-person camera initialized."
        );
    },

    // Get sensitivity from the Settings menu.
    // 50% = original camera speed.
    getSensitivity() {

        if (
            typeof Settings !== "undefined" &&
            Settings.values &&
            Number.isFinite(
                Number(Settings.values.sensitivity)
            )
        ) {

            const setting = Math.max(
                10,
                Math.min(
                    100,
                    Number(Settings.values.sensitivity)
                )
            );

            return this.sensitivity * (setting / 50);
        }

        // Safe fallback if settings aren't available.
        return this.sensitivity;
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

        this.target.x =
            Player.position.x;

        this.target.y =
            Player.position.y + 1.4;

        this.target.z =
            Player.position.z;
    },

    rotate(deltaX, deltaY) {

        const sensitivity =
            this.getSensitivity();

        this.yaw -=
            deltaX * sensitivity;

        this.pitch -=
            deltaY * sensitivity;

        this.pitch = Math.max(
            -0.9,
            Math.min(0.5, this.pitch)
        );

        this.followPlayer();
    },

    setupTouchCamera() {

        const canvas =
            document.getElementById("gameCanvas");

        if (!canvas) return;

        let active = false;
        let lastX = 0;
        let lastY = 0;
        let pointerId = null;

        canvas.addEventListener(
            "pointerdown",
            (event) => {

                // Ignore touches that begin
                // on the movement joystick.
                const joystick =
                    document.getElementById(
                        "movementJoystick"
                    );

                if (
                    joystick &&
                    joystick.contains(event.target)
                ) {
                    return;
                }

                active = true;

                pointerId = event.pointerId;

                lastX = event.clientX;
                lastY = event.clientY;

                canvas.setPointerCapture(
                    pointerId
                );
            }
        );

        canvas.addEventListener(
            "pointermove",
            (event) => {

                if (
                    !active ||
                    event.pointerId !== pointerId
                ) {
                    return;
                }

                const deltaX =
                    event.clientX - lastX;

                const deltaY =
                    event.clientY - lastY;

                this.rotate(
                    deltaX,
                    deltaY
                );

                lastX = event.clientX;
                lastY = event.clientY;
            }
        );

        const stopTouch = (event) => {

            if (
                pointerId !== null &&
                event.pointerId !== undefined &&
                event.pointerId !== pointerId
            ) {
                return;
            }

            active = false;
            pointerId = null;
        };

        canvas.addEventListener(
            "pointerup",
            stopTouch
        );

        canvas.addEventListener(
            "pointercancel",
            stopTouch
        );

        canvas.addEventListener(
            "lostpointercapture",
            stopTouch
        );
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