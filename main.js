import * as THREE from 'three';
import DartGeometry from './dart';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/* Transformations */


//translate
function translationMatrix(tx, ty, tz) {
	return new THREE.Matrix4().set(
		1, 0, 0, tx,
		0, 1, 0, ty,
		0, 0, 1, tz,
		0, 0, 0, 1
	);
}

//rotateX
function rotationMatrixX(theta) {
    return new THREE.Matrix4().set(
        1, 0, 0, 0,
        0, Math.cos(theta), -Math.sin(theta), 0,
        0, Math.sin(theta), Math.cos(theta), 0,
        0, 0, 0, 1
    );
}

//rotateY
function rotationMatrixY(theta) {
    return new THREE.Matrix4().set(
        Math.cos(theta), 0, Math.sin(theta), 0,
        0, 1, 0, 0,
        -Math.sin(theta), 0, Math.cos(theta), 0,
        0, 0, 0, 1
    );
}

//rotateZ
function rotationMatrixZ(theta) {
	return new THREE.Matrix4().set(
		Math.cos(theta), -Math.sin(theta), 0, 0,
		Math.sin(theta),  Math.cos(theta), 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	);
}

//scale
function scalingMatrix(sx, sy, sz) {
	return new THREE.Matrix4().set(
		sx, 0, 0, 0,
		0, sy, 0, 0,
		0, 0, sz, 0,
		0, 0, 0, 1
	);
}

//TODO: Custom Ballon Transformations
    //eg poppping
    //eg blown by wind 
    //eg bouncing

/* End Transformations */


/* Initializations */

//constants
const WORLDSIZE = 1000;
const SKYBLUE = 0x8bdafc;

const FOV = 60; 
const ASPECT = window.innerWidth / window.innerHeight;
const NEAR = 0.1;
const FAR = WORLDSIZE * 1.5;
const BALLOON_RADIUS = 2;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(FOV, ASPECT, NEAR, FAR);

//variables
let players = [];
let balloons = [];
let darts = [];
let clock = new THREE.Clock();
let time = 0;
let delta = 0;
let last = 0;

/* End Initializations */


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

    dart.applyMatrix4(scalingMatrix(0.5,0.5,0.5));
    dart.position.set(0,-5,0);

    darts.push(dart);
    scene.add(dart);
    return dart;
}

let rotator = createDart();
let translator = createDart();

//balloon
function createBalloon(color, position)
{
    let balloonGeom = new THREE.SphereGeometry(BALLOON_RADIUS, 32, 32);
    let balloonMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.3, metalness: 0.2 });
    let balloon = new THREE.Mesh(balloonGeom, balloonMat);

    //let scaling = scalingMatrix(1, 1.2, 1);
    //balloonGeom.applyMatrix4(scaling);
    //balloon.position.set(position.x, position.y, position.z);
    
        //use matrices for geometries, three.js calls for imports
    let transformations = new THREE.Matrix4();
    transformations.multiplyMatrices(transformations, scalingMatrix(1, 1.2, 1));
    transformations.multiplyMatrices(translationMatrix(position.x, position.y, position.z), transformations);
    balloon.matrix.copy(transformations);
    balloon.matrixAutoUpdate = false;


    balloons.push(balloon);
    scene.add(balloon);
}

createBalloon(0x0000ff, { x: -20, y: 0, z: 0 });
createBalloon(0xff0000, { x: -10, y: 0, z: 0 });
createBalloon(0x00ff00, { x: 0, y: 0, z: 0 });
createBalloon(0x0000ff, { x: 10, y: 0, z: 0 });
createBalloon(0x0000ff, { x: 20, y: 0, z: 0 });

//details

    //large tree
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

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 20, 10);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0x404040, 2);
scene.add(ambientLight);

/* End Lighting */


/* Controls */

//keycodes at https://www.toptal.com/developers/keycode/table search KeyW KeyA KeyS KeyD
function onKeyDown(event) {
    switch (event.keyCode) {
        case 87: // 'W' key
            camera.position.z -= 1; //TODO
            break;
        case 65: // 'A' key 
            camera.position.x -= 1; //TODO camera's left to world's left or tank controls / KEYBOARD TURN
            break;
        case 83: // 'S' key
            camera.position.z += 1; //TODO
            break;
        case 68: // 'D' key
            camera.position.x += 1; //TODO
            break;
        //TODO JUMP
        //TODO UI Controls
    }
}
document.addEventListener('keydown', onKeyDown, false);

/* End Controls */


/* Game Logic */

function shootDart(direction) {};

/* End Game Logic */


/* Animation Functions */
function animateBalloon(balloon, index) {
    let time = clock.getElapsedTime();
    balloon.position.y += Math.sin(time + index) * 0.01;
}

function translateDart(time, dart, speed) {
    dart.applyMatrix4(translationMatrix((speed*time), speed*time/4, (speed*time)));
    //TODO direction
    //TODO gravity
}

/* End Animation Functions */

//translator.applyMatrix4(scalingMatrix(1, -1, 1));
translator.applyMatrix4(rotationMatrixY(-3*Math.PI/4));

/* Animate */
function animate() {
    requestAnimationFrame(animate);
    time = clock.getElapsedTime();
    delta = time - last;
    last = time;
    
    // TODO: Update sky color

    // TODO: Loop Balloons
    balloons.forEach((balloon, index) => animateBalloon(balloon, index));
    
    // TODO: Loop Darts

    //move dart 'translator' for delta seconds at speed = 20 pxls per second
    translateDart(delta, translator, 20);
    
    //demo translate
    if (Math.abs(translator.position.x) > 40 || Math.abs(translator.position.y) > 40 || Math.abs(translator.position.y) > 40) {
        translator.position.x = 0;
        translator.position.y = 0;
        translator.position.z = 0;
    }

   //demo rotate
        rotator.applyMatrix4(rotationMatrixZ(delta * 1));
        rotator.applyMatrix4(rotationMatrixY(delta * 1));

        //disable controls
    // TODO: Animate Character
    // TODO: Move Camera
        //enable controls

    // TODO: Apply Shaders

    renderer.render(scene, camera);
}
animate();

/* End Animate */


//EOF