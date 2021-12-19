var verts = [
    // LARGE PLANE QUAD
    vec3(-2, -1, -1),  // 0
    vec3( 2,  -1, -1), // 1
    vec3(-2,  -1, -5), // 2
    vec3( 2, -1, -5),  // 3

    // SMALL QUAD aligned with Y
    vec3(0.25, -0.5, -1.25), // 4
    vec3(0.25, -0.5, -1.75), // 5
    vec3(0.75, -0.5, -1.25), // 6
    vec3(0.75, -0.5, -1.75), // 7

    // LAST SMALL QUAD
    vec3(-1, -1, -2.5), // 8
    vec3(-1, -1, -3),   // 9
    vec3(-1, 0, -2.5),  // 10
    vec3(-1, 0, -3)    // 11
];

// TRIANGLE INDICES
var indices = [
    // LARGE QUAD PLANE
    3, 0, 1,
    0, 3, 2,

    // SMALL QUAD ALIGNED Y
    5, 4, 6,
    5, 6, 7,

    // SMALL QUAD ALIGNED X;
    8, 9, 10,
    11, 10, 9
];

var texCoord = [
    // LARGE QUAD PLANE
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 0),
    vec2(1, 1),

    // SMALL QUAD ALIGNED Y
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 0),
    vec2(1, 1),
    
    // SMALL QUAD ALIGNED X
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 0),
    vec2(1, 1)
]

// Locations
var modelMatrixLoc;
var viewMatrixLoc;
var projectionMatrixLoc;

// Lighting
var theta = 0;
var rotate = 1;
var pointLightCenter = vec4(0, 2, -2, 1);
var lightPos;

// Matrices
var ctm;
var R;
var T;
var S;
var V;
var P;

// Misc
var eps = 0.0001;