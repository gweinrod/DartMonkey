import * as THREE from 'three';
import DartGeometry from './dart';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/* Initializations */

//constants
const WORLDSIZE = 1000;
const SKYBLUE = 0x8bdafc;

const FOV = 60; 
const ASPECT = window.innerWidth / window.innerHeight;
const NEAR = 0.1;
const FAR = WORLDSIZE * 1.5;
const BALLOON_RADIUS = 2;
const DART_SPEED = 25;
const MOVE_SPEED = 50;
const MOVE_UNITS = .01 * MOVE_SPEED

//objects
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(FOV, ASPECT, NEAR, FAR);

//variables
let balloons = [];
let darts = [];
let clock = new THREE.Clock();
let time = 0;
let delta = 0;
let last = 0;

let moves = {
    W: false,
    A: false,
    S: false,
    D: false,
};

let mouse = {
    x:0,
    y:0,
    z:0
};

//physics elements for jumping
let isJumping = false;
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
let skyMat = new THREE.MeshStandardMaterial({color: SKYBLUE, side: THREE.BackSide});
let sky = new THREE.Mesh(skyGeom, skyMat);
scene.add(sky);

//player

let dartGeom = new DartGeometry(3);
//darts
function createDart() {
    let dartMat = new THREE.MeshStandardMaterial({ color: 0xFF0000, roughness: 0.0, metalness: 0.5 });
    let dart = new THREE.Mesh(dartGeom, dartMat);

    dart.position.copy(camera.position);
    darts.push(dart);
    scene.add(dart);
    console.log("dart created\n")
    return dart;
}

function createBalloon(color, position) 
{
    let balloonGeom = new THREE.SphereGeometry(BALLOON_RADIUS, 32, 32);
    let balloonMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.3, metalness: 0.2 });
    let balloon = new THREE.Mesh(balloonGeom, balloonMat);

    let vertices = balloonGeom.attributes.position;
    
    for (let i = 0; i < vertices.count; i++) 
        {
        let x = vertices.getX(i);
        let y = vertices.getY(i);
        let z = vertices.getZ(i);

        if (y <= 0) 
        {
            let factor = 1 + y * 0.05;
            vertices.setX(i, x * factor);
            vertices.setZ(i, z * factor);
            vertices.setY(i, y*0.95);
        }
        else if (y > 0) 
        {
            vertices.setY(i, y*0.8);
        }
    }

    balloonGeom.attributes.position.needsUpdate = true;
    
    //use matrices for geometries, three.js calls for imports
    let transformations = new THREE.Matrix4();
    transformations.multiplyMatrices(scalingMatrix(1, 1.4, 1), transformations);
    transformations.multiplyMatrices(translationMatrix(position.x, position.y, position.z), transformations);
    balloon.matrix.copy(transformations);
    balloon.matrixAutoUpdate = false;

    balloons.push(balloon);
    scene.add(balloon);
    return balloon;
}

//demo balloons
createBalloon(0x0000ff, { x: -20, y: 0, z: 0 });
createBalloon(0xff0000, { x: -10, y: 0, z: 0 });
createBalloon(0x00ff00, { x: 0, y: 0, z: 0 });
createBalloon(0x0000ff, { x: 10, y: 0, z: 0 });
createBalloon(0x0000ff, { x: 20, y: 0, z: 0 });

//details

    //large trees and ground
    const loader = new GLTFLoader();
    loader.load('models/procedural_tree_generator/scene.gltf', function (gltf) {
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
    
    }, undefined, function (error) {
        console.error('Error loading model:', error);
    });
    

    //small tree

    //rock

/* End Geometries */


/* Camera */

camera.position.set(0, 0, 30);
camera.lookAt(0, 0, 0);

/* End Camera */


/* Renderer */

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize, false);

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
            if (!isJumping) {
                velocityY = JUMP_STRENGTH; // Apply jump force
                isJumping = true;
            }
        break;
        //TODO UI Controls
    }
}
document.addEventListener('keydown', onKeyDown, false);

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
document.addEventListener('keyup', onKeyUp, false);

//function to simulate a jump
function updateJump() {
    if (isJumping) {
        velocityY += GRAVITY * delta;
        camera.position.y += velocityY * delta;

        if (camera.position.y <= 0) {
            camera.position.y = 0;
            velocityY = 0;
            isJumping = false;
        }
    }
};

//no right clicking browser menus
document.querySelector('canvas').addEventListener('contextmenu', (e) => {
    e.preventDefault();
}, false);

//clear movement when window loses focus, or miss keyUp events
window.addEventListener('blur', () => {
    moves.W = false;
    moves.A = false;
    moves.S = false;
    moves.D = false;
});

//mouse clicks
document.addEventListener("click", (e) => {
    let direction = new THREE.Vector3;
    camera.getWorldDirection(direction);
    shootDart(direction);
});

/* End Controls */


/* Game Logic */

function shootDart(direction) {
    let dart = createDart();
    dart.lookAt(direction);
};

/* End Game Logic */


/* Animation Functions */
function animateBalloon(balloon, index) {
    let time = clock.getElapsedTime();
    balloon.position.y += Math.sin(time + index) * 0.01;
};

function animateDart(dart, delta) {
    console.log("animating dart\n");
    let direction = new THREE.Vector3;
    dart.getWorldDirection(direction);
    dart.applyMatrix4(translationMatrix((direction.x * DART_SPEED * delta), (direction.y * DART_SPEED * delta), (direction.z * DART_SPEED * delta)));
    
    //TODO gravity (let gravity act by rotating toward the ground)
    //dart.applyMatrix4(rotationMatrixX)
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
        //enable controls

    // TODO: Apply Shaders

    if (moves.W) camera.position.z -= MOVE_UNITS;
    if (moves.A) camera.position.x -= MOVE_UNITS;
    if (moves.S) camera.position.z += MOVE_UNITS;
    if (moves.D) camera.position.x += MOVE_UNITS;

    updateJump();

    renderer.render(scene, camera);
}
animate();

/* End Animate */


//EOF