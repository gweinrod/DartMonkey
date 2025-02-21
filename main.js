import * as THREE from "three";
import Dart from "./dart";
import Balloon from "./balloon";
import { scalingMatrix, translationMatrix } from "./transformations";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/* Initializations */

//constants
const WORLDSIZE = 1000;
const SKYBLUE = 0x8bdafc;

const FOV = 60;
const ASPECT = window.innerWidth / window.innerHeight;
const NEAR = 0.1;
const FAR = WORLDSIZE * 1.5;
const BALLOON_RADIUS = 2;
const FIRE_RATE = 5; //darts per second
const DART_COLOR = 0x555555;
const DART_SIZE = 3;
const DART_SPEED = -60; //along negative z
const DART_GRAVITY_SCALE = 1 / 250;

const DART_STATES = {
    flying: 0,
    stuck: 1,
};

//objects
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(FOV, ASPECT, NEAR, FAR);

//variables
let balloons = [];
let darts = [];
let clock = new THREE.Clock();
let time = 0; //elapsed time
let delta = 0; //time since last animate
let last = 0; //time of last animate
let felta = 0; //time since last dart fire
let firing = false;
let automatic = false;

let moves = {
    W: false,
    A: false,
    S: false,
    D: false,
};

const playerProperties = {
    velocity: new THREE.Vector3(0, 0, 0),
    ACCELERATION: 5,
    MAX_XZ_SPEED: 30,
    FRICTION: 0.85,
};

//physics elements for jumping
let isJumping = 0;
let velocityY = 0;
const GRAVITY = -30;
const JUMP_STRENGTH = 20;

/* End Initializations */

/* Transformations */

/* End Transformations */

/* Geometries */

//sky
let skyGeom = new THREE.SphereGeometry(WORLDSIZE, 32, 32);
let skyMat = new THREE.MeshStandardMaterial({
    color: SKYBLUE,
    side: THREE.BackSide,
});
let sky = new THREE.Mesh(skyGeom, skyMat);
scene.add(sky);

//player

//cursor
const cursorTexture = new THREE.TextureLoader().load("./images/cursor.png");
const cursorMaterial = new THREE.SpriteMaterial({
    map: cursorTexture,
    // color: 0xffffff,
});
cursorMaterial.depthTest = false;
cursorMaterial.depthWrite = false;
const cursorSprite = new THREE.Sprite(cursorMaterial);

scene.add(cursorSprite);
// camera.add(cursorSprite);

function createBalloon(color, position) {
    balloons.push(new Balloon({ color, position }, scene));
}
function createBalloonWithWaypoints(color, waypoints) {
    balloons.push(new Balloon({ color, waypoints }, scene));
}

//demo balloons
let balloon_demo_x = -20;
for (const color in Balloon.COLORS) {
    for (let i = 0; i <= 20; i += 10) {
        createBalloon(
            Balloon.COLORS[color],
            new THREE.Vector3(balloon_demo_x, i, 0)
        );
    }
    balloon_demo_x += 10;
}

//details

//large trees and ground
const loader = new GLTFLoader();
loader.load(
    "models/procedural_tree_generator/scene.gltf",
    function (gltf) {
        const tree = gltf.scene;

        // Adjust position, scale, and rotation
        tree.position.set(0, -10, 0);
        tree.scale.set(5, 5, 5);

        scene.add(tree);

        // Clone trees after the model is loaded
        for (let i = 0; i < 1; i++) {
            //let treeClone = tree.clone();
            tree.position.set(10, -7, Math.random() * 10 - 5);
            scene.add(tree);
        }
    },
    undefined,
    function (error) {
        console.error("Error loading model:", error);
    }
);

//small tree

//rock

/* End Geometries */

/* Camera */

camera.position.set(0, 0, 30);
camera.lookAt(0, 0, 0);

/* End Camera */

/* Renderer */

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", onWindowResize, false);

/* End Renderer */

/* Lighting */

const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
directionalLight.position.set(10, 20, 10);
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xffffff, 0.5);
pointLight.position.set(10, 5, -5);
scene.add(pointLight);

const ambientLight = new THREE.AmbientLight(0x404040, 5);
scene.add(ambientLight);

/* End Lighting */

/* Controls */

const canvas = document.querySelector("canvas");

//keycodes at https://www.toptal.com/developers/keycode/table search KeyW KeyA KeyS KeyD
function onKeyDown(event) {
    switch (event.keyCode) {
        case 87: // 'W' key
            moves.W = true;
            break;
        case 65: // 'A' key
            moves.A = true;
            break;
        case 83: // 'S' key
            moves.S = true;
            break;
        case 68: // 'D' key
            moves.D = true;
            break;
        //TODO JUMP
        case 32: // 'SPACE' key
            if (isJumping <= 1) {
                playerProperties.velocity.y = JUMP_STRENGTH; // Apply jump force
                isJumping++;
            }
            break;
        //TODO UI Controls
    }
}
document.addEventListener("keydown", onKeyDown, false);

function onKeyUp(event) {
    switch (event.keyCode) {
        case 87: // 'W' key
            moves.W = false;
            break;
        case 65: // 'A' key
            moves.A = false;
            break;
        case 83: // 'S' key
            moves.S = false;
            break;
        case 68: // 'D' key
            moves.D = false;
            break;
        //TODO JUMP
        case 32: // 'SPACE' key
            //isJumping = false;
            break;
        //TODO UI Controls
    }
}
document.addEventListener("keyup", onKeyUp, false);

//mouse controls

canvas.addEventListener("click", () => {
    canvas.requestPointerLock();
});
let cameraYaw = 0;
let cameraPitch = 0;
const sensitivity = 0.002;

document.addEventListener("mousemove", (event) => {
    if (document.pointerLockElement === canvas) {
        cameraYaw -= event.movementX * sensitivity;
        cameraPitch -= event.movementY * sensitivity;

        // Quaternions prevent gimbal lock

        cameraPitch = Math.max(
            -Math.PI / 2,
            Math.min(Math.PI / 2, cameraPitch)
        );

        const yawQuat = new THREE.Quaternion();
        yawQuat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), cameraYaw);

        const pitchQuat = new THREE.Quaternion();
        pitchQuat.setFromAxisAngle(new THREE.Vector3(1, 0, 0), cameraPitch);

        // global rotation for yaw, then local rotation for pitch
        camera.quaternion.copy(yawQuat).multiply(pitchQuat);
    }
});

const getYawFromQuaternion = (q) => {
    const euler = new THREE.Euler();
    // ensures Y extracted first (gimbal lock safe)
    euler.setFromQuaternion(q, "YXZ");
    return euler.y;
};

const updatePlayerMovement = () => {
    const inputDirection = new THREE.Vector3();

    const forward = new THREE.Vector3(0, 0, -1);
    const right = new THREE.Vector3(1, 0, 0);
    const cameraYaw = getYawFromQuaternion(camera.quaternion);
    forward.applyEuler(new THREE.Euler(0, cameraYaw, 0));
    right.applyEuler(new THREE.Euler(0, cameraYaw, 0));

    if (moves.W) inputDirection.add(forward);
    if (moves.A) inputDirection.addScaledVector(right, -1);
    if (moves.S) inputDirection.addScaledVector(forward, -1);
    if (moves.D) inputDirection.add(right);

    const playerXZVelocity = new THREE.Vector3(
        playerProperties.velocity.x,
        0,
        playerProperties.velocity.z
    );

    if (inputDirection.lengthSq() > 0) {
        inputDirection.normalize();
        playerXZVelocity.addScaledVector(
            inputDirection,
            playerProperties.ACCELERATION
        );
        playerXZVelocity.clampLength(0, playerProperties.MAX_XZ_SPEED);
    } else {
        playerXZVelocity.multiplyScalar(playerProperties.FRICTION);
        if (playerXZVelocity.lengthSq() < 0.001) {
            playerXZVelocity.set(0, 0, 0);
        }
    }

    let playerYVelocity = playerProperties.velocity.y;

    if (isJumping > 0) {
        playerYVelocity += GRAVITY * delta;
    }

    playerProperties.velocity.set(
        playerXZVelocity.x,
        playerYVelocity,
        playerXZVelocity.z
    );
};

//collision detection
function checkCollisions(darts, balloons) {
    //loop through all darts
    for (let i = darts.length - 1; i >= 0; i--) {
        //get dart
        const dart = darts[i].dart;
        let dartPos = new THREE.Vector3();
        let dartDir = new THREE.Vector3();
        dart.getWorldPosition(dartPos);
        dart.getWorldDirection(dartDir);
        dartDir.normalize();
        dartPos = dartPos.add(dartDir.multiplyScalar(DART_SIZE / 2)); //tip of dart

        //remove out of bounds darts
        if (!skyGeom.boundingSphere.containsPoint(dartPos)) {
            scene.remove(dart);
            darts.splice(i, 1);
            continue;
        }

        //loop through all balloons for each dart
        for (let j = balloons.length - 1; j >= 0; j--) {
            //get balloon
            let balloon = balloons[j].balloon;
            let balloonPos = new THREE.Vector3();
            balloon.getWorldPosition(balloonPos);

            //create bounding sphere to detect when the dart is on or inside it
            let balloonVicinity = new THREE.Sphere(
                balloonPos,
                balloons[j].geometry.boundingSphere.radius
            );

            //delete both dart and balloon if collision detected - can be changed to just delete balloon later?
            if (balloonVicinity.containsPoint(dartPos)) {
                console.log("collision detected: dart %d hit Balloon %d", i, j);
                scene.remove(balloon);
                balloons.splice(j, 1);
                scene.remove(dart);
                darts.splice(i, 1);
                //stop checking once we do the removal
                //break;
            }

            //TODO collide with tree and stick, remove dart from array (not scene)
        }
    }
}

//no right clicking browser menus
canvas.addEventListener(
    "contextmenu",
    (e) => {
        e.preventDefault();
    },
    false
);

//clear movement when window loses focus, or miss keyUp events
window.addEventListener("blur", () => {
    moves.W = false;
    moves.A = false;
    moves.S = false;
    moves.D = false;
});

//mouse clicks
document.addEventListener("click", (e) => {
    if (!firing) {
        let direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        shootDart(direction);
    }
});

//mouse hold
document.addEventListener("mousedown", (e) => {
    firing = true;
});
//mouse hold
document.addEventListener("mouseup", (e) => {
    firing = false;
});

/* End Controls */

/* Game Logic */

// let sinceLastDart = 0;

function shootDart(direction) {
    darts.push(new Dart(scene, camera));
}

/* End Game Logic */

/* Animation Functions */
/* End Animation Functions */

/* Animate */

let balloonTimer = 0;
const balloonSpawnInterval = 2;
function animate() {
    requestAnimationFrame(animate);
    time = clock.getElapsedTime();
    delta = time - last;
    last = time;

    // TODO: trig f'n modulate sky color based on elapsed
    balloonTimer += delta;
    if (balloonTimer >= balloonSpawnInterval) {
        createBalloonWithWaypoints(Balloon.COLORS.red, [
            new THREE.Vector3(-5, 0, 1),
            new THREE.Vector3(5, 0, 32),
            new THREE.Vector3(19, 0, 27),
        ]);
        balloonTimer = 0;
    }

    // TODO: Loop Balloons
    for (let i = balloons.length - 1; i >= 0; i--) {
        if (balloons[i].animate(time, delta)) {
            scene.remove(balloons[i].balloon);
            balloons.splice(i, 1);
        }
    }

    // TODO: Loop Darts
    for (let i = darts.length - 1; i >= 0; i--) {
        if (darts[i].animate(delta)) {
            scene.remove(darts[i].dart);
            darts.splice(i, 1);
        }
    }

    //disable controls
    // TODO: Animate Character
    // TODO: Move Camera

    updatePlayerMovement();

    //engage automatic fire on long mouse hold
    if (firing) {
        felta += delta;
        if (felta >= 4 * (1 / 10)) automatic = true;
    }

    //automatic fire
    if (automatic && felta >= 1 / FIRE_RATE) {
        let direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        shootDart(direction);
        felta = 0;
    }

    checkCollisions(darts, balloons);

    const cameraVelocity = playerProperties.velocity.clone();
    cameraVelocity.multiplyScalar(delta);
    camera.position.add(cameraVelocity);

    if (camera.position.y <= 0) {
        camera.position.y = 0;
        playerProperties.velocity.y = 0;
        isJumping = false;
    }

    cursorSprite.position.copy(camera.position);
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);

    // workaround for cursor sprite not working when added to camera (probably adds at corner of reticule not center)
    cursorSprite.position.addScaledVector(cameraDirection, 9);

    //enable controls

    // TODO: Apply Shaders

    renderer.render(scene, camera);
}
animate();

/* End Animate */

//EOF
