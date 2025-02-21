import * as THREE from "three";

//translate

export const translationMatrix = (tx, ty, tz) => {
    return new THREE.Matrix4().set(
        1,
        0,
        0,
        tx,
        0,
        1,
        0,
        ty,
        0,
        0,
        1,
        tz,
        0,
        0,
        0,
        1
    );
};

//rotateX
export const rotationMatrixX = (theta) => {
    return new THREE.Matrix4().set(
        1,
        0,
        0,
        0,
        0,
        Math.cos(theta),
        -Math.sin(theta),
        0,
        0,
        Math.sin(theta),
        Math.cos(theta),
        0,
        0,
        0,
        0,
        1
    );
};

//rotateY
export const rotationMatrixY = (theta) => {
    return new THREE.Matrix4().set(
        Math.cos(theta),
        0,
        Math.sin(theta),
        0,
        0,
        1,
        0,
        0,
        -Math.sin(theta),
        0,
        Math.cos(theta),
        0,
        0,
        0,
        0,
        1
    );
};

//rotateZ
export const rotationMatrixZ = (theta) => {
    return new THREE.Matrix4().set(
        Math.cos(theta),
        -Math.sin(theta),
        0,
        0,
        Math.sin(theta),
        Math.cos(theta),
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1
    );
};

//scale
export const scalingMatrix = (sx, sy, sz) => {
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
};

//shearX
export const shearMatrixX = (shy, shz) => {
    return new THREE.Matrix4().set(
        1,
        0,
        0,
        0,
        shy,
        1,
        0,
        0,
        shz,
        0,
        1,
        0,
        0,
        0,
        0,
        1
    );
};

//shearY
export const shearMatrixY = (shx, shz) => {
    return new THREE.Matrix4().set(
        1,
        shx,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        shz,
        1,
        0,
        0,
        0,
        0,
        1
    );
};

//shearZ
export const shearMatrixZ = (shx, shy) => {
    return new THREE.Matrix4().set(
        1,
        0,
        shx,
        0,
        0,
        1,
        shy,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1
    );
};

//TODO: Custom Ballon Transformations
//eg poppping
//eg blown by wind
//eg bouncing
