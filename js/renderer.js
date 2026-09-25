// PROJECT: BLACKOUT
// WebGL Renderer
// Optimized Low-Poly Tactical City Renderer

const Renderer = {

    gl: null,

    program: null,

    positionBuffer: null,

    colorBuffer: null,

    indexBuffer: null,

    locations: {
        position: null,
        color: null,
        projection: null,
        view: null,
        model: null
    },

    vertexData: [],
    colorData: [],
    indexData: [],

    vertexCount: 0,

    initialized: false,

    init() {

        this.gl = Engine.gl;

        if (!this.gl) {

            console.error(
                "Renderer: WebGL context missing."
            );

            return;
        }

        this.createShaderProgram();

        this.positionBuffer =
            this.gl.createBuffer();

        this.colorBuffer =
            this.gl.createBuffer();

        this.indexBuffer =
            this.gl.createBuffer();

        this.initialized = true;

        console.log(
            "BLACKOUT 3D Renderer initialized."
        );
    },

    createShaderProgram() {

        const gl = this.gl;

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
            this.compileShader(
                gl.VERTEX_SHADER,
                vertexShaderSource
            );

        const fragmentShader =
            this.compileShader(
                gl.FRAGMENT_SHADER,
                fragmentShaderSource
            );

        if (
            !vertexShader ||
            !fragmentShader
        ) {
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
                "Renderer shader link failed:",
                gl.getProgramInfoLog(
                    this.program
                )
            );

            return;
        }

        gl.useProgram(
            this.program
        );

        this.locations.position =
            gl.getAttribLocation(
                this.program,
                "aPosition"
            );

        this.locations.color =
            gl.getAttribLocation(
                this.program,
                "aColor"
            );

        this.locations.projection =
            gl.getUniformLocation(
                this.program,
                "uProjection"
            );

        this.locations.view =
            gl.getUniformLocation(
                this.program,
                "uView"
            );

        this.locations.model =
            gl.getUniformLocation(
                this.program,
                "uModel"
            );
    },

    compileShader(
        type,
        source
    ) {

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
                "Shader compile failed:",
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

    render(
        cameraPosition,
        cameraTarget
    ) {

        if (
            !this.initialized ||
            !this.program
        ) {
            return;
        }

        const gl = this.gl;

        gl.useProgram(
            this.program
        );

        this.vertexData = [];
        this.colorData = [];
        this.indexData = [];

        /*
         * Camera matrices
         */

        const projection =
            this.createPerspective(
                Math.PI / 3,
                Engine.getAspectRatio(),
                0.1,
                150
            );

        const view =
            this.createLookAt(
                cameraPosition,
                cameraTarget,
                {
                    x: 0,
                    y: 1,
                    z: 0
                }
            );

        gl.uniformMatrix4fv(
            this.locations.projection,
            false,
            new Float32Array(
                projection
            )
        );

        gl.uniformMatrix4fv(
            this.locations.view,
            false,
            new Float32Array(
                view
            )
        );

        /*
         * World
         */

        this.drawGround();

        this.drawRoads();

        this.drawBuildings();

        this.drawWorldProps();

        this.drawMissionPoints();

        this.drawVehicles();

        this.drawPickups();

        this.drawEnemies();

        this.drawPlayer();

        /*
         * Upload geometry
         */

        this.uploadAndDraw();
    },

    drawGround() {

        this.drawCube(
            0,
            -0.25,
            0,
            90,
            0.5,
            90,
            [
                0.055,
                0.07,
                0.085
            ]
        );
    },

    drawRoads() {

        if (
            typeof World ===
            "undefined"
        ) {
            return;
        }

        const roads =
            World.getRoads();

        for (
            const road of roads
        ) {

            this.drawCube(
                road.x,
                0.015,
                road.z,
                road.width,
                0.04,
                road.depth,
                [
                    0.09,
                    0.095,
                    0.10
                ]
            );
        }

        /*
         * Road center markings
         */

        for (
            let i = -40;
            i <= 40;
            i += 8
        ) {

            this.drawCube(
                i,
                0.045,
                0,
                2.5,
                0.02,
                0.12,
                [
                    0.55,
                    0.52,
                    0.35
                ]
            );

            this.drawCube(
                0,
                0.045,
                i,
                0.12,
                0.02,
                2.5,
                [
                    0.55,
                    0.52,
                    0.35
                ]
            );
        }
    },

    drawBuildings() {

        if (
            typeof World ===
            "undefined"
        ) {
            return;
        }

        const buildings =
            World.getBuildings();

        for (
            const building of buildings
        ) {

            let color;

            if (
                building.type ===
                "HIGHRISE"
            ) {

                color = [
                    0.17,
                    0.20,
                    0.24
                ];

            } else if (
                building.type ===
                "LOW_BUILDING"
            ) {

                color = [
                    0.20,
                    0.22,
                    0.24
                ];

            } else {

                color = [
                    0.15,
                    0.18,
                    0.21
                ];
            }

            this.drawCube(
                building.x,
                building.y,
                building.z,
                building.width,
                building.height,
                building.depth,
                color
            );

            /*
             * Simple rooftop detail
             */

            if (
                building.height >= 5
            ) {

                this.drawCube(
                    building.x,
                    building.height +
                    0.15,
                    building.z,
                    building.width * 0.35,
                    0.3,
                    building.depth * 0.35,
                    [
                        0.08,
                        0.10,
                        0.12
                    ]
                );
            }
        }
    },

    drawWorldProps() {

        if (
            typeof World ===
            "undefined"
        ) {
            return;
        }

        const props =
            World.getProps();

        for (
            const prop of props
        ) {

            if (
                prop.type ===
                "STREET_LIGHT"
            ) {

                this.drawStreetLight(
                    prop.x,
                    prop.z
                );

            } else if (
                prop.type ===
                "BARRIER"
            ) {

                this.drawBarrier(
                    prop.x,
                    prop.z
                );

            } else if (
                prop.type ===
                "TREE"
            ) {

                this.drawTree(
                    prop.x,
                    prop.z
                );
            }
        }
    },

    drawStreetLight(
        x,
        z
    ) {

        this.drawCube(
            x,
            2,
            z,
            0.15,
            4,
            0.15,
            [
                0.20,
                0.22,
                0.24
            ]
        );

        this.drawCube(
            x,
            4.05,
            z,
            0.55,
            0.12,
            0.55,
            [
                0.75,
                0.68,
                0.38
            ]
        );
    },

    drawBarrier(
        x,
        z
    ) {

        this.drawCube(
            x,
            0.55,
            z,
            2.5,
            1.1,
            0.35,
            [
                0.35,
                0.10,
                0.06
            ]
        );

        this.drawCube(
            x,
            1.15,
            z,
            2.2,
            0.08,
            0.15,
            [
                0.65,
                0.55,
                0.20
            ]
        );
    },

    drawTree(
        x,
        z
    ) {

        this.drawCube(
            x,
            1,
            z,
            0.45,
            2,
            0.45,
            [
                0.18,
                0.10,
                0.055
            ]
        );

        this.drawCube(
            x,
            2.5,
            z,
            2.4,
            2.2,
            2.4,
            [
                0.06,
                0.18,
                0.08
            ]
        );
    },

    drawMissionPoints() {

        if (
            typeof World ===
            "undefined"
        ) {
            return;
        }

        const points =
            World.getMissionPoints();

        for (
            const point of points
        ) {

            this.drawCube(
                point.x,
                0.12,
                point.z,
                1.2,
                0.15,
                1.2,
                [
                    0.05,
                    0.45,
                    0.55
                ]
            );
        }
    },

    drawVehicles() {

        if (
            typeof Vehicles ===
            "undefined"
        ) {
            return;
        }

        const vehicles =
            Vehicles.vehicles;

        for (
            const vehicle of vehicles
        ) {

            if (
                vehicle.destroyed
            ) {

                this.drawCube(
                    vehicle.x,
                    0.35,
                    vehicle.z,
                    2.8,
                    0.35,
                    4.2,
                    [
                        0.08,
                        0.06,
                        0.05
                    ]
                );

                continue;
            }

            this.drawCar(
                vehicle
            );
        }
    },

    drawCar(
        vehicle
    ) {

        const x =
            vehicle.x;

        const z =
            vehicle.z;

        const rotation =
            vehicle.rotation;

        const bodyColor =
            vehicle.color === "DARK"
                ? [
                    0.08,
                    0.10,
                    0.12
                ]
                : [
                    0.28,
                    0.30,
                    0.32
                ];

        this.drawCubeRotated(
            x,
            0.65,
            z,
            2.5,
            0.7,
            4.2,
            bodyColor,
            rotation
        );

        this.drawCubeRotated(
            x,
            1.15,
            z,
            2.0,
            0.65,
            2.1,
            [
                0.06,
                0.09,
                0.12
            ],
            rotation
        );

        /*
         * Front lights
         */

        const frontX =
            x +
            Math.sin(rotation) *
            2.05;

        const frontZ =
            z +
            Math.cos(rotation) *
            2.05;

        this.drawCubeRotated(
            frontX,
            0.7,
            frontZ,
            0.45,
            0.18,
            0.12,
            [
                0.75,
                0.72,
                0.45
            ],
            rotation
        );

        /*
         * Wheels
         */

        const rightX =
            Math.cos(rotation) *
            1.15;

        const rightZ =
            -Math.sin(rotation) *
            1.15;

        const forwardX =
            Math.sin(rotation) *
            1.25;

        const forwardZ =
            Math.cos(rotation) *
            1.25;

        const wheels = [

            [
                x + rightX + forwardX,
                z + rightZ + forwardZ
            ],

            [
                x - rightX + forwardX,
                z - rightZ + forwardZ
            ],

            [
                x + rightX - forwardX,
                z + rightZ - forwardZ
            ],

            [
                x - rightX - forwardX,
                z - rightZ - forwardZ
            ]
        ];

        for (
            const wheel of wheels
        ) {

            this.drawCubeRotated(
                wheel[0],
                0.35,
                wheel[1],
                0.38,
                0.55,
                0.75,
                [
                    0.025,
                    0.025,
                    0.025
                ],
                rotation
            );
        }
    },

    drawPickups() {

        if (
            typeof Inventory ===
            "undefined"
        ) {
            return;
        }

        const pickups =
            Inventory.getAvailablePickups();

        for (
            const pickup of pickups
        ) {

            let color;

            if (
                pickup.type ===
                "MEDKIT"
            ) {

                color = [
                    0.55,
                    0.10,
                    0.10
                ];

            } else {

                color = [
                    0.65,
                    0.52,
                    0.10
                ];
            }

            this.drawCube(
                pickup.x,
                pickup.y,
                pickup.z,
                0.55,
                0.55,
                0.55,
                color
            );

            /*
             * Floating marker
             */

            this.drawCube(
                pickup.x,
                pickup.y + 0.55,
                pickup.z,
                0.12,
                0.12,
                0.12,
                [
                    0.15,
                    0.65,
                    0.75
                ]
            );
        }
    },

    drawEnemies() {

        if (
            typeof Enemies ===
            "undefined"
        ) {
            return;
        }

        const enemies =
            Enemies.getAliveEnemies();

        for (
            const enemy of enemies
        ) {

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

            this.drawHealthBar(
                enemy
            );
        }
    },

    drawEnemySoldier(
        enemy
    ) {

        const color = [
            0.30,
            0.08,
            0.08
        ];

        this.drawCube(
            enemy.x,
            1.0,
            enemy.z,
            0.75,
            1.5,
            0.45,
            color
        );

        this.drawCube(
            enemy.x,
            1.95,
            enemy.z,
            0.55,
            0.55,
            0.55,
            [
                0.10,
                0.07,
                0.07
            ]
        );

        this.drawCube(
            enemy.x,
            1.25,
            enemy.z + 0.42,
            0.25,
            0.25,
            0.8,
            [
                0.06,
                0.06,
                0.07
            ]
        );
    },

    drawDrone(
        enemy
    ) {

        this.drawCube(
            enemy.x,
            2.4,
            enemy.z,
            1.1,
            0.35,
            1.1,
            [
                0.08,
                0.12,
                0.15
            ]
        );

        this.drawCube(
            enemy.x,
            2.15,
            enemy.z,
            0.35,
            0.25,
            0.35,
            [
                0.45,
                0.08,
                0.08
            ]
        );

        const rotorPositions = [

            [-0.75, -0.75],
            [0.75, -0.75],
            [-0.75, 0.75],
            [0.75, 0.75]
        ];

        for (
            const position
            of rotorPositions
        ) {

            this.drawCube(
                enemy.x +
                    position[0],
                2.45,
                enemy.z +
                    position[1],
                0.35,
                0.08,
                0.35,
                [
                    0.03,
                    0.03,
                    0.03
                ]
            );
        }
    },

    drawHealthBar(
        enemy
    ) {

        const ratio =
            Math.max(
                0,
                enemy.health /
                enemy.maxHealth
            );

        const width =
            1.2 * ratio;

        this.drawCube(
            enemy.x,
            2.75,
            enemy.z,
            width,
            0.08,
            0.08,
            [
                0.65,
                0.08,
                0.08
            ]
        );
    },

    drawPlayer() {

        if (
            typeof Player ===
            "undefined"
        ) {
            return;
        }

        const x =
            Player.position.x;

        const z =
            Player.position.z;

        const crouched =
            Player.isCrouching;

        const bodyHeight =
            crouched
                ? 0.8
                : 1.1;

        const bodyY =
            crouched
                ? 0.75
                : 1.0;

        /*
         * Tactical torso
         */

        this.drawCubeRotated(
            x,
            bodyY,
            z,
            0.75,
            bodyHeight,
            0.45,
            [
                0.12,
                0.15,
                0.16
            ],
            Player.rotation.y
        );

        /*
         * Head / helmet
         */

        this.drawCube(
            x,
            crouched
                ? 1.45
                : 1.95,
            z,
            0.55,
            0.55,
            0.55,
            [
                0.16,
                0.18,
                0.19
            ]
        );

        /*
         * Backpack
         */

        this.drawCubeRotated(
            x -
                Math.sin(
                    Player.rotation.y
                ) *
                0.35,
            bodyY,
            z -
                Math.cos(
                    Player.rotation.y
                ) *
                0.35,
            0.5,
            bodyHeight,
            0.25,
            [
                0.07,
                0.09,
                0.10
            ],
            Player.rotation.y
        );

        /*
         * Weapon
         */

        this.drawCubeRotated(
            x +
                Math.sin(
                    Player.rotation.y
                ) *
                0.5,
            crouched
                ? 1.0
                : 1.3,
            z +
                Math.cos(
                    Player.rotation.y
                ) *
                0.5,
            0.18,
            0.18,
            1.15,
            [
                0.035,
                0.04,
                0.045
            ],
            Player.rotation.y
        );

        /*
         * Legs
         */

        this.drawCube(
            x - 0.22,
            crouched
                ? 0.35
                : 0.45,
            z,
            0.25,
            crouched
                ? 0.55
                : 0.9,
            0.35,
            [
                0.09,
                0.10,
                0.11
            ]
        );

        this.drawCube(
            x + 0.22,
            crouched
                ? 0.35
                : 0.45,
            z,
            0.25,
            crouched
                ? 0.55
                : 0.9,
            0.35,
            [
                0.09,
                0.10,
                0.11
            ]
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

        this.drawCubeRotated(
            x,
            y,
            z,
            width,
            height,
            depth,
            color,
            0
        );
    },

    drawCubeRotated(
        x,
        y,
        z,
        width,
        height,
        depth,
        color,
        rotation
    ) {

        const start =
            this.vertexData.length /
            3;

        const halfW =
            width / 2;

        const halfH =
            height / 2;

        const halfD =
            depth / 2;

        const localVertices = [

            [-halfW, -halfH, -halfD],
            [ halfW, -halfH, -halfD],
            [ halfW,  halfH, -halfD],
            [-halfW,  halfH, -halfD],

            [-halfW, -halfH,  halfD],
            [ halfW, -halfH,  halfD],
            [ halfW,  halfH,  halfD],
            [-halfW,  halfH,  halfD]
        ];

        const cos =
            Math.cos(rotation);

        const sin =
            Math.sin(rotation);

        for (
            const vertex
            of localVertices
        ) {

            const localX =
                vertex[0];

            const localZ =
                vertex[2];

            const rotatedX =
                localX * cos -
                localZ * sin;

            const rotatedZ =
                localX * sin +
                localZ * cos;

            this.vertexData.push(
                x + rotatedX,
                y + vertex[1],
                z + rotatedZ
            );

            this.colorData.push(
                color[0],
                color[1],
                color[2]
            );
        }

        const faces = [

            [0, 1, 2, 0, 2, 3],
            [4, 6, 5, 4, 7, 6],
            [0, 4, 5, 0, 5, 1],
            [3, 2, 6, 3, 6, 7],
            [1, 5, 6, 1, 6, 2],
            [0, 3, 7, 0, 7, 4]
        ];

        for (
            const face of faces
        ) {

            for (
                const index
                of face
            ) {

                this.indexData.push(
                    start + index
                );
            }
        }
    },

    uploadAndDraw() {

        const gl = this.gl;

        if (
            this.indexData.length === 0
        ) {
            return;
        }

        /*
         * Position buffer
         */

        gl.bindBuffer(
            gl.ARRAY_BUFFER,
            this.positionBuffer
        );

        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(
                this.vertexData
            ),
            gl.DYNAMIC_DRAW
        );

        gl.enableVertexAttribArray(
            this.locations.position
        );

        gl.vertexAttribPointer(
            this.locations.position,
            3,
            gl.FLOAT,
            false,
            0,
            0
        );

        /*
         * Color buffer
         */

        gl.bindBuffer(
            gl.ARRAY_BUFFER,
            this.colorBuffer
        );

        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(
                this.colorData
            ),
            gl.DYNAMIC_DRAW
        );

        gl.enableVertexAttribArray(
            this.locations.color
        );

        gl.vertexAttribPointer(
            this.locations.color,
            3,
            gl.FLOAT,
            false,
            0,
            0
        );

        /*
         * Index buffer
         */

        gl.bindBuffer(
            gl.ELEMENT_ARRAY_BUFFER,
            this.indexBuffer
        );

        gl.bufferData(
            gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(
                this.indexData
            ),
            gl.DYNAMIC_DRAW
        );

        /*
         * Identity model matrix.
         */

        gl.uniformMatrix4fv(
            this.locations.model,
            false,
            new Float32Array(
                this.identityMatrix()
            )
        );

        gl.drawElements(
            gl.TRIANGLES,
            this.indexData.length,
            gl.UNSIGNED_SHORT,
            0
        );
    },

    identityMatrix() {

        return [

            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];
    },

    createPerspective(
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

        const rangeInv =
            1 /
            (near - far);

        return [

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
            near *
                far *
                rangeInv *
                2,
            0
        ];
    },

    createLookAt(
        eye,
        center,
        up
    ) {

        let zx =
            eye.x -
            center.x;

        let zy =
            eye.y -
            center.y;

        let zz =
            eye.z -
            center.z;

        let length =
            Math.hypot(
                zx,
                zy,
                zz
            );

        length =
            Math.max(
                length,
                0.0001
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

        length =
            Math.max(
                length,
                0.0001
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

        return [

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
        ];
    }
};