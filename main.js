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

//shear

//TODO: Custom Ballon Transformations
    //eg poppping
    //eg blown by wind 
    //eg bouncing

/* End Transformations */


/* Initializations */

//constants
const WORLDSIZE = 1000;
const SKYBLUE = 0x000002;

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
let skyGeom = new THREE.SphereGeometry(WORLDSIZE);
let skyMat = new THREE.MeshBasicMaterial({color: SKYBLUE});
let sky = new THREE.Mesh(skyGeom, skyMat);
scene.add(sky);

//player

//balloon

//details

    //large tree

    //small tree

    //rock

/* End Geometries */


/* Camera */

camera.position.set(0, 10, 20);
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
function animateBalloon() {}
/* End Animation Functions */


/* Animate */

function animate() {
    requestAnimationFrame(animate);
    let time = clock.getElapsedTime();

    // TODO: Update sky color

    // TODO: Loop Balloons
    balloons.forEach(animateBalloon(obj, index))
    
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