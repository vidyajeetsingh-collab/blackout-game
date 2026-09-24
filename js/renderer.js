// PROJECT: BLACKOUT
// 3D WebGL Renderer

const Renderer = {
    gl: null,
    program: null,

    positionBuffer: null,
    colorBuffer: null,

    positionLocation: null,
    colorLocation: null,

    projectionLocation: null,
    viewLocation: null,

    init() {
        this.gl = Engine.gl;

        if (!this.gl) {
            console.error("Renderer: WebGL unavailable.");
            return;
        }

        const gl = this.gl;

        const vertexShaderSource = `
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

        const fragmentShaderSource = `
            precision mediump float;

            varying vec3 vColor;

            void main() {
                gl_FragColor = vec4(vColor, 1.0);
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

        if (!vertexShader || !fragmentShader) {
            console.error("Renderer: shader creation failed.");
            return;
        }

        this.program =
            this.createProgram(
                vertexShader,
                fragmentShader
            );

        if (!this.program) {
            console.error("Renderer: program creation failed.");
            return;
        }

        gl.useProgram(this.program);

        this.positionLocation =
            gl.getAttribLocation(
                this.program,
                "aPosition"
            );

        this.colorLocation =
            gl.getAttribLocation(
                this.program,
                "aColor"
            );

        this.projectionLocation =
            gl.getUniformLocation(
                this.program,
                "uProjection"
            );

        this.viewLocation =
            gl.getUniformLocation(
                this.program,
                "uView"
            );

        this.positionBuffer =
            gl.createBuffer();

        this.colorBuffer =
            gl.createBuffer();

        gl.enableVertexAttribArray(
            this.positionLocation
        );

        gl.enableVertexAttribArray(
            this.colorLocation
        );

        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);

        console.log(
            "PROJECT: BLACKOUT 3D renderer initialized."
        );
    },

    createShader(type, source) {
        const gl = this.gl;

        const shader = gl.createShader(type);

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

    createProgram(vertexShader, fragmentShader) {
        const gl = this.gl;

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

            gl.deleteProgram(program);

            return null;
        }

        return program;
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

    lookAt(eye, target, up) {
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
            xx, yx, zx, 0,
            xy, yy, zy, 0,
            xz, yz, zz, 0,

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
    },

    cube(x, y, z, sx, sy, sz, color) {
        const x1 = x - sx / 2;
        const x2 = x + sx / 2;

        const y1 = y;
        const y2 = y + sy;

        const z1 = z - sz / 2;
        const z2 = z + sz / 2;

        const vertices = [
            // Front
            x1,y1,z2,  x2,y1,z2,  x2,y2,z2,
            x1,y1,z2,  x2,y2,z2,  x1,y2,z2,

            // Back
            x2,y1,z1,  x1,y1,z1,  x1,y2,z1,
            x2,y1,z1,  x1,y2,z1,  x2,y2,z1,

            // Left
            x1,y1,z1,  x1,y1,z2,  x1,y2,z2,
            x1,y1,z1,  x1,y2,z2,  x1,y2,z1,

            // Right
            x2,y1,z2,  x2,y1,z1,  x2,y2,z1,
            x2,y1,z2,  x2,y2,z1,  x2,y2,z2,

            // Top
            x1,y2,z2,  x2,y2,z2,  x2,y2,z1,
            x1,y2,z2,  x2,y2,z1,  x1,y2,z1,

            // Bottom
            x1,y1,z1,  x2,y1,z1,  x2,y1,z2,
            x1,y1,z1,  x2,y1,z2,  x1,y1,z2
        ];

        const colors = [];

        for (let i = 0; i < 36; i++) {
            colors.push(
                color[0],
                color[1],
                color[2]
            );
        }

        return {
            vertices,
            colors
        };
    },

    ground() {
        return {
            vertices: [
                -50,0,-50,
                 50,0,-50,
                 50,0, 50,

                -50,0,-50,
                 50,0, 50,
                -50,0, 50
            ],

            colors: [
                0.08,0.10,0.12,
                0.08,0.10,0.12,
                0.08,0.10,0.12,

                0.08,0.10,0.12,
                0.08,0.10,0.12,
                0.08,0.10,0.12
            ]
        };
    },

    render() {
        const gl = this.gl;

        if (!gl || !this.program) {
            return;
        }

        Engine.resize();

        gl.viewport(
            0,
            0,
            gl.drawingBufferWidth,
            gl.drawingBufferHeight
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

        gl.useProgram(
            this.program
        );

        const projection =
            this.perspective(
                Math.PI / 3,
                Engine.getAspectRatio(),
                0.1,
                150
            );

        const view =
            this.lookAt(
                Camera.position,
                Camera.target,
                {
                    x: 0,
                    y: 1,
                    z: 0
                }
            );

        gl.uniformMatrix4fv(
            this.projectionLocation,
            false,
            projection
        );

        gl.uniformMatrix4fv(
            this.viewLocation,
            false,
            view
        );

        const objects = [];

        objects.push(
            this.ground()
        );

        // City buildings
        objects.push(
            this.cube(
                -10, 0, -12,
                7, 8, 7,
                [0.16,0.19,0.23]
            )
        );

        objects.push(
            this.cube(
                10, 0, -15,
                8, 11, 8,
                [0.20,0.22,0.26]
            )
        );

        objects.push(
            this.cube(
                -14, 0, 10,
                9, 6, 8,
                [0.14,0.17,0.20]
            )
        );

        objects.push(
            this.cube(
                14, 0, 9,
                7, 9, 7,
                [0.18,0.20,0.24]
            )
        );

        objects.push(
            this.cube(
                0, 0, -24,
                12, 14, 8,
                [0.12,0.15,0.19]
            )
        );

        // Player marker
        if (typeof Player !== "undefined") {
            objects.push(
                this.cube(
                    Player.position.x,
                    Player.position.y,
                    Player.position.z,
                    0.8,
                    1.8,
                    0.8,
                    [0.05,0.65,0.85]
                )
            );
        }

        for (const object of objects) {
            this.drawObject(object);
        }
    },

    drawObject(object) {
        const gl = this.gl;

        gl.bindBuffer(
            gl.ARRAY_BUFFER,
            this.positionBuffer
        );

        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(
                object.vertices
            ),
            gl.DYNAMIC_DRAW
        );

        gl.vertexAttribPointer(
            this.positionLocation,
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
            new Float32Array(
                object.colors
            ),
            gl.DYNAMIC_DRAW
        );

        gl.vertexAttribPointer(
            this.colorLocation,
            3,
            gl.FLOAT,
            false,
            0,
            0
        );

        gl.drawArrays(
            gl.TRIANGLES,
            0,
            object.vertices.length / 3
        );
    }
};
