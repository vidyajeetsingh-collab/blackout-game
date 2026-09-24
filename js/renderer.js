// PROJECT: BLACKOUT
// WebGL 3D City Renderer

const Renderer = {

    gl: null,
    program: null,

    positionBuffer: null,
    colorBuffer: null,

    vertexCount: 0,

    aPosition: null,
    aColor: null,

    uProjection: null,
    uView: null,

    init() {

        this.gl = Engine.gl;

        if (!this.gl) {
            console.error("WebGL unavailable.");
            return;
        }

        this.createShaderProgram();
        this.createSceneGeometry();

        console.log(
            "BLACKOUT 3D CITY RENDERER READY."
        );
    },

    createShaderProgram() {

        const gl = this.gl;

        const isWebGL2 =
            typeof WebGL2RenderingContext !== "undefined" &&
            gl instanceof WebGL2RenderingContext;

        let vertexShaderSource;
        let fragmentShaderSource;

        if (isWebGL2) {

            vertexShaderSource = `#version 300 es

                in vec3 aPosition;
                in vec3 aColor;

                uniform mat4 uProjection;
                uniform mat4 uView;

                out vec3 vColor;

                void main() {

                    gl_Position =
                        uProjection *
                        uView *
                        vec4(aPosition, 1.0);

                    vColor = aColor;
                }
            `;

            fragmentShaderSource = `#version 300 es

                precision mediump float;

                in vec3 vColor;

                out vec4 outColor;

                void main() {

                    outColor =
                        vec4(vColor, 1.0);
                }
            `;

        } else {

            vertexShaderSource = `
                attribute vec3 aPosition;
                attribute vec3 aColor;

                uniform mat4 uProjection;
                uniform mat4 uView;

                varying vec3 vColor;

                void main() {

                    gl_Position =
                        uProjection *
                        uView *
                        vec4(aPosition, 1.0);

                    vColor = aColor;
                }
            `;

            fragmentShaderSource = `
                precision mediump float;

                varying vec3 vColor;

                void main() {

                    gl_FragColor =
                        vec4(vColor, 1.0);
                }
            `;
        }

        const vertexShader =
            this.compileShader(
                gl.VERTEX_SHADER,
                vertexShaderSource
            );

        const fragmentShader =
            this.compileShader(
                gl.FRAGMENT_SHADER,
                fragmentShaderSource
            );

        if (!vertexShader || !fragmentShader) {
            console.error(
                "BLACKOUT shader creation failed."
            );
            return;
        }

        this.program =
            gl.createProgram();

        gl.attachShader(
            this.program,
            vertexShader
        );

        gl.attachShader(
            this.program,
            fragmentShader
        );

        gl.linkProgram(
            this.program
        );

        if (
            !gl.getProgramParameter(
                this.program,
                gl.LINK_STATUS
            )
        ) {

            console.error(
                "Shader program link error:",
                gl.getProgramInfoLog(
                    this.program
                )
            );

            return;
        }

        gl.useProgram(
            this.program
        );

        this.aPosition =
            gl.getAttribLocation(
                this.program,
                "aPosition"
            );

        this.aColor =
            gl.getAttribLocation(
                this.program,
                "aColor"
            );

        this.uProjection =
            gl.getUniformLocation(
                this.program,
                "uProjection"
            );

        this.uView =
            gl.getUniformLocation(
                this.program,
                "uView"
            );
    },

    compileShader(type, source) {

        const gl = this.gl;

        const shader =
            gl.createShader(type);

        gl.shaderSource(
            shader,
            source
        );

        gl.compileShader(
            shader
        );

        if (
            !gl.getShaderParameter(
                shader,
                gl.COMPILE_STATUS
            )
        ) {

            console.error(
                "Shader compile error:",
                gl.getShaderInfoLog(
                    shader
                )
            );

            gl.deleteShader(
                shader
            );

            return null;
        }

        return shader;
    },

    createSceneGeometry() {

        const positions = [];
        const colors = [];

        // Ground
        this.addCube(
            positions,
            colors,
            0,
            -0.5,
            0,
            50,
            0.5,
            50,
            [0.12, 0.15, 0.14]
        );

        // Residential buildings
        this.addBuilding(
            positions,
            colors,
            -15,
            3,
            -15,
            7,
            6,
            7
        );

        this.addBuilding(
            positions,
            colors,
            15,
            4,
            -15,
            8,
            8,
            7
        );

        this.addBuilding(
            positions,
            colors,
            -17,
            3,
            12,
            7,
            6,
            8
        );

        // Downtown buildings
        this.addBuilding(
            positions,
            colors,
            0,
            7,
            -18,
            8,
            14,
            8
        );

        this.addBuilding(
            positions,
            colors,
            18,
            6,
            5,
            7,
            12,
            7
        );

        this.addBuilding(
            positions,
            colors,
            -18,
            5,
            -2,
            7,
            10,
            7
        );

        // Industrial buildings
        this.addBuilding(
            positions,
            colors,
            0,
            3,
            18,
            12,
            6,
            8
        );

        this.addBuilding(
            positions,
            colors,
            -25,
            2.5,
            25,
            8,
            5,
            8
        );

        // Roads
        this.addCube(
            positions,
            colors,
            0,
            -0.23,
            0,
            6,
            0.05,
            50,
            [0.05, 0.06, 0.07]
        );

        this.addCube(
            positions,
            colors,
            0,
            -0.22,
            0,
            50,
            0.05,
            6,
            [0.05, 0.06, 0.07]
        );

        this.positionBuffer =
            this.gl.createBuffer();

        this.gl.bindBuffer(
            this.gl.ARRAY_BUFFER,
            this.positionBuffer
        );

        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            new Float32Array(positions),
            this.gl.STATIC_DRAW
        );

        this.colorBuffer =
            this.gl.createBuffer();

        this.gl.bindBuffer(
            this.gl.ARRAY_BUFFER,
            this.colorBuffer
        );

        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            new Float32Array(colors),
            this.gl.STATIC_DRAW
        );

        this.vertexCount =
            positions.length / 3;

        console.log(
            "City geometry:",
            this.vertexCount,
            "vertices"
        );
    },

    addBuilding(
        positions,
        colors,
        x,
        y,
        z,
        width,
        height,
        depth
    ) {

        this.addCube(
            positions,
            colors,
            x,
            y,
            z,
            width,
            height,
            depth,
            [0.22, 0.25, 0.28]
        );
    },

    addCube(
        positions,
        colors,
        x,
        y,
        z,
        width,
        height,
        depth,
        color
    ) {

        const x1 =
            x - width / 2;

        const x2 =
            x + width / 2;

        const y1 =
            y - height / 2;

        const y2 =
            y + height / 2;

        const z1 =
            z - depth / 2;

        const z2 =
            z + depth / 2;

        const vertices = [

            // Front
            x1,y1,z2,
            x2,y1,z2,
            x2,y2,z2,

            x1,y1,z2,
            x2,y2,z2,
            x1,y2,z2,

            // Back
            x2,y1,z1,
            x1,y1,z1,
            x1,y2,z1,

            x2,y1,z1,
            x1,y2,z1,
            x2,y2,z1,

            // Left
            x1,y1,z1,
            x1,y1,z2,
            x1,y2,z2,

            x1,y1,z1,
            x1,y2,z2,
            x1,y2,z1,

            // Right
            x2,y1,z2,
            x2,y1,z1,
            x2,y2,z1,

            x2,y1,z2,
            x2,y2,z1,
            x2,y2,z2,

            // Top
            x1,y2,z2,
            x2,y2,z2,
            x2,y2,z1,

            x1,y2,z2,
            x2,y2,z1,
            x1,y2,z1,

            // Bottom
            x1,y1,z1,
            x2,y1,z1,
            x2,y1,z2,

            x1,y1,z1,
            x2,y1,z2,
            x1,y1,z2
        ];

        for (let i = 0; i < vertices.length; i += 3) {

            positions.push(
                vertices[i],
                vertices[i + 1],
                vertices[i + 2]
            );

            colors.push(
                color[0],
                color[1],
                color[2]
            );
        }
    },

    render(cameraPosition, cameraTarget) {

        const gl = this.gl;

        if (
            !gl ||
            !this.program ||
            !this.positionBuffer
        ) {
            return;
        }

        gl.useProgram(
            this.program
        );

        gl.clearColor(
            0.035,
            0.05,
            0.065,
            1
        );

        gl.clear(
            gl.COLOR_BUFFER_BIT |
            gl.DEPTH_BUFFER_BIT
        );

        gl.enable(
            gl.DEPTH_TEST
        );

        gl.depthFunc(
            gl.LEQUAL
        );

        const projection =
            this.perspective(
                60 * Math.PI / 180,
                Engine.getAspectRatio(),
                0.1,
                150
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

        gl.bindBuffer(
            gl.ARRAY_BUFFER,
            this.positionBuffer
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

        gl.drawArrays(
            gl.TRIANGLES,
            0,
            this.vertexCount
        );
    },

    perspective(
        fov,
        aspect,
        near,
        far
    ) {

        const f =
            1 /
            Math.tan(fov / 2);

        const rangeInv =
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
            (near + far) *
            rangeInv,
            -1,

            0,
            0,
            (2 * near * far) *
            rangeInv,
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
