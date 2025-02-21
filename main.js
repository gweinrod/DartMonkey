import * as THREE from "three";
import DartGeometry from "./dart";
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
const DART_COLOR = 0x555555
const DART_SIZE = 3;
const DART_SPEED = -60; //along negative z
const DART_GRAVITY_SCALE = 1/250;

//objects
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(FOV, ASPECT, NEAR, FAR);

//variables
let balloons = [];
let darts = [];
let clock = new THREE.Clock();
let time = 0;   //elapsed time
let delta = 0;  //time since last animate
let last = 0;   //time of last animate
let felta = 0   //time since last dart fire
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
const GRAVITY = -30  ;  
const JUMP_STRENGTH = 20;

/* End Initializations */

/* Transformations */

//translate
function translationMatrix(tx, ty, tz) {
	return new THREE.Matrix4().set(
		1, 0, 0, tx,
		0, 1, 0, ty,
		0, 0, 1, tz,
		0, 0, 0, 1
	)
};

//rotateX
function rotationMatrixX(theta) {
    return new THREE.Matrix4().set(
        1, 0, 0, 0,
        0, Math.cos(theta), -Math.sin(theta), 0,
        0, Math.sin(theta), Math.cos(theta), 0,
        0, 0, 0, 1
    )
};

//rotateY
function rotationMatrixY(theta) {
    return new THREE.Matrix4().set(
        Math.cos(theta), 0, Math.sin(theta), 0,
        0, 1, 0, 0,
        -Math.sin(theta), 0, Math.cos(theta), 0,
        0, 0, 0, 1
    )
};

//rotateZ
function rotationMatrixZ(theta) {
	return new THREE.Matrix4().set(
		Math.cos(theta), -Math.sin(theta), 0, 0,
		Math.sin(theta),  Math.cos(theta), 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	)
};

//scale
function scalingMatrix(sx, sy, sz) {
	return new THREE.Matrix4().set(
		sx, 0, 0, 0,
		0, sy, 0, 0,
		0, 0, sz, 0,
		0, 0, 0, 1
	)
};

//shearX
function shearMatrixX(shy, shz) {
	return new THREE.Matrix4().set(
		1, 0, 0, 0,
		shy, 1, 0, 0,
		shz, 0, 1, 0,
		0, 0, 0, 1
	)
};

//shearY
function shearMatrixY(shx, shz) {
	return new THREE.Matrix4().set(
		1, shx, 0, 0,
		0, 1, 0, 0,
		0, shz, 1, 0,
		0, 0, 0, 1
	)
};

//shearZ
function shearMatrixZ(shx, shy) {
	return new THREE.Matrix4().set(
		1, 0, shx, 0,
		0, 1, shy, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	)
};

//TODO: Custom Ballon Transformations
//eg poppping
//eg blown by wind
//eg bouncing

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

let dartGeom = new DartGeometry(DART_SIZE);
//darts
function createDart() {
    let dartMat = new THREE.MeshPhongMaterial({
        color: DART_COLOR,
        specular: 0x999999,
        shininess: .90,
        transparent: false  } );

    let dart = new THREE.Mesh(dartGeom, dartMat);
    dart.position.copy(camera.position);
    darts.push(dart);
    scene.add(dart);
    console.log("dart created\n")
    return dart;
}

let balloonGeom = new THREE.SphereGeometry(BALLOON_RADIUS, 32, 32);
let vertices = balloonGeom.attributes.position;

for (let i = 0; i < vertices.count; i++) {
    let x = vertices.getX(i);
    let y = vertices.getY(i);
    let z = vertices.getZ(i);

    if (y <= 0) {
        let factor = 1 + y * 0.05;
        vertices.setX(i, x * factor);
        vertices.setZ(i, z * factor);
        vertices.setY(i, y * 0.95);
    } else if (y > 0) {
        vertices.setY(i, y * 0.8);
    }
}

balloonGeom.attributes.position.needsUpdate = true;

function createBalloon(color, position) 
{
    let balloonMat = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.3,
        metalness: 0.2,
    });
    let balloon = new THREE.Mesh(balloonGeom, balloonMat);

    //use matrices for geometries, three.js calls for imports
    let transformations = new THREE.Matrix4();
    transformations.multiplyMatrices(scalingMatrix(1, 1.4, 1), transformations);
    transformations.multiplyMatrices(
        translationMatrix(position.x, position.y, position.z),
        transformations
    );
    balloon.matrix.copy(transformations);
    balloon.matrixAutoUpdate = false;

    balloons.push(balloon);
    scene.add(balloon);
    return balloon;
}

//demo balloons

const BALLOON_COLORS = {red:0xff0000, green: 0x10cc10, blue: 0x0000ff, yellow: 0xffff00, orange: 0xff7020, purple: 0xff00ff, white: 0xffffff, black:0x000000}

createBalloon(BALLOON_COLORS.red, { x: -20, y: 0, z: 0 });
createBalloon(BALLOON_COLORS.orange, { x: -10, y: 0, z: 0 });
createBalloon(BALLOON_COLORS.yellow, { x: 0, y: 0, z: 0 });
createBalloon(BALLOON_COLORS.green, { x: 10, y: 0, z: 0 });
createBalloon(BALLOON_COLORS.blue, { x: 20, y: 0, z: 0 });

createBalloon(BALLOON_COLORS.red, { x: -20, y: 5, z: 0 });
createBalloon(BALLOON_COLORS.orange, { x: -10, y: 5, z: 0 });
createBalloon(BALLOON_COLORS.yellow, { x: 0, y: 5, z: 0 });
createBalloon(BALLOON_COLORS.green, { x: 10, y: 5, z: 0 });
createBalloon(BALLOON_COLORS.blue, { x: 20, y: 5, z: 0 });

createBalloon(BALLOON_COLORS.red, { x: -20, y: 10, z: 0 });
createBalloon(BALLOON_COLORS.orange, { x: -10, y: 10, z: 0 });
createBalloon(BALLOON_COLORS.yellow, { x: 0, y: 10, z: 0 });
createBalloon(BALLOON_COLORS.green, { x: 10, y: 10, z: 0 });
createBalloon(BALLOON_COLORS.blue, { x: 20, y: 10, z: 0 });

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
                isJumping ++;
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
        let dart = darts[i];
        let dartPos = new THREE.Vector3();
        let dartDir = new THREE.Vector3();
        dart.getWorldPosition(dartPos);
        dart.getWorldDirection(dartDir);
        dartPos = dartPos.add(dartDir.multiplyScalar(DART_SIZE)); //tip of dart
        
        //remove out of bounds darts
        if (!skyGeom.boundingSphere.containsPoint(dartPos)) {
            scene.remove(dart);
            darts.splice(i,1);
            continue;
        }

        //loop through all balloons for each dart
        for (let j = balloons.length - 1; j >= 0; j--) {
           
            //get balloon
            let balloon = balloons[j];
            let balloonPos = new THREE.Vector3();
            balloon.getWorldPosition(balloonPos);

            //create bounding sphere to detect when the dart is on or inside it
            let balloonVicinity = new THREE.Sphere(balloonPos, balloon.geometry.boundingSphere.radius);

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
window.addEventListener('blur', () => {
    moves.W = false;
    moves.A = false;
    moves.S = false;
    moves.D = false;
});

//mouse clicks
document.addEventListener("click", (e) => {
    if (!firing) {
        let direction = new THREE.Vector3;
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

function shootDart(direction) {
    let dart = createDart();
    dart.rotation.copy(camera.rotation);
    dart.translateZ(-4);
};

/* End Game Logic */

/* Animation Functions */
function animateBalloon(balloon, index) {
    let time = clock.getElapsedTime();
    balloon.position.y += Math.sin(time + index) * 0.01;
};

function animateDart(dart, delta) {

    //pitch before yaw (though we don't yaw here, it's already yawed if not shot at <0,0,-1>)
    let rotation = new THREE.Euler().setFromQuaternion(dart.quaternion, "YXZ");
    rotation.x = THREE.MathUtils.clamp(
        rotation.x + GRAVITY * DART_GRAVITY_SCALE * Math.PI * delta,
        -Math.PI / 2,
        Math.PI / 2
    );
    dart.quaternion.setFromEuler(rotation);

    let direction = new THREE.Vector3;
    dart.getWorldDirection(direction);
    dart.applyMatrix4(translationMatrix(
        (direction.x * DART_SPEED * delta), 
        (direction.y * DART_SPEED * delta), 
        (direction.z * DART_SPEED * delta))
    );

};

/* End Animation Functions */

/* Animate */
function animate() {
    requestAnimationFrame(animate);
    time = clock.getElapsedTime();
    delta = time - last;
    last = time;
  
    // TODO: trig f'n modulate sky color based on elapsed

    // TODO: Loop Balloons
    balloons.forEach((balloon, index) => animateBalloon(balloon, index));

    // TODO: Loop Darts
    darts.forEach((dart) => animateDart(dart, delta));

    //disable controls
    // TODO: Animate Character
    // TODO: Move Camera

    updatePlayerMovement();
    
    //engage automatic fire on long mouse hold
    if (firing) {
        felta += delta
        if (felta >= 4*(1/10)) automatic = true;
    }

    //automatic fire
    if (automatic && felta >= 1/FIRE_RATE) {
        let direction = new THREE.Vector3;
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
