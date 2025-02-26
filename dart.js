import * as THREE from "three";
import { translationMatrix } from "./transformations";
class DartGeometry extends THREE.BufferGeometry {
    //user defined, change
    static W_RATIO = 16; //ratio of dart length to width
    static F_RATIO = 2; //ratio of fin height to dart width
    //

    //do not change
    static l = 0.5;
    static w = 0.5 / DartGeometry.W_RATIO;
    static f = DartGeometry.w * (1 + DartGeometry.F_RATIO);
    //

    /* Vertices */
    static positions = new Float32Array([
        // Body
        //front face
        -DartGeometry.w,
        -DartGeometry.w,
        DartGeometry.l, //0
        DartGeometry.w,
        -DartGeometry.w,
        DartGeometry.l, //1
        DartGeometry.w,
        DartGeometry.w,
        DartGeometry.l, //2
        -DartGeometry.w,
        DartGeometry.w,
        DartGeometry.l, //3
        //bottom face
        -DartGeometry.w,
        -DartGeometry.w,
        DartGeometry.l, //4
        -DartGeometry.w,
        -DartGeometry.w,
        DartGeometry.w - DartGeometry.l, //5
        DartGeometry.w,
        -DartGeometry.w,
        DartGeometry.w - DartGeometry.l, //6
        DartGeometry.w,
        -DartGeometry.w,
        DartGeometry.l, //7
        //right face
        DartGeometry.w,
        -DartGeometry.w,
        DartGeometry.l, //8
        DartGeometry.w,
        -DartGeometry.w,
        DartGeometry.w - DartGeometry.l, //9
        DartGeometry.w,
        DartGeometry.w,
        DartGeometry.w - DartGeometry.l, //10
        DartGeometry.w,
        DartGeometry.w,
        DartGeometry.l, //11
        //top face
        -DartGeometry.w,
        DartGeometry.w,
        DartGeometry.l, //12
        DartGeometry.w,
        DartGeometry.w,
        DartGeometry.l, //13
        DartGeometry.w,
        DartGeometry.w,
        DartGeometry.w - DartGeometry.l, //14
        -DartGeometry.w,
        DartGeometry.w,
        DartGeometry.w - DartGeometry.l, //15
        //left face
        -DartGeometry.w,
        -DartGeometry.w,
        DartGeometry.l, //16,
        -DartGeometry.w,
        -DartGeometry.w,
        DartGeometry.w - DartGeometry.l, //17,
        -DartGeometry.w,
        DartGeometry.w,
        DartGeometry.w - DartGeometry.l, //18,
        -DartGeometry.w,
        DartGeometry.w,
        DartGeometry.l, //19,

        // Tip
        //bottom face
        -DartGeometry.w,
        -DartGeometry.w,
        DartGeometry.w - DartGeometry.l, //20,
        0,
        0,
        -DartGeometry.l, //21,
        DartGeometry.w,
        -DartGeometry.w,
        DartGeometry.w - DartGeometry.l, //22,
        //right face
        DartGeometry.w,
        -DartGeometry.w,
        DartGeometry.w - DartGeometry.l, //23
        0,
        0,
        -DartGeometry.l, //24
        DartGeometry.w,
        DartGeometry.w,
        DartGeometry.w - DartGeometry.l, //25
        //top face
        -DartGeometry.w,
        DartGeometry.w,
        DartGeometry.w - DartGeometry.l, //26
        0,
        0,
        -DartGeometry.l, //27
        DartGeometry.w,
        DartGeometry.w,
        DartGeometry.w - DartGeometry.l, //28
        //DartGeometry.left face
        -DartGeometry.w,
        -DartGeometry.w,
        DartGeometry.w - DartGeometry.l, //29
        0,
        0,
        -DartGeometry.l, //30
        -DartGeometry.w,
        DartGeometry.w,
        DartGeometry.w - DartGeometry.l, //31

        // Fins are double sided
        //bottom fin
        0,
        -DartGeometry.w,
        DartGeometry.l, //32
        0,
        -DartGeometry.w,
        DartGeometry.l - 2 * DartGeometry.f, //33
        0,
        -DartGeometry.w - DartGeometry.f,
        DartGeometry.l, //34
        0,
        -DartGeometry.w,
        DartGeometry.l, //35
        0,
        -DartGeometry.w,
        DartGeometry.l - 2 * DartGeometry.f, //36
        0,
        -DartGeometry.w - DartGeometry.f,
        DartGeometry.l, //37
        //right fin
        DartGeometry.w,
        0,
        DartGeometry.l, //38
        DartGeometry.w,
        0,
        DartGeometry.l - 2 * DartGeometry.f, //39
        DartGeometry.w + DartGeometry.f,
        0,
        DartGeometry.l, //40
        DartGeometry.w,
        0,
        DartGeometry.l, //41
        DartGeometry.w,
        0,
        DartGeometry.l - 2 * DartGeometry.f, //42
        DartGeometry.w + DartGeometry.f,
        0,
        DartGeometry.l, //43
        //top fin
        0,
        DartGeometry.w,
        DartGeometry.l, //44
        0,
        DartGeometry.w,
        DartGeometry.l - 2 * DartGeometry.f, //45
        0,
        DartGeometry.w + DartGeometry.f,
        DartGeometry.l, //46
        0,
        DartGeometry.w,
        DartGeometry.l, //47
        0,
        DartGeometry.w,
        DartGeometry.l - 2 * DartGeometry.f, //48
        0,
        DartGeometry.w + DartGeometry.f,
        DartGeometry.l, //49
        //DartGeometry.left fin
        -DartGeometry.w,
        0,
        DartGeometry.l, //50
        -DartGeometry.w,
        0,
        DartGeometry.l - 2 * DartGeometry.f, //51
        -DartGeometry.w - DartGeometry.f,
        0,
        DartGeometry.l, //52
        -DartGeometry.w,
        0,
        DartGeometry.l, //53
        -DartGeometry.w,
        0,
        DartGeometry.l - 2 * DartGeometry.f, //54
        -DartGeometry.w - DartGeometry.f,
        0,
        DartGeometry.l, //55
    ]);

    static indices = [
        // Body
        //front face
        0, 1, 2, 2, 3, 0,
        //bottom face
        4, 5, 6, 6, 7, 4,
        //right face
        8, 9, 10, 10, 11, 8,
        //top face
        12, 13, 14, 14, 15, 12,
        //left face
        18, 17, 16, 16, 19, 18,

        // Tip
        //bottom face
        20, 21, 22,
        //right face
        23, 24, 25,
        //top face
        28, 27, 26,
        //left face
        31, 30, 29,

        // Fins are double sided
        //bottom fin
        32, 33, 34, 37, 36, 35,
        //right fin
        38, 39, 40, 43, 42, 41,
        //top fin
        44, 45, 46, 49, 48, 47,
        //left fin
        50, 51, 52, 55, 54, 53,
    ];

    static normals = new Float32Array([
        // Body
        //front face
        0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
        //bottom face
        0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
        //right face
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
        //top face
        0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
        //left face
        -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,

        // Tip
        //bottom face
        0, -1, -1, 0, -1, -1, 0, -1, -1, 0, -1, -1,
        //right face
        1, 0, -1, 1, 0, -1, 1, 0, -1, 1, 0, -1,
        //top face
        0, 1, -1, 0, 1, -1, 0, 1, -1, 0, 1, -1,
        //left face
        -1, 0, -1, -1, 0, -1, -1, 0, -1, -1, 0, -1,

        // Fins are double sided
        //bottom fin
        -1, 0, 0, -1, 0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
        //right fin
        0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
        //top fin
        -1, 0, 0, -1, 0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
        //left fin
        0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
    ]);

    //scale
    scalingMatrix(sx, sy, sz) {
        return new THREE.Matrix4().set(
            sx,
            0,
            0,
            0,
            0,
            sy,
            0,
            0,
            0,
            0,
            sz,
            0,
            0,
            0,
            0,
            1
        );
    }

    constructor(size = 10) {
        super();
        this.setAttribute(
            "position",
            new THREE.BufferAttribute(DartGeometry.positions, 3)
        );
        this.setAttribute(
            "normal",
            new THREE.BufferAttribute(DartGeometry.normals, 3)
        );
        this.setIndex(
            new THREE.BufferAttribute(new Uint16Array(DartGeometry.indices), 1)
        );
        this.applyMatrix4(this.scalingMatrix(size, size, size));
    }
}

const FLOOR_Y = 0;
export default class Dart {
    static GRAVITY = -30;
    static GRAVITY_SCALE = 1 / 250;
    static INITIAL_LIFETIME = 3;
    static SIZE = 3;
    static STATES = {
        flying: 0,
        stuck: 1,
    };

    static GEOMETRY = new DartGeometry(Dart.SIZE);

    color = 0x555555;
    speed = -60; //along negative z

    state = Dart.STATES.flying;
    lifetime = Dart.INITIAL_LIFETIME;

    constructor(scene, camera) {
        let dartMat = new THREE.MeshPhongMaterial({
            color: this.color,
            specular: 0x999999,
            shininess: 0.9,
            transparent: false,
        });

        const dart = new THREE.Mesh(Dart.GEOMETRY, dartMat);
        this.dart = dart;
        this.state = Dart.STATES.flying;
        dart.position.copy(camera.position);
        scene.add(dart);
        dart.quaternion.copy(camera.quaternion);
        dart.translateZ(-4);
        // console.log("dart created");
    }

    animate(delta) {
        if (this.state === Dart.STATES.stuck) {
            if (this.lifetime > 0) {
                this.lifetime -= delta;
            } else {
                // return true if dart should be removed
                return true;
            }
            return false;
        }
        const rotation = new THREE.Euler().setFromQuaternion(
            this.dart.quaternion,
            "YXZ"
        );
        rotation.x = THREE.MathUtils.clamp(
            rotation.x + Dart.GRAVITY * Dart.GRAVITY_SCALE * Math.PI * delta,
            -Math.PI / 2,
            Math.PI / 2
        );
        this.dart.quaternion.setFromEuler(rotation);

        const direction = new THREE.Vector3();
        this.dart.getWorldDirection(direction);
        this.dart.applyMatrix4(
            translationMatrix(
                direction.x * this.speed * delta,
                direction.y * this.speed * delta,
                direction.z * this.speed * delta
            )
        );

        if (this.dart.position.y < FLOOR_Y) {
            this.state = Dart.STATES.stuck;
            console.log(
                `Dart stuck at ${this.dart.position.x}, ${this.dart.position.z}`
            );
            this.dart.position.y = FLOOR_Y;
        }
        return false;
    }
}
