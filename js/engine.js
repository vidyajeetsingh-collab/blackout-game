// PROJECT: BLACKOUT
// WebGL Engine

const Engine = {

    canvas: null,
    gl: null,

    init() {

        this.canvas =
            document.getElementById("gameCanvas");

        if (!this.canvas) {
            alert("Game canvas not found.");
            return false;
        }

        // Use WebGL first for maximum mobile compatibility.
        this.gl =
            this.canvas.getContext("webgl", {
                antialias: true,
                alpha: false,
                depth: true
            }) ||
            this.canvas.getContext("experimental-webgl", {
                antialias: true,
                alpha: false,
                depth: true
            }) ||
            this.canvas.getContext("webgl2", {
                antialias: true,
                alpha: false,
                depth: true
            });

        if (!this.gl) {

            alert(
                "WebGL is not supported on this device."
            );

            return false;
        }

        this.resize();

        window.addEventListener(
            "resize",
            () => this.resize()
        );

        this.gl.enable(
            this.gl.DEPTH_TEST
        );

        this.gl.depthFunc(
            this.gl.LEQUAL
        );

        this.gl.clearColor(
            0.03,
            0.05,
            0.08,
            1.0
        );

        console.log(
            "BLACKOUT WebGL Engine initialized."
        );

        console.log(
            "WebGL version:",
            this.gl.getParameter(
                this.gl.VERSION
            )
        );

        return true;
    },

    resize() {

        if (!this.canvas || !this.gl) {
            return;
        }

        const dpr =
            Math.min(
                window.devicePixelRatio || 1,
                1.5
            );

        const width =
            Math.max(
                1,
                Math.floor(
                    this.canvas.clientWidth *
                    dpr
                )
            );

        const height =
            Math.max(
                1,
                Math.floor(
                    this.canvas.clientHeight *
                    dpr
                )
            );

        if (
            this.canvas.width !== width ||
            this.canvas.height !== height
        ) {

            this.canvas.width =
                width;

            this.canvas.height =
                height;
        }

        this.gl.viewport(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );
    },

    clear() {

        if (!this.gl) {
            return;
        }

        this.gl.clear(
            this.gl.COLOR_BUFFER_BIT |
            this.gl.DEPTH_BUFFER_BIT
        );
    },

    getAspectRatio() {

        if (
            !this.canvas ||
            this.canvas.height === 0
        ) {
            return 1;
        }

        return (
            this.canvas.width /
            this.canvas.height
        );
    }
};
