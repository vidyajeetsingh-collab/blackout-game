// PROJECT: BLACKOUT
// WebGL 3D Renderer

const Renderer = {

    gl: null,

    program: null,

    positionBuffer: null,

    colorBuffer: null,

    aPosition: null,
    aColor: null,

    uProjection: null,
    uView: null,
    uModel: null,

    // =========================================
    // INITIALIZE
    // =========================================

    init() {

        this.gl = Engine.gl;

        if (!this.gl) {
            throw new Error("WebGL context not found.");
        }

        const vertexShaderSource = `
            attribute vec3 aPosition;
            attribute vec3 aColor;

            uniform mat4 uProjection;
            uniform mat4 uView;
            uniform mat4 uModel;

            varying vec3 vColor;

            void main() {

                gl_Position =
                    uProjection *
                    uView *
                    uModel *
                    vec4(aPosition, 1.0);

                vColor = aColor;
            }
        `;

        const fragmentShaderSource = `
            precision mediump float;

            varying vec3 vColor;

            void main() {

                gl_FragColor =
                    vec4(vColor, 1.0);
            }
        `;

        const vertexShader =
            this.createShader(
                this.gl.VERTEX_SHADER,
                vertexShaderSource
            );

        const fragmentShader =
            this.createShader(
                this.gl.FRAGMENT_SHADER,
                fragmentShaderSource
            );

        this.program =
            this.createProgram(
                vertexShader,
                fragmentShader
            );

        this.aPosition =
            this.gl.getAttribLocation(
                this.program,
                "aPosition"
            );

        this.aColor =
            this.gl.getAttribLocation(
                this.program,
                "aColor"
            );

        this.uProjection =
            this.gl.getUniformLocation(
                this.program,
                "uProjection"
            );

        this.uView =
            this.gl.getUniformLocation(
                this.program,
                "uView"
            );

        this.uModel =
            this.gl.getUniformLocation(
                this.program,
                "uModel"
            );

        this.positionBuffer =
            this.gl.createBuffer();

        this.colorBuffer =
            this.gl.createBuffer();

        console.log(
            "BLACKOUT Renderer initialized."
        );
    },

    // =========================================
    // SHADERS
    // =========================================

    createShader(type, source) {

        const shader =
            this.gl.createShader(type);

        this.gl.shaderSource(
            shader,
            source
        );

        this.gl.compileShader(
            shader
        );

        if (
            !this.gl.getShaderParameter(
                shader,
                this.gl.COMPILE_STATUS
            )
        ) {

            const error =
                this.gl.getShaderInfoLog(
                    shader
                );

            this.gl.deleteShader(shader);

            throw new Error(
                "Shader error: " + error
            );
        }

        return shader;
    },

    createProgram(
        vertexShader,
        fragmentShader
    ) {

        const program =
            this.gl.createProgram();

        this.gl.attachShader(
            program,
            vertexShader
        );

        this.gl.attachShader(
            program,
            fragmentShader
        );

        this.gl.linkProgram(
            program
        );

        if (
            !this.gl.getProgramParameter(
                program,
                this.gl.LINK_STATUS
            )
        ) {

            throw new Error(
                "Program link error: " +
                this.gl.getProgramInfoLog(
                    program
                )
            );
        }

        return program;
    },

    // =========================================
    // MATRIX FUNCTIONS
    // =========================================

    perspective(
        fov,
        aspect,
        near,
        far
    ) {

        const f =
            1 /
            Math.tan(fov / 2);

        const nf =
            1 /
            (near - far);

        return new Float32Array([

            f / aspect, 0, 0, 0,

            0, f, 0, 0,

            0, 0,
            (far + near) * nf,
            -1,

            0, 0,
            (2 * far * near) * nf,
            0
        ]);
    },

    lookAt(
        eye,
        target,
        up
    ) {

        let zx =
            eye[0] - target[0];

        let zy =
            eye[1] - target[1];

        let zz =
            eye[2] - target[2];

        let length =
            Math.hypot(
                zx,
                zy,
                zz
            );

        zx /= length;
        zy /= length;
        zz /= length;

        let xx =
            up[1] * zz -
            up[2] * zy;

        let xy =
            up[2] * zx -
            up[0] * zz;

        let xz =
            up[0] * zy -
            up[1] * zx;

        length =
            Math.hypot(
                xx,
                xy,
                xz
            );

        xx /= length;
        xy /= length;
        xz /= length;

        const yx =
            zy * xz -
            zz * xy;

        const yy =
            zz * xx -
            zx * xz;

        const yz =
            zx * xy -
            zy * xx;

        return new Float32Array([

            xx, yx, zx, 0,
            xy, yy, zy, 0,
            xz, yz, zz, 0,

            -(
                xx * eye[0] +
                xy * eye[1] +
                xz * eye[2]
            ),

            -(
                yx * eye[0] +
                yy * eye[1] +
                yz * eye[2]
            ),

            -(
                zx * eye[0] +
                zy * eye[1] +
                zz * eye[2]
            ),

            1
        ]);
    },

    // =========================================
    // MODEL MATRIX
    // =========================================

    modelMatrix(
        x,
        y,
        z,
        sx,
        sy,
        sz
    ) {

        return new Float32Array([

            sx, 0, 0, 0,
            0, sy, 0, 0,
            0, 0, sz, 0,

            x, y, z, 1
        ]);
    },

    // =========================================
    // CUBE
    // =========================================

    cubeVertices() {

        return [

            // Front
            -0.5, -0.5,  0.5,
             0.5, -0.5,  0.5,
             0.5,  0.5,  0.5,

            -0.5, -0.5,  0.5,
             0.5,  0.5,  0.5,
            -0.5,  0.5,  0.5,

            // Back
             0.5, -0.5, -0.5,
            -0.5, -0.5, -0.5,
            -0.5,  0.5, -0.5,

             0.5, -0.5, -0.5,
            -0.5,  0.5, -0.5,
             0.5,  0.5, -0.5,

            // Left
            -0.5, -0.5, -0.5,
            -0.5, -0.5,  0.5,
            -0.5,  0.5,  0.5,

            -0.5, -0.5, -0.5,
            -0.5,  0.5,  0.5,
            -0.5,  0.5, -0.5,

            // Right
             0.5, -0.5,  0.5,
             0.5, -0.5, -0.5,
             0.5,  0.5, -0.5,

             0.5, -0.5,  0.5,
             0.5,  0.5, -0.5,
             0.5,  0.5,  0.5,

            // Top
            -0.5,  0.5,  0.5,
             0.5,  0.5,  0.5,
             0.5,  0.5, -0.5,

            -0.5,  0.5,  0.5,
             0.5,  0.5, -0.5,
            -0.5,  0.5, -0.5,

            // Bottom
            -0.5, -0.5, -0.5,
             0.5, -0.5, -0.5,
             0.5, -0.5,  0.5,

            -0.5, -0.5, -0.5,
             0.5, -0.5,  0.5,
            -0.5, -0.5,  0.5
        ];
    },

    // =========================================
    // DRAW CUBE
    // =========================================

    drawCube(
        x,
        y,
        z,
        sx,
        sy,
        sz,
        color
    ) {

        const gl = this.gl;

        const vertices =
            this.cubeVertices();

        const colors = [];

        for (
            let i = 0;
            i < vertices.length / 3;
            i++
        ) {

            colors.push(
                color[0],
                color[1],
                color[2]
            );
        }

        gl.bindBuffer(
            gl.ARRAY_BUFFER,
            this.positionBuffer
        );

        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(vertices),
            gl.STATIC_DRAW
        );

        gl.enableVertexAttribArray(
            this.aPosition
        );

        gl.vertexAttribPointer(
            this.aPosition,
            3,
            gl.FLOAT,
            false,
            0,
            0
        );

        gl.bindBuffer(
            gl.ARRAY_BUFFER,
            this.colorBuffer
        );

        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(colors),
            gl.STATIC_DRAW
        );

        gl.enableVertexAttribArray(
            this.aColor
        );

        gl.vertexAttribPointer(
            this.aColor,
            3,
            gl.FLOAT,
            false,
            0,
            0
        );

        const model =
            this.modelMatrix(
                x,
                y,
                z,
                sx,
                sy,
                sz
            );

        gl.uniformMatrix4fv(
            this.uModel,
            false,
            model
        );

        gl.drawArrays(
            gl.TRIANGLES,
            0,
            36
        );
    },

    // =========================================
    // RENDER
    // =========================================

    render(
        cameraPosition,
        cameraTarget
    ) {

        const gl = this.gl;

        if (!gl) {
            return;
        }

        gl.useProgram(
            this.program
        );

        gl.enable(
            gl.DEPTH_TEST
        );

        gl.clearColor(
            0.025,
            0.04,
            0.055,
            1
        );

        gl.clear(
            gl.COLOR_BUFFER_BIT |
            gl.DEPTH_BUFFER_BIT
        );

        const aspect =
            Engine.getAspectRatio();

        const projection =
            this.perspective(
                Math.PI / 3,
                aspect,
                0.1,
                200
            );

        const view =
            this.lookAt(
                [
                    cameraPosition.x,
                    cameraPosition.y,
                    cameraPosition.z
                ],
                [
                    cameraTarget.x,
                    cameraTarget.y,
                    cameraTarget.z
                ],
                [0, 1, 0]
            );

        gl.uniformMatrix4fv(
            this.uProjection,
            false,
            projection
        );

        gl.uniformMatrix4fv(
            this.uView,
            false,
            view
        );

        // =====================================
        // GROUND
        // =====================================

        this.drawCube(
            0,
            -0.25,
            0,
            100,
            0.5,
            100,
            [0.035, 0.05, 0.06]
        );

        // =====================================
        // CITY BUILDINGS
        // =====================================

        const buildings = [

            [-15, 4, -18, 10, 8, 10],
            [12, 5, -20, 12, 10, 10],
            [25, 3, -5, 8, 6, 12],
            [-25, 6, 5, 10, 12, 10],
            [18, 4, 18, 14, 8, 10],
            [-12, 3, 22, 12, 6, 9]
        ];

        for (
            const building of buildings
        ) {

            this.drawCube(
                building[0],
                building[4] / 2
                building[1],
                building[3],
                building[4],
                building[5],
                [0.12, 0.14, 0.17]
            );
        }

        // =====================================
        // PLAYER
        // =====================================

        if (
            typeof Player !== "undefined"
        ) {

            this.drawCube(
                Player.position.x,
                1.0,
                Player.position.z,
                0.7,
                2.0,
                0.7,
                [0.0, 0.65, 0.9]
            );
        }

        // =====================================
        // ENEMIES
        // =====================================

        if (
            typeof Enemies !== "undefined" &&
            typeof Enemies.getAliveEnemies === "function"
        ) {

            const enemies =
                Enemies.getAliveEnemies();

            for (
                const enemy of enemies
            ) {

                // Enemy body
                this.drawCube(
                    enemy.x,
                    1.0,
                    enemy.z,
                    0.8,
                    2.0,
                    0.8,
                    [0.85, 0.08, 0.08]
                );

                // Enemy head
                this.drawCube(
                    enemy.x,
                    2.25,
                    enemy.z,
                    0.55,
                    0.55,
                    0.55,
                    [0.25, 0.03, 0.03]
                );

                // Health bar
                const healthRatio =
                    Math.max(
                        0,
                        enemy.health /
                        enemy.maxHealth
                    );

                this.drawCube(
                    enemy.x,
                    2.75,
                    enemy.z,
                    1.0 * healthRatio,
                    0.10,
                    0.12,
                    [0.1, 1.0, 0.2]
                );
            }
        }
    }
};