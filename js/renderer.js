// PROJECT: BLACKOUT
// WebGL 3D City Renderer

const Renderer = {

    gl: null,
    program: null,

    positionBuffer: null,
    colorBuffer: null,

    vertexCount: 0,

    init() {
        this.gl = Engine.gl;

        if (!this.gl) return;

        this.createShaderProgram();
        this.createSceneGeometry();

        console.log("BLACKOUT 3D CITY RENDERER READY.");
    },

    createShaderProgram() {

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
                gl_FragColor =
                    vec4(vColor, 1.0);
            }
        `;

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

        gl.linkProgram(this.program);

        if (!gl.getProgramParameter(
            this.program,
            gl.LINK_STATUS
        )) {
            console.error(
                gl.getProgramInfoLog(
                    this.program
                )
            );
        }

        gl.useProgram(this.program);
    },

    compileShader(type, source) {

        const gl = this.gl;

        const shader =
            gl.createShader(type);

        gl.shaderSource(
            shader,
            source
        );

        gl.compileShader(shader);

        if (!gl.getShaderParameter(
            shader,
            gl.COMPILE_STATUS
        )) {
            console.error(
                gl.getShaderInfoLog(shader)
            );
        }

        return shader;
    },

    createSceneGeometry() {

        const vertices = [];
        const colors = [];

        const addCube = (
            x,
            y,
            z,
            width,
            height,
            depth,
            color
        ) => {

            const x1 = x - width / 2;
            const x2 = x + width / 2;

            const y1 = y;
            const y2 = y + height;

            const z1 = z - depth / 2;
            const z2 = z + depth / 2;

            const cube = [

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

            for (let i = 0; i < cube.length; i += 3) {
                vertices.push(
                    cube[i],
                    cube[i + 1],
                    cube[i + 2]
                );

                colors.push(
                    color[0],
                    color[1],
                    color[2]
                );
            }
        };

        // Ground
        addCube(
            0, -0.25, 0,
            100, 0.5, 100,
            [0.12, 0.14, 0.15]
        );

        // Residential buildings
        addCube(
            -14, 0, -12,
            10, 7, 10,
            [0.22, 0.25, 0.27]
        );

        addCube(
            12, 0, -15,
            9, 10, 9,
            [0.18, 0.21, 0.24]
        );

        addCube(
            -18, 0, 10,
            12, 6, 9,
            [0.25, 0.23, 0.21]
        );

        addCube(
            17, 0, 15,
            11, 8, 11,
            [0.20, 0.22, 0.23]
        );

        // Downtown towers
        addCube(
            -2, 0, -25,
            12, 18, 10,
            [0.16, 0.20, 0.25]
        );

        addCube(
            15, 0, -30,
            10, 24, 10,
            [0.13, 0.17, 0.22]
        );

        addCube(
            -20, 0, -28,
            9, 15, 9,
            [0.20, 0.21, 0.23]
        );

        // Industrial structures
        addCube(
            28, 0, 5,
            15, 7, 12,
            [0.25, 0.24, 0.20]
        );

        addCube(
            30, 0, 22,
            12, 9, 15,
            [0.21, 0.22, 0.20]
        );

        // Player placeholder
        addCube(
            0, 0, 0,
            1.2, 2.0, 1.0,
            [0.12, 0.45, 0.55]
        );

        this.positionBuffer =
            this.createBuffer(vertices);

        this.colorBuffer =
            this.createBuffer(colors);

        this.vertexCount =
            vertices.length / 3;
    },

    createBuffer(data) {

        const gl = this.gl;

        const buffer =
            gl.createBuffer();

        gl.bindBuffer(
            gl.ARRAY_BUFFER,
            buffer
        );

        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(data),
            gl.STATIC_DRAW
        );

        return buffer;
    },

    render() {

        const gl = this.gl;

        if (!gl || !this.program) {
            return;
        }

        Engine.clear();

        gl.useProgram(this.program);

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
                Camera.position,
                Camera.target,
                { x: 0, y: 1, z: 0 }
            );

        const projectionLocation =
            gl.getUniformLocation(
                this.program,
                "uProjection"
            );

        const viewLocation =
            gl.getUniformLocation(
                this.program,
                "uView"
            );

        gl.uniformMatrix4fv(
            projectionLocation,
            false,
            projection
        );

        gl.uniformMatrix4fv(
            viewLocation,
            false,
            view
        );

        const positionLocation =
            gl.getAttribLocation(
                this.program,
                "aPosition"
            );

        const colorLocation =
            gl.getAttribLocation(
                this.program,
                "aColor"
            );

        gl.bindBuffer(
            gl.ARRAY_BUFFER,
            this.positionBuffer
        );

        gl.enableVertexAttribArray(
            positionLocation
        );

        gl.vertexAttribPointer(
            positionLocation,
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
            colorLocation
        );

        gl.vertexAttribPointer(
            colorLocation,
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
            1 / Math.tan(fov / 2);

        const rangeInv =
            1 / (near - far);

        return new Float32Array([
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0,
            (near + far) * rangeInv,
            -1,
            0, 0,
            near * far * rangeInv * 2,
            0
        ]);
    },

    lookAt(eye, center, up) {

        let zx =
            eye.x - center.x;

        let zy =
            eye.y - center.y;

        let zz =
            eye.z - center.z;

        let length =
            Math.hypot(zx, zy, zz);

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
            Math.hypot(xx, xy, xz);

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
    }
};
