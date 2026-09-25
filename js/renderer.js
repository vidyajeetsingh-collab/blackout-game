// PROJECT: BLACKOUT
// WebGL Renderer
// Tactical Soldier + City + Enemies

const Renderer = {

    program: null,

    positionBuffer: null,
    colorBuffer: null,

    viewMatrix: null,
    projectionMatrix: null,

    vertexPositionLocation: null,
    vertexColorLocation: null,

    matrixLocation: null,

    init() {

        const gl = Engine.gl;

        if (!gl) {
            console.error("WebGL context not found.");
            return;
        }

        const vertexShaderSource = `
            attribute vec3 aPosition;
            attribute vec3 aColor;

            uniform mat4 uMatrix;

            varying vec3 vColor;

            void main() {

                gl_Position =
                    uMatrix *
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
                gl.VERTEX_SHADER,
                vertexShaderSource
            );

        const fragmentShader =
            this.createShader(
                gl.FRAGMENT_SHADER,
                fragmentShaderSource
            );

        this.program =
            this.createProgram(
                vertexShader,
                fragmentShader
            );

        this.vertexPositionLocation =
            gl.getAttribLocation(
                this.program,
                "aPosition"
            );

        this.vertexColorLocation =
            gl.getAttribLocation(
                this.program,
                "aColor"
            );

        this.matrixLocation =
            gl.getUniformLocation(
                this.program,
                "uMatrix"
            );

        this.positionBuffer =
            gl.createBuffer();

        this.colorBuffer =
            gl.createBuffer();

        console.log(
            "BLACKOUT Renderer initialized."
        );
    },

    createShader(type, source) {

        const gl = Engine.gl;

        const shader =
            gl.createShader(type);

        gl.shaderSource(
            shader,
            source
        );

        gl.compileShader(shader);

        if (
            !gl.getShaderParameter(
                shader,
                gl.COMPILE_STATUS
            )
        ) {

            console.error(
                "Shader error:",
                gl.getShaderInfoLog(shader)
            );

            gl.deleteShader(shader);

            return null;
        }

        return shader;
    },

    createProgram(
        vertexShader,
        fragmentShader
    ) {

        const gl = Engine.gl;

        const program =
            gl.createProgram();

        gl.attachShader(
            program,
            vertexShader
        );

        gl.attachShader(
            program,
            fragmentShader
        );

        gl.linkProgram(program);

        if (
            !gl.getProgramParameter(
                program,
                gl.LINK_STATUS
            )
        ) {

            console.error(
                "Program error:",
                gl.getProgramInfoLog(program)
            );

            return null;
        }

        return program;
    },

    render(cameraPosition, cameraTarget) {

        const gl = Engine.gl;

        if (
            !gl ||
            !this.program
        ) {
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
            0.035,
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
                60 * Math.PI / 180,
                aspect,
                0.1,
                200
            );

        const view =
            this.lookAt(
                cameraPosition,
                cameraTarget,
                {
                    x: 0,
                    y: 1,
                    z: 0
                }
            );

        this.projectionMatrix =
            projection;

        this.viewMatrix =
            view;

        this.drawWorld();

        this.drawPlayer();

        this.drawEnemies();
    },

    drawWorld() {

        // Ground
        this.drawCube(
            0,
            -0.25,
            0,
            100,
            0.5,
            100,
            [0.08, 0.10, 0.11]
        );

        // Main roads
        this.drawCube(
            0,
            0.01,
            0,
            100,
            0.04,
            8,
            [0.035, 0.04, 0.045]
        );

        this.drawCube(
            0,
            0.02,
            0,
            8,
            0.05,
            100,
            [0.035, 0.04, 0.045]
        );

        // City buildings
        const buildings = [

            [-22, -20, 9, 10, 16, 9],
            [-8, -22, 7, 9, 12, 8],
            [8, -22, 8, 10, 20, 8],
            [23, -20, 10, 12, 15, 10],

            [-25, -5, 8, 9, 11, 8],
            [-13, -5, 7, 8, 18, 7],
            [14, -5, 8, 10, 14, 8],
            [25, -5, 8, 8, 18, 8],

            [-23, 14, 10, 11, 17, 10],
            [-9, 14, 7, 9, 12, 7],
            [10, 14, 9, 11, 21, 9],
            [25, 15, 8, 10, 13, 8],

            [-20, 27, 10, 10, 18, 9],
            [-5, 27, 8, 9, 14, 8],
            [12, 27, 9, 10, 19, 9],
            [26, 28, 8, 8, 12, 8]
        ];

        for (
            const building of buildings
        ) {

            this.drawCube(
                building[0],
                building[4] / 2,
                building[1],
                building[3],
                building[4],
                building[5],
                [0.12, 0.14, 0.17]
            );

            // Rooftop section
            this.drawCube(
                building[0],
                building[4] + 0.35,
                building[1],
                building[3] * 0.75,
                0.7,
                building[5] * 0.75,
                [0.16, 0.18, 0.21]
            );
        }

        // Street lights
        this.drawStreetLight(
            -5,
            3
        );

        this.drawStreetLight(
            5,
            -3
        );

        this.drawStreetLight(
            -30,
            8
        );

        this.drawStreetLight(
            30,
            -8
        );
    },

    drawStreetLight(x, z) {

        // Pole
        this.drawCube(
            x,
            2.2,
            z,
            0.18,
            4.4,
            0.18,
            [0.16, 0.17, 0.18]
        );

        // Lamp
        this.drawCube(
            x,
            4.45,
            z,
            0.65,
            0.25,
            0.65,
            [0.55, 0.60, 0.45]
        );
    },

    drawPlayer() {

        if (
            typeof Player === "undefined"
        ) {
            return;
        }

        const p =
            Player.position;

        const crouching =
            Player.isCrouching;

        const bodyHeight =
            crouching
                ? 1.15
                : 1.55;

        const legHeight =
            crouching
                ? 0.45
                : 0.75;

        const torsoY =
            crouching
                ? 0.95
                : 1.25;

        const headY =
            crouching
                ? 1.75
                : 2.25;

        // Legs
        this.drawCube(
            p.x - 0.22,
            legHeight / 2,
            p.z,
            0.30,
            legHeight,
            0.38,
            [0.055, 0.065, 0.075]
        );

        this.drawCube(
            p.x + 0.22,
            legHeight / 2,
            p.z,
            0.30,
            legHeight,
            0.38,
            [0.055, 0.065, 0.075]
        );

        // Boots
        this.drawCube(
            p.x - 0.22,
            0.16,
            p.z - 0.10,
            0.38,
            0.22,
            0.55,
            [0.025, 0.03, 0.035]
        );

        this.drawCube(
            p.x + 0.22,
            0.16,
            p.z - 0.10,
            0.38,
            0.22,
            0.55,
            [0.025, 0.03, 0.035]
        );

        // Tactical torso
        this.drawCube(
            p.x,
            torsoY,
            p.z,
            0.95,
            bodyHeight,
            0.55,
            [0.075, 0.09, 0.10]
        );

        // Armor plate
        this.drawCube(
            p.x,
            torsoY + 0.08,
            p.z - 0.30,
            0.62,
            0.62,
            0.08,
            [0.12, 0.14, 0.15]
        );

        // Shoulder armor
        this.drawCube(
            p.x - 0.62,
            torsoY + 0.38,
            p.z,
            0.30,
            0.34,
            0.48,
            [0.09, 0.105, 0.115]
        );

        this.drawCube(
            p.x + 0.62,
            torsoY + 0.38,
            p.z,
            0.30,
            0.34,
            0.48,
            [0.09, 0.105, 0.115]
        );

        // Arms
        this.drawCube(
            p.x - 0.68,
            torsoY - 0.05,
            p.z,
            0.25,
            0.95,
            0.28,
            [0.055, 0.065, 0.07]
        );

        this.drawCube(
            p.x + 0.68,
            torsoY - 0.05,
            p.z,
            0.25,
            0.95,
            0.28,
            [0.055, 0.065, 0.07]
        );

        // Gloves
        this.drawCube(
            p.x - 0.68,
            torsoY - 0.52,
            p.z,
            0.28,
            0.25,
            0.30,
            [0.025, 0.03, 0.035]
        );

        this.drawCube(
            p.x + 0.68,
            torsoY - 0.52,
            p.z,
            0.28,
            0.25,
            0.30,
            [0.025, 0.03, 0.035]
        );

        // Neck
        this.drawCube(
            p.x,
            headY - 0.32,
            p.z,
            0.30,
            0.25,
            0.30,
            [0.16, 0.13, 0.11]
        );

        // Helmet
        this.drawCube(
            p.x,
            headY,
            p.z,
            0.62,
            0.55,
            0.58,
            [0.075, 0.085, 0.09]
        );

        // Helmet front visor
        this.drawCube(
            p.x,
            headY + 0.02,
            p.z - 0.31,
            0.48,
            0.20,
            0.06,
            [0.015, 0.025, 0.03]
        );

        // Small backpack
        this.drawCube(
            p.x,
            torsoY + 0.05,
            p.z + 0.38,
            0.62,
            0.85,
            0.20,
            [0.045, 0.055, 0.06]
        );

        // Weapon placeholder
        this.drawCube(
            p.x,
            torsoY - 0.15,
            p.z - 0.52,
            0.16,
            0.16,
            1.35,
            [0.025, 0.028, 0.03]
        );

        // Weapon magazine
        this.drawCube(
            p.x,
            torsoY - 0.32,
            p.z - 0.50,
            0.12,
            0.30,
            0.20,
            [0.04, 0.045, 0.05]
        );
    },

    drawEnemies() {

        if (
            typeof Enemies === "undefined"
        ) {
            return;
        }

        const enemies =
            Enemies.enemies || [];

        for (
            const enemy of enemies
        ) {

            if (!enemy.alive) {
                continue;
            }

            if (
                enemy.type ===
                "COMBAT DRONE"
            ) {

                this.drawDrone(
                    enemy
                );

            } else {

                this.drawEnemySoldier(
                    enemy
                );
            }
        }
    },

    drawEnemySoldier(enemy) {

        const x = enemy.x;
        const z = enemy.z;

        // Body
        this.drawCube(
            x,
            1.05,
            z,
            0.75,
            1.45,
            0.48,
            [0.30, 0.045, 0.045]
        );

        // Head
        this.drawCube(
            x,
            2.05,
            z,
            0.48,
            0.48,
            0.48,
            [0.42, 0.06, 0.06]
        );

        // Arms
        this.drawCube(
            x - 0.52,
            1.05,
            z,
            0.20,
            0.85,
            0.25,
            [0.25, 0.035, 0.035]
        );

        this.drawCube(
            x + 0.52,
            1.05,
            z,
            0.20,
            0.85,
            0.25,
            [0.25, 0.035, 0.035]
        );

        // Health bar background
        this.drawCube(
            x,
            2.65,
            z,
            1.1,
            0.10,
            0.08,
            [0.12, 0.02, 0.02]
        );

        // Health bar
        const healthRatio =
            Math.max(
                0,
                enemy.health /
                enemy.maxHealth
            );

        this.drawCube(
            x -
                (1.1 *
                (1 - healthRatio)) /
                2,
            2.65,
            z - 0.05,
            1.1 * healthRatio,
            0.07,
            0.10,
            [0.15, 0.75, 0.20]
        );
    },

    drawDrone(enemy) {

        const x = enemy.x;
        const z = enemy.z;

        // Central body
        this.drawCube(
            x,
            1.7,
            z,
            0.95,
            0.45,
            0.95,
            [0.16, 0.17, 0.19]
        );

        // Front sensor
        this.drawCube(
            x,
            1.7,
            z - 0.52,
            0.35,
            0.20,
            0.12,
            [0.65, 0.08, 0.08]
        );

        // Drone arms
        this.drawCube(
            x - 0.80,
            1.7,
            z,
            0.80,
            0.12,
            0.16,
            [0.08, 0.09, 0.10]
        );

        this.drawCube(
            x + 0.80,
            1.7,
            z,
            0.80,
            0.12,
            0.16,
            [0.08, 0.09, 0.10]
        );

        // Rotors
        this.drawCube(
            x - 1.15,
            1.82,
            z,
            0.55,
            0.05,
            0.12,
            [0.025, 0.03, 0.035]
        );

        this.drawCube(
            x + 1.15,
            1.82,
            z,
            0.55,
            0.05,
            0.12,
            [0.025, 0.03, 0.035]
        );

        // Health bar
        const healthRatio =
            Math.max(
                0,
                enemy.health /
                enemy.maxHealth
            );

        this.drawCube(
            x,
            2.35,
            z,
            1.1,
            0.08,
            0.08,
            [0.12, 0.02, 0.02]
        );

        this.drawCube(
            x -
                (1.1 *
                (1 - healthRatio)) /
                2,
            2.35,
            z - 0.05,
            1.1 * healthRatio,
            0.06,
            0.10,
            [0.15, 0.75, 0.20]
        );
    },

    drawCube(
        x,
        y,
        z,
        width,
        height,
        depth,
        color
    ) {

        const vertices = [

            // Front
            -0.5, -0.5,  0.5,
             0.5, -0.5,  0.5,
            -0.5,  0.5,  0.5,

            -0.5,  0.5,  0.5,
             0.5, -0.5,  0.5,
             0.5,  0.5,  0.5,

            // Back
            -0.5, -0.5, -0.5,
            -0.5,  0.5, -0.5,
             0.5, -0.5, -0.5,

            -0.5,  0.5, -0.5,
             0.5,  0.5, -0.5,
             0.5, -0.5, -0.5,

            // Left
            -0.5, -0.5, -0.5,
            -0.5, -0.5,  0.5,
            -0.5,  0.5, -0.5,

            -0.5,  0.5, -0.5,
            -0.5, -0.5,  0.5,
            -0.5,  0.5,  0.5,

            // Right
             0.5, -0.5, -0.5,
             0.5,  0.5, -0.5,
             0.5, -0.5,  0.5,

             0.5,  0.5, -0.5,
             0.5,  0.5,  0.5,
             0.5, -0.5,  0.5,

            // Top
            -0.5,  0.5, -0.5,
            -0.5,  0.5,  0.5,
             0.5,  0.5, -0.5,

             0.5,  0.5, -0.5,
            -0.5,  0.5,  0.5,
             0.5,  0.5,  0.5,

            // Bottom
            -0.5, -0.5, -0.5,
             0.5, -0.5, -0.5,
            -0.5, -0.5,  0.5,

            -0.5, -0.5,  0.5,
             0.5, -0.5, -0.5,
             0.5, -0.5,  0.5
        ];

        const colors = [];

        for (
            let i = 0;
            i < 36;
            i++
        ) {

            colors.push(
                color[0],
                color[1],
                color[2]
            );
        }

        const model =
            this.translationScaleMatrix(
                x,
                y,
                z,
                width,
                height,
                depth
            );

        const viewModel =
            this.multiplyMatrix(
                this.viewMatrix,
                model
            );

        const finalMatrix =
            this.multiplyMatrix(
                this.projectionMatrix,
                viewModel
            );

        const gl = Engine.gl;

        gl.bindBuffer(
            gl.ARRAY_BUFFER,
            this.positionBuffer
        );

        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(vertices),
            gl.STREAM_DRAW
        );

        gl.enableVertexAttribArray(
            this.vertexPositionLocation
        );

        gl.vertexAttribPointer(
            this.vertexPositionLocation,
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
            gl.STREAM_DRAW
        );

        gl.enableVertexAttribArray(
            this.vertexColorLocation
        );

        gl.vertexAttribPointer(
            this.vertexColorLocation,
            3,
            gl.FLOAT,
            false,
            0,
            0
        );

        gl.uniformMatrix4fv(
            this.matrixLocation,
            false,
            finalMatrix
        );

        gl.drawArrays(
            gl.TRIANGLES,
            0,
            36
        );
    },

    translationScaleMatrix(
        x,
        y,
        z,
        sx,
        sy,
        sz
    ) {

        return new Float32Array([

            sx, 0,  0,  0,
            0,  sy, 0,  0,
            0,  0,  sz, 0,
            x,  y,  z,  1
        ]);
    },

    multiplyMatrix(a, b) {

        const result =
            new Float32Array(16);

        for (let row = 0; row < 4; row++) {

            for (let col = 0; col < 4; col++) {

                let sum = 0;

                for (
                    let i = 0;
                    i < 4;
                    i++
                ) {

                    sum +=
                        a[i * 4 + row] *
                        b[col * 4 + i];
                }

                result[
                    col * 4 + row
                ] = sum;
            }
        }

        return result;
    },

    perspective(
        fov,
        aspect,
        near,
        far
    ) {

        const f =
            1 /
            Math.tan(
                fov / 2
            );

        const range =
            1 /
            (near - far);

        return new Float32Array([

            f / aspect,
            0,
            0,
            0,

            0,
            f,
            0,
            0,

            0,
            0,
            (near + far) * range,
            -1,

            0,
            0,
            (2 * near * far) * range,
            0
        ]);
    },

    lookAt(
        eye,
        target,
        up
    ) {

        let zx =
            eye.x - target.x;

        let zy =
            eye.y - target.y;

        let zz =
            eye.z - target.z;

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
            up.y * zz -
            up.z * zy;

        let xy =
            up.z * zx -
            up.x * zz;

        let xz =
            up.x * zy -
            up.y * zx;

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

            xx,
            yx,
            zx,
            0,

            xy,
            yy,
            zy,
            0,

            xz,
            yz,
            zz,
            0,

            -(
                xx * eye.x +
                xy * eye.y +
                xz * eye.z
            ),

            -(
                yx * eye.x +
                yy * eye.y +
                yz * eye.z
            ),

            -(
                zx * eye.x +
                zy * eye.y +
                zz * eye.z
            ),

            1
        ]);
    }
};