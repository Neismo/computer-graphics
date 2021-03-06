/*
  This is both part 3 & 4 
*/
var points = [];

var gl;
var canvas;

var theta = 0.05;
var rotate = 1;
var r = 6;
var eps = 0.001

// Matrices
//    Translate, Rotation, Scaling
var R;
var T;
var S;

var ctm;
var P;
var V;

var lightV;
var useLightV = false;
var lightEye;

var aspect;
var vBuffer;

var eyePointLoc;

var model;

// Lights
var lightPos = vec4(0, 0, -1, 0.0);          // P__l
var lightEmis = vec4(1, 1, 1, 1);             // L__e
var directionToLight = vec4(0, 0, 1, 1);   // l__e
var lightAmb = vec4(0.25, 0.25, 0.25, 1.0);

var kd = vec4(1, 1, 1, 1);             // Diffuse Reflection Coefficient
var ka = vec4(0, 0, 0, 1);             // Ambiend Reflection Coefficient
var ks = vec4(0, 0, 0, 1);

var alpha = 2;

var g_objDoc = null;
var g_drawingInfo = null;

var quadVerts = [
    // LARGE PLANE QUAD
    vec3(-2, -1, -1),  // 0
    vec3( 2,  -1, -1), // 1
    vec3(-2,  -1, -5), // 2
    vec3( 2, -1, -5)   // 3
];

var vertsNormals = [
    vec3(0,1, 0),
    vec3(0,1, 0),
    vec3(0,1, 0),
    vec3(0,1, 0)
];

// TRIANGLE INDICES
var indices = [
    // LARGE QUAD PLANE
    3, 0, 1,
    0, 3, 2
];

var vertexColors = [
    // LARGE QUAD PLANE - IRRELEVANT
    vec4(0,1,0,1),
    vec4(0,1,0,1),
    vec4(1,0,0,1),
    vec4(1,0,0,1)
]

var texCoord = [
    // LARGE QUAD PLANE
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 0),
    vec2(1, 1)
]

var program_teapot;
var program_quad;
var overall_model;