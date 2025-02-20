import * as THREE from 'three';

//user defined, change
const W_RATIO = 16; //ratio of dart length to width
const F_RATIO = 2 //ratio of fin height to dart width
//

//do not change
const l = 0.5;
const w = l / W_RATIO;
const f = w * (1 + F_RATIO);
//

/* Vertices */
let body = [

    // Body
    //front face
    -w, -w, l, //0
    w, -w, l, //1
    w, w, l, //2
    -w, w, l, //3
    //bottom face
    -w, -w, l, //4
    -w, -w, -l, //5
    w, -w, -l, //6
    w, -w, l, //7
    //right face
    w, -w, l, //8
    w, -w, -l, //9
    w, w, -l, //10
    w, w, l, //11
    //top face
    -w, w, l, //12
    w, w, l, //13
    w, w, -l, //14
    -w, w, -l, //15
    //left face
    -w, -w, l, //16,
    -w, -w, -l, //17,
    -w, w, -l, //18,
    -w, w, l, //19,

    // Tip
    //bottom face
    -w, -w, -l, //20,
    0, 0, -l, //21,
    w, -w, -l, //22,
    //right face
    w, -w, -l, //23
    0, 0, -l, //24
    -w, -w, -l, //25
    //top face
    -w, w, -l, //26
    w, w, -l, //27
    0, 0, -l, //28
    //left face
    -w, -w, -l, //29
    0, 0, -l, //30
    -w, w, -l, //31

    // Fins
    //bottom fin
    0, -w, l, //32
    0, -w, l - 2 * f, //33
    0, -w - f, l, //34
    //right fin
    w, 0, l, //35
    w, 0, l - 2 * f, //36
    w + f, 0, l, //37
    //top fin
    0, w, l, //38
    0, w, l - 2 * f, //39
    0, w + f, l, //40
    //left fin
    -w, 0, l, //41
    -w, 0, l - 2 * f, //42
    -w - f, 0, l, //43

];

let indices = [
    // Body
    //front face
    0, 1, 2,
    2, 3, 0,
    //bottom face
    4, 5, 6,
    6, 7, 4,
    //right face
    8,9,10,
    10,11,8,
    //top face
    12, 13, 14,
    14, 15, 12,
    //left face
    16, 17, 18,
    18, 19, 16,
    
    // Tip
    //bottom face
    20, 21, 22,
    //right face
    23, 24, 25,
    //top face
    26, 27, 28,
    //left face
    29, 30, 31,

    // Fins are double sided
    //bottom fin
    32, 33, 34,
    34, 33, 32,
    //right fin
    35, 36, 37,
    37, 36, 35,
    //top fin
    38, 39, 40,
    40, 39, 38,
    //left fin
    41, 42, 43,
    43, 42, 1
]

let normals = [
    //TODO
]

//TODO 