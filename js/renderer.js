// PROJECT: BLACKOUT
// 3D Renderer

const Renderer = {
    gl: null,

    init() {
        this.gl = Engine.gl;

        if (!this.gl) {
            console.error("Renderer: WebGL not available.");
            return;
        }

        console.log("BLACKOUT 3D Renderer initialized.");
    },

    render() {
        if (!this.gl) return;

        Engine.clear();

        // 3D scene rendering will be added here.
        // This keeps the renderer separate from game logic.
    }
};
