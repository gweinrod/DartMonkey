import * as THREE from "three";
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import Dart from "./dart";
import Balloon from "./balloon";

/* Initializations */

//model files
const FLOOR_OBJ = "/models/DartMonkey_Floor_Forest.obj";
const FLOOR_MTL = "/models/DartMonkey_Floor_Forest.mtl";
const TREE_A_OBJ = "/models/LowPoly_TREE_A.obj";
const TREE_A_MTL = "/models/LowPoly_TREE_A.mtl";

//constants
const WORLDSIZE = 100;
const SKYBLUE = 0x8bdafc;
const PLAYER_HEIGHT = 3;
const BALLOON_MIN_Y = 6;
const FLOOR_Y = 0;
const FOV = 60;
const ASPECT = window.innerWidth / window.innerHeight;
const NEAR = 0.1;
const FAR = WORLDSIZE * 2;
const FIRE_RATE = 6; //darts per second
const DART_SIZE = 3;
const LERP_TOL = 2; //divided by 10 units allowed overlap between balloons

//scene and camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(FOV, ASPECT, NEAR, FAR);

//Object loader
const matLoader = new MTLLoader();
const objLoader = new OBJLoader();
const glbLoader = new GLTFLoader();

//variables
let balloons = [];
let darts = [];
let clock = new THREE.Clock();
let time = 0; //elapsed time
let delta = 0; //time since last animate
let last = 0; //time of last animate
let dartTimer = 0; //time since last dart fire
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
    MAX_XZ_SPEED: 20,
    FRICTION: 0.10,
};

//physics elements for jumping
let isJumping = 0;
const GRAVITY = -36;
const JUMP_STRENGTH = 36;

//bounding boxes for collision between player and world
const objectBoundingBoxes = [];
const playerBoundingBox = new THREE.Box3();
let boundingSpheres = [];
const playerSize = new THREE.Vector3(1.5, PLAYER_HEIGHT*0.5, 1.5);
//const boxHelper = new THREE.Box3Helper(playerBoundingBox, 0x00ff00); // Green outline
//scene.add(boxHelper);

/* End Initializations */

/* Transformations */

/* End Transformations */

/* Geometries */

//grass
let grassMaterial = new THREE.MeshPhongMaterial({
    color: 0x326732,
    shininess: 1,
    specular: new THREE.Color(0x165516)
});

//floor
let floor = null; //check null before animating
objLoader.load(FLOOR_OBJ, (level) => {
    floor = level;
    floor.children[0].material = grassMaterial;
    scene.add(floor);
});

//environment

//trees
let trees = [];



const TREES_MIN=5;
const TREES_MAX=15;
const FLOWERS_MIN=25;
const FLOWERS_MAX=100;

const TREES = TREES_MIN + Math.random()*(TREES_MAX - TREES_MIN);
const FLOWERS = FLOWERS_MIN + Math.random()*(FLOWERS_MAX - FLOWERS_MIN);


//todo refactor model clones
function glb(n){

}

//large trees
glbLoader.load(
    "models/LowPoly_TREE_A.glb",
    function (glb) {
        const model = glb.scene;

        // Create trees from the model after the model is loaded
        for (let i = 0; i < TREES; i++) {
            let tree = model.clone();

            //scale
            let s = 1 + 2*Math.random(); //1-3x
            tree.scale.set(s, s, s); //proportional
            tree.rotateY(Math.random()*Math.PI)

            //position
            let px = 2*WORLDSIZE*Math.random() - WORLDSIZE;
            let pz = 2*WORLDSIZE*Math.random() - WORLDSIZE;
            tree.position.set(px, 0, pz);

            scene.add(tree);

            //need to manually set x and z max and min

            let box = new THREE.Box3().setFromObject(tree);
            box.expandByScalar(-15);
            box.min.y = 0;
            box.max.y = 25;
            box.min.x = tree.position.x-2;
            box.max.x = tree.position.x+2;
            box.min.z = tree.position.z-2;
            box.max.z = tree.position.z+2;
            objectBoundingBoxes.push(box); 

            // const boxHelper = new THREE.Box3Helper(box, 0xff0000); // red outline
            // scene.add(boxHelper);
        }
    },
    undefined,
    function (error) {
        console.error("Error loading model:", error);
    }
);

//small trees
glbLoader.load(
    "models/LowPoly_TREE_B.glb",
    function (glb) {
        const model = glb.scene;

        // Create trees from the model after the model is loaded
        for (let i = 0; i < TREES*2; i++) {
            let tree = model.clone();

            //scale
            let s = 1 + 2*Math.random(); //1-3x
            tree.scale.set(s, s, s); //proportional
            tree.rotateY(Math.random()*Math.PI)

            //TODO wrap while (tree does not intersect skysphere)
            //position
            let px = 2*WORLDSIZE*Math.random() - WORLDSIZE;
            let pz = 2*WORLDSIZE*Math.random() - WORLDSIZE;
            tree.position.set(px, 0, pz);

            scene.add(tree);

            let box = new THREE.Box3().setFromObject(tree);
            box.expandByScalar(-2);
            box.min.y = 0;
            box.min.x = tree.position.x-1;
            box.max.x = tree.position.x+1;
            box.min.z = tree.position.z-1;
            box.max.z = tree.position.z+1;
            objectBoundingBoxes.push(box);

            // const boxHelper = new THREE.Box3Helper(box, 0x0000ff); // blue outline
            // scene.add(boxHelper);
        }
    },
    undefined,
    function (error) {
        console.error("Error loading model:", error);
    }
);

//dead trees
glbLoader.load(
    "models/LowPoly_TREE_C.glb",
    function (glb) {
        const model = glb.scene;

        // Create trees from the model after the model is loaded
        for (let i = 0; i < TREES/3; i++) {
            let tree = model.clone();

            //scale
            let s = 1 + 2*Math.random(); //1-3x
            tree.scale.set(s, s, s); //proportional
            tree.rotateY(Math.random()*Math.PI)

            //TODO wrap while (tree does not intersect skysphere)
            //position
            let px = 2*WORLDSIZE*Math.random() - WORLDSIZE;
            let pz = 2*WORLDSIZE*Math.random() - WORLDSIZE;
            tree.position.set(px, 0, pz);

            scene.add(tree);

            let box = new THREE.Box3().setFromObject(tree);
            box.expandByScalar(-1);
            objectBoundingBoxes.push(box);

            // const boxHelper = new THREE.Box3Helper(box, 0xffffff); // white outline
            // scene.add(boxHelper);
        }
    },
    undefined,
    function (error) {
        console.error("Error loading model:", error);
    }
);

//logs
glbLoader.load(
    "models/LowPoly_TREE_D.glb",
    function (glb) {
        const model = glb.scene;

        // Create trees from the model after the model is loaded
        for (let i = 0; i < TREES/2; i++) {
            let tree = model.clone();

            //scale
            let s = 1 + Math.random(); //1-2x
            tree.scale.set(s, s, s); //proportional
            tree.rotateY(Math.random()*Math.PI)

            //TODO wrap while (tree does not intersect skysphere)
            //position
            let px = 2*WORLDSIZE*Math.random() - WORLDSIZE;
            let pz = 2*WORLDSIZE*Math.random() - WORLDSIZE;
            tree.position.set(px, 0, pz);

            scene.add(tree);

            let box = new THREE.Box3().setFromObject(tree);
            box.min.y = 0;
            box.expandByScalar(-1);
            objectBoundingBoxes.push(box);

            // const boxHelper = new THREE.Box3Helper(box, 0x00ff00); // Green outline
            // scene.add(boxHelper);
        }
    },
    undefined,
    function (error) {
        console.error("Error loading model:", error);
    }
);

//white flowers
glbLoader.load(
    "models/LowPoly_TREE_E.glb",
    function (glb) {
        const model = glb.scene;

        // Create trees from the model after the model is loaded
        for (let i = 0; i < FLOWERS; i++) {
            let tree = model.clone();

            //scalew
            let s = 1 + Math.random(); //1-2x
            tree.scale.set(s, s, s); //proportional
            tree.rotateY(Math.random()*Math.PI)

            //TODO wrap while (tree does not intersect skysphere)
            //position
            let px = 2*WORLDSIZE*Math.random() - WORLDSIZE;
            let pz = 2*WORLDSIZE*Math.random() - WORLDSIZE;
            tree.position.set(px, 0, pz);

            scene.add(tree);
        }
    },
    undefined,
    function (error) {
        console.error("Error loading model:", error);
    }
);

//blue flowers
glbLoader.load(
    "models/LowPoly_TREE_F.glb",
    function (glb) {
        const model = glb.scene;

        // Create trees from the model after the model is loaded
        for (let i = 0; i < FLOWERS; i++) {
            let tree = model.clone();

            //scale
            let s = 1 + Math.random(); //1-2x
            tree.scale.set(s, s, s); //proportional
            tree.rotateY(Math.random()*Math.PI)

            //TODO wrap while (tree does not intersect skysphere)
            //position
            let px = 2*WORLDSIZE*Math.random() - WORLDSIZE;
            let pz = 2*WORLDSIZE*Math.random() - WORLDSIZE;
            tree.position.set(px, 0, pz);

            scene.add(tree);
        }
    },
    undefined,
    function (error) {
        console.error("Error loading model:", error);
    }
);

//sky
let skyGeometry = new THREE.SphereGeometry(WORLDSIZE, 32, 32);
let skyMaterial = new THREE.MeshStandardMaterial({
    color: SKYBLUE,
    side: THREE.BackSide,
});
let sky = new THREE.Mesh(skyGeometry, skyMaterial);
scene.add(sky);

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

/* End Geometries */

/* Camera */

camera.position.set(0, PLAYER_HEIGHT, 30);
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

const updatePlayerMovement = (balloons) => {
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
        playerXZVelocity.multiplyScalar(1-playerProperties.FRICTION);
        if (playerXZVelocity.lengthSq() < 0.001) {
            playerXZVelocity.set(0, 0, 0);
        }
    }

    let playerYVelocity = playerProperties.velocity.y;

    if (isJumping > 0) {
        playerYVelocity += GRAVITY * delta;
    }

    // Update velocity
    playerProperties.velocity.set(
        playerXZVelocity.x,
        playerYVelocity,
        playerXZVelocity.z
    );

    // Prevent the player from leaving the world
    const sphereCenter = new THREE.Vector3(0, 0, 0); // Center of the sphere (assuming the ground is y = 0)
    const sphereRadius = WORLDSIZE - 5; // Define world boundary with a small buffer

    // Keep player on ground level
    camera.position.y = Math.max(0, Math.min(WORLDSIZE - 5, camera.position.y)); // Clamp Y

    // Compute 2D position on the X-Z plane
    const playerXZ = new THREE.Vector2(camera.position.x, camera.position.z);
    const distanceFromCenter = playerXZ.length();

    if (distanceFromCenter > sphereRadius) {
        // Clamp movement within the circular boundary
        playerXZ.normalize().multiplyScalar(sphereRadius);
        camera.position.x = playerXZ.x;
        camera.position.z = playerXZ.y;
    }



    playerBoundingBox.setFromCenterAndSize(camera.position, playerSize);
    playerBoundingBox.expandByScalar(-0.5); 

    let treeLogCollisionDetected = false;
    let balloonCollisionDetected = true;
    let collidedBalloon = null;

    for (const objectBox of objectBoundingBoxes) {
        if (playerBoundingBox.intersectsBox(objectBox)) {
            console.log("tree/log collision");
            treeLogCollisionDetected = true;
            break;
        }
    }

    boundingSpheres.forEach(sphere => {
        scene.remove(sphere);
    });
    boundingSpheres = [];

    let collidedBalloonPos = new THREE.Vector3();

    //remove previous bounding spheres
    boundingSpheres.forEach(sphere => scene.remove(sphere));
    boundingSpheres = [];

    //handle balloon collisions
    for (let j = balloons.length - 1; j >= 0; j--) {
        let balloon = balloons[j].balloon;
        let balloonPos = new THREE.Vector3();
        balloon.getWorldPosition(balloonPos);

        let balloonBox = new THREE.Box3().setFromCenterAndSize(
            balloonPos, 
            new THREE.Vector3(
                balloon.geometry.boundingSphere.radius * 2,
                balloon.geometry.boundingSphere.radius * 2,
                balloon.geometry.boundingSphere.radius * 2
            )
        );

        if (playerBoundingBox.intersectsBox(balloonBox)) {
            console.log("Balloon-player collision");

            let bounceDirection = new THREE.Vector3(
                playerProperties.velocity.x, 
                Math.abs(playerProperties.velocity.y)+0.5, //slight upward motion
                playerProperties.velocity.z
            );

            if (bounceDirection.lengthSq() > 0) {
                bounceDirection.normalize();
                balloon.position.addScaledVector(bounceDirection, 0.5); 
            }

            break;
        }

        // //debug bounding spheres
        // let sphereGeometry = new THREE.SphereGeometry(balloon.geometry.boundingSphere.radius * 2, 16, 16);
        // let sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
        // let boundingSphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);

        // boundingSphereMesh.position.copy(balloonPos);
        // scene.add(boundingSphereMesh);
        // boundingSpheres.push(boundingSphereMesh);
    }


    if (treeLogCollisionDetected) {
        let movementDirection = new THREE.Vector3(playerProperties.velocity.x, 0, playerProperties.velocity.z);
    
        if (movementDirection.lengthSq() > 0) {
            movementDirection.normalize();
            camera.position.addScaledVector(movementDirection, -0.05);
        }
    
        playerProperties.velocity.set(-100*movementDirection.x, 0, -100*movementDirection.z);
    }
    
};

//remove out of bounds darts
function removeDarts(darts) {
    for (let i = darts.length - 1; i >= 0; i--) {
        let position = new THREE.Vector3();
        darts[i].dart.getWorldPosition(position);

        if (!(skyGeometry.boundingSphere.containsPoint(position))) {
            console.log(`Removing out of bounds dart ${i}\n`);
            scene.remove(darts[i].dart);
            darts.splice(i, 1);
        }
    }
};

//remove out of bounds balloons
function removeBalloons(balloons) {
    for (let i = balloons.length - 1; i >= 0; i--) {
        let position = new THREE.Vector3();
        balloons[i].balloon.getWorldPosition(position);

        if (!(skyGeometry.boundingSphere.containsPoint(position))) {
            console.log(`Removing out of bounds balloon ${i}\n`);
            scene.remove(balloons[i].balloon);
            balloons.splice(i, 1);
        }
    }
};

//collision detection
function checkCollisions(darts, balloons) {

    removeDarts(darts);
    removeBalloons(balloons);

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

        //loop through all balloons for each dart
        for (let j = balloons.length - 1; j >= 0; j--) {

            //get balloon
            let balloon = balloons[j].balloon;
            let balloonPos = new THREE.Vector3();
            balloon.getWorldPosition(balloonPos);

            //create bounding sphere to detect when the dart is on or inside it
            let balloonVicinity = new THREE.Sphere(
                balloonPos,
                balloon.geometry.boundingSphere.radius
            );

            //delete balloon
            if (balloonVicinity.containsPoint(dartPos)) {
                console.log("collision detected: dart %d hit Balloon %d", i, j);
                if (balloons[j].pop()) {
                    scene.remove(balloon);
                    balloons.splice(j, 1);
                }
            }

            //TODO collide with tree and stick, remove dart from array (not scene)
        }
    }
}

function bounceBalloons(balloons) {

    //loop through all balloons...
    for (let i = balloons.length - 2; i >= 0; i--) {
        
        let balloon = balloons[i].balloon;  //balloon refers to the mesh while balloons[i] refers to the object
        let balloonPos = new THREE.Vector3();
        balloon.getWorldPosition(balloonPos);

        //...for each balloon
        for (let j = balloons.length - 1; j >= 0; j--) {

            if (balloon == null) continue;  //removed
            else if (i == j) continue;  //same

            //get second balloon
            let other_balloon = balloons[j].balloon;
            let otherPos = new THREE.Vector3();
            other_balloon.getWorldPosition(otherPos);

            //if the centers are within their radii added...
            let bounce = balloon.geometry.boundingSphere.radius + other_balloon.geometry.boundingSphere.radius
            let distance = balloonPos.distanceTo(otherPos);
            //console.log(`balloons ${i} and ${j} are ${distance} units apart and will collide when ${bounce} units apart\n`);

            //get normal direction between balloons
            let normal = new THREE.Vector3();
            normal.subVectors(otherPos, balloonPos).normalize();
            //console.log(`Normal direction (of collision) is <${normal.x},${normal.y},${normal.z}>`);
            //console.log(`Speeds of balloons 1 and 2 are ${balloons[i].speed} and ${balloons[j].speed}\n`);

            //collision detected
            if (distance <= (bounce + LERP_TOL / 5)) {

                //console.log(`Bouncing balloons ${i} and ${j}\n`);
                //console.log(`Balloon direction is <${balloons[i].direction.x},${balloons[i].direction.y},${balloons[i].direction.z}>`);
                //console.log(`Other balloon direction is <${balloons[j].direction.x},${balloons[j].direction.y},${balloons[j].direction.z}>`);

                //lerp if inside one another
                let tolerance = LERP_TOL / 5;
                if ((bounce - distance) > tolerance) { 
                    balloons[i].lerping = true;
                    balloons[j].lerping = true;
                    distance += (tolerance / 10);
                    balloons[i].lerp.copy(balloonPos).addScaledVector(normal, (distance - bounce) / 2); //set lerp location
                    balloons[j].lerp.copy(otherPos).addScaledVector(normal, (bounce - distance) / 2);
                    balloons[i].lerp.y = Math.max(balloons[i].radius*1.3, balloons[i].lerp.y);
                    balloons[j].lerp.y = Math.max(balloons[j].radius*1.3, balloons[j].lerp.y);
                    //console.log(`Set first balloon's lerp to <${balloons[i].lerp.x},${balloons[i].lerp.y},${balloons[i].lerp.z}>\n`);
                    //console.log(`Set other balloon's lerp to <${balloons[j].lerp.x},${balloons[j].lerp.y},${balloons[j].lerp.z}>\n`);
                
                //otherwise change directions and speeds according to momentums
                } else {

                    //get normal component of balloon directions (the direction of collision, the parallel component)
                    let balloon_n = new THREE.Vector3();
                    balloon_n.copy(normal);
                    balloon_n.multiplyScalar(balloon_n.dot(balloons[i].direction));
                    let other_n = new THREE.Vector3();
                    other_n.copy(normal);
                    other_n.multiplyScalar(other_n.dot(balloons[j].direction));

                    //edge case traveling in the exact same direction
                    //CHANGE to if the difference between the directions length is <....
                    if ((balloon_n.x == 0) && (balloon_n.y == 0) && (balloon_n.z == 0)) {

                        //jitter directions
                        //console.log(`Edge case, exactly equal directions, jittering directions...\n`);
                        let dx = (Math.random() - 0.5) * 1.0; 
                        let dy = (Math.random() - 0.5) * 1.0; 
                        let dz = (Math.random() - 0.5) * 1.0;
                        let delta = new THREE.Vector3(dx, dy, dz).normalize();
                        //console.log(`Adding the direction vector <${delta.x},${delta.y},${delta.z}>\n`)
                        //console.log(`To the direction of the balloon <${balloons[i].direction.x},${balloons[i].direction.y},${balloons[i].direction.z}>\n`)
                        balloons[i].direction.addVectors(balloons[i].direction, delta);
                        balloons[i].direction.normalize();
                        balloons[j].direction.subVectors(balloons[j].direction, delta)
                        balloons[j].direction.normalize();

                        let normal = new THREE.Vector3();
                        normal.subVectors(otherPos, balloonPos).normalize();

                        //console.log(`Normalized to <${balloons[i].direction.x},${balloons[i].direction.y},${balloons[i].direction.z}>\n`)

                        //redefine collision
                        normal.subVectors(otherPos, balloonPos).normalize();  //normalize the direction of collision
                        balloon_n.copy(normal);
                        balloon_n.multiplyScalar(balloon_n.dot(balloons[i].direction));  //but not the collision components
                        other_n.copy(normal);
                        other_n.multiplyScalar(other_n.dot(balloons[j].direction)); //

                    }
                    
                    //get perpendicular components of each balloon's direction - what  remains after considering the collision direction/normal component
                    let balloon_p = new THREE.Vector3(); 
                    balloon_p.subVectors(balloons[i].direction, balloon_n);
                    let other_p = new THREE.Vector3();
                    other_p.subVectors(balloons[j].direction, other_n);
                    //console.log(`Perpendicular direction of balloon 1 is <${balloon_p.x},${balloon_p.y},${balloon_p.z}>`);
                    //console.log(`Perpendicular direction of balloon 2 is <${other_p.x},${other_p.y},${other_p.z}>`);

                    //scale normal components to velocities using speeds
                    balloon_n.multiplyScalar(balloons[i].speed);
                    other_n.multiplyScalar(balloons[j].speed);
                    //console.log(`Normal velocity of balloon 1 is <${balloon_n.x},${balloon_n.y},${balloon_n.z}>`);
                    //console.log(`Normal velocity of balloon 2 is <${other_n.x},${other_n.y},${other_n.z}>`);

                    //scale perpendicular components
                    balloon_p.multiplyScalar(balloons[i].speed);
                    other_p.multiplyScalar(balloons[j].speed);

                    //check relative collision direction
                    if (balloon_n.dot(other_n) < 0) { //toward one another, swap normal components
                        //console.log(`Heading toward one another\n`);
                        let temp = new THREE.Vector3().copy(balloon_n);
                        balloon_n.copy(other_n);
                        other_n.copy(temp);
                    } else { //away from one another, average
                        let average = new THREE.Vector3().copy(balloon_n).add(other_n).multiplyScalar(0.5);
                        balloon_n.copy(average);
                        other_n.copy(average);
                    }

                    //recombine velocities into new direction
                    let velocity = new THREE.Vector3().addVectors(balloon_n, balloon_p);
                    let other_velocity = new THREE.Vector3().addVectors(other_n, other_p);

                    //set new speeds
                    balloons[i].changeSpeed(velocity.length());
                    balloons[j].changeSpeed(other_velocity.length());

                    //set new directions
                    balloons[i].direction = velocity.normalize();
                    balloons[j].direction = other_velocity.normalize();

                };

            }; //end collision

        }; //end inner balloon loop
    }; //end outer balloon loop

};


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
    if (!automatic && dartTimer >= 1 / FIRE_RATE) {
        let direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        shootDart(direction);
        dartTimer = 0;
    } else {
        automatic = false;
        felta = 0;
    }
});

let felta = 0;
//mouse hold
document.addEventListener("mousedown", (e) => {
    firing = true;

    if (automatic) {
        console.log("automatic fire off");
        automatic = false;
    }
});
//mouse hold
document.addEventListener("mouseup", (e) => {
    firing = false;
    felta = 0;
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
let balloonIndex = 0;
const balloonSpawnInterval = 1;
function animate() {
    requestAnimationFrame(animate);
    time = clock.getElapsedTime();
    delta = time - last;
    last = time;

    // TODO: trig f'n modulate sky color based on elapsed
    balloonTimer += delta;
    dartTimer += delta;
    if (balloonTimer >= balloonSpawnInterval) {
        const waypoints = [
            new THREE.Vector3(0, BALLOON_MIN_Y, -17),
            new THREE.Vector3(2.5, BALLOON_MIN_Y, 14),
            new THREE.Vector3(1.5, BALLOON_MIN_Y, 47),
            new THREE.Vector3(-35, BALLOON_MIN_Y, 57),
            new THREE.Vector3(-28, BALLOON_MIN_Y, 32),
            new THREE.Vector3(-84, BALLOON_MIN_Y, 30),
        ];

        let balloonType = Balloon.TYPES.red;
        if ((balloonIndex % 5) == 1) balloonType = Balloon.TYPES.blue;
        else if ((balloonIndex % 5) == 2) balloonType = Balloon.TYPES.green;
        else if ((balloonIndex % 5) == 3) balloonType = Balloon.TYPES.yellow;
        else if ((balloonIndex % 5) == 4) balloonType = Balloon.TYPES.pink;

        balloons.push(
            new Balloon({ type: balloonType, waypoints }, scene)
        );
      
        balloonTimer = 0;
        balloonIndex++;
        
    }

    // Loop Balloons
    for (let i = balloons.length - 1; i >= 0; i--) {
        if (balloons[i].animate(time, delta)) {  //true <==> balloon reached waypoint
            scene.remove(balloons[i].balloon);
            balloons.splice(i, 1);
        }
    }

    // Loop Darts
    for (let i = darts.length - 1; i >= 0; i--) {
        if (darts[i].animate(delta)) { //true <==> ?
            scene.remove(darts[i].dart);
            darts.splice(i, 1);
        }
    }

    updatePlayerMovement(balloons);

    //engage automatic fire on long mouse hold
    if (firing && !automatic) {
        felta += delta;
        if (felta >= 0.5) {
            console.log("automatic fire");
            automatic = true;
        }
    }

    //automatic fire
    if (automatic && dartTimer >= 1 / FIRE_RATE) {
        let direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        shootDart(direction);
        dartTimer = 0;
    }

    checkCollisions(darts, balloons);

    bounceBalloons(balloons);

    const cameraVelocity = playerProperties.velocity.clone();
    cameraVelocity.multiplyScalar(delta);
    camera.position.add(cameraVelocity);

    if (camera.position.y <= PLAYER_HEIGHT) {
        camera.position.y = PLAYER_HEIGHT;
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

    //boxHelper.updateMatrixWorld(true);
}
animate();

/* End Animate */

//EOF
