// PROJECT: BLACKOUT
// WebGL Diagnostic Renderer

const Renderer = {

    gl: null,

    init() {

        this.gl = Engine.gl;

        console.log("RENDERER TEST INIT");

        if (!this.gl) {
            console.error("NO WEBGL CONTEXT");
            return;
        }

        console.log(
            "WEBGL:",
            this.gl.getParameter(
                this.gl.VERSION
            )
        );
    },

    render() {

        if (!this.gl) {
            return;
        }

        this.gl.viewport(
            0,
            0,
            this.gl.drawingBufferWidth,
            this.gl.drawingBufferHeight
        );

        this.gl.clearColor(
            0.8,
            0.05,
            0.05,
            1.0
        );

        this.gl.clear(
            this.gl.COLOR_BUFFER_BIT |
            this.gl.DEPTH_BUFFER_BIT
        );
    }
};
