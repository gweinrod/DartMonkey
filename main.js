import * as THREE from 'three';

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

//shear

//TODO: Custom Ballon Transformations
    //eg poppping
    //eg blown by wind 
    //eg bouncing

/* End Transformations */


/* Initializations */

//constants
const WORLDSIZE = 10000;
const SKYBLUE = 0x8bdafc;

const FOV = 60; 
const ASPECT = window.innerWidth / window.innerHeight;
const NEAR = 0.1
const FAR = WORLDSIZE;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(FOV, ASPECT, NEAR, FAR);

//variables
let players = [];
let balloons = [];
let clock = new THREE.Clock();

/* End Initializations */


/* Geometries */

//sky
let skyGeom = new THREE.SphereGeometry(WORLDSIZE, 32, 32);
let skyMat = new THREE.MeshStandardMaterial({color: SKYBLUE, side: THREE.BackSide});
let sky = new THREE.Mesh(skyGeom, skyMat);
scene.add(sky);

//player

//balloon
function createBalloon(color, position)
{
    let balloonGeom = new THREE.SphereGeometry(2, 32, 32);
    let scaling = scalingMatrix(1, 1.2, 1);
    balloonGeom.applyMatrix4(scaling);
    let balloonMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.3, metalness: 0.2 });
    let balloon = new THREE.Mesh(balloonGeom, balloonMat);

    balloon.position.set(position.x, position.y, position.z);

    balloons.push(balloon);
    scene.add(balloon);
}

createBalloon(0xff0000, { x: -10, y: 0, z: 0 });
createBalloon(0x00ff00, { x: 0, y: 0, z: 0 });
createBalloon(0x0000ff, { x: 10, y: 0, z: 0 });

//details

    //large tree

    //small tree

    //rock

/* End Geometries */


/* Camera */

camera.position.set(0, 0, 20);
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

//Assignment 3 exammple:
/*
let attachedObject = null;
let blendingFactor = 0.1;
*/

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
            break;
        case 65: // 'A' key
            break;
        case 83: // 'S' key
            break;
        case 68: // 'D' key
            break;
        //TODO Control Keys
        //TODO ...
    }
}
document.addEventListener('keydown', onKeyDown, false);

/* End Controls */


/* Game Logic */

/* End Game Logic */


/* Animation Functions */
function animateBalloon(balloon, index) {
    let time = clock.getElapsedTime();
    balloon.position.y += Math.sin(time + index) * 0.01;
}

/* End Animation Functions */


/* Animate */

function animate() {
    requestAnimationFrame(animate);
    let time = clock.getElapsedTime();

    // TODO: Update sky color

    // TODO: Loop Balloons
    balloons.forEach((balloon, index) => animateBalloon(balloon, index));
    
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