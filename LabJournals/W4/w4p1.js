var index = 0;

var points = [];

var gl;

var modelViewMatrixLoc;

var colors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
];

// Box vertices
var verts = [
    vec3(-0.5, -0.5, 0.5),  // 0
    vec3(-0.5, 0.5, 0.5),   // 1
    vec3(0.5, 0.5, 0.5),    // 2
    vec3(0.5, -0.5, 0.5),   // 3
    vec3(-0.5, -0.5, -0.5), // 4
    vec3(-0.5, 0.5, -0.5),  // 5
    vec3(0.5, 0.5, -0.5),   // 6
    vec3(0.5, -0.5, -0.5)   // 7
];

// Box Indices for triangles
var indices = [
    0, 1, // face 1
    1, 2,
    2, 3,
    3, 0,

    5, 4, // face 2
    4, 0,
    0, 1,
    1, 5,

    2, 3, // face 3 
    3, 7,
    7, 6,
    6, 2,

    3, 0, // face 4
    0, 4,
    4, 7,
    7, 3,

    6, 5, // face 5
    5, 1,
    1, 2,
    2, 6,

    4, 5, // face 6
    5, 6,
    6, 7,
    7, 4
    
    /* // IF DRAWING WITH TRIANGLES, USE THIS
    1, 0, 3,
    3, 2, 1,
    2, 3, 7,
    7, 6, 2,
    3, 0, 4,
    4, 7, 3,
    6, 5, 1,
    1, 2, 6,
    4, 5, 6,
    6, 7, 4,
    5, 4, 0,
    0, 1, 5
    */
];

var vertexColors = [
    [ 1.0, 0.0, 1.0, 1.0],
    [ 0.0, 1.0, 0.0, 1.0],
    [ 0.0, 0.0, 1.0, 1.0],
    [ 1.0, 1.0, 0.0, 1.0],
    [ 1.0, 0.0, 1.0, 1.0],
    [ 0.0, 1.0, 1.0, 1.0],
    [ 1.0, 1.0, 1.0, 1.0],
    [ 0.0, 1.0, 1.0, 1.0],
]

// Matrices
var ctm;
var R;
var T;
var S;
var V;

var count = 0;

window.onload = function init(){
    // Context
    var canvas = document.getElementById("W1-canvas");
    gl = WebGLUtils.setupWebGL(canvas); 
    if (!gl){
        alert("Not supported.");
    }

    // Viewport
    gl.viewport(0,0,canvas.width, canvas.height);

    // Shaders
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);
    
    matrixFunc();
    
    // Buffers
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(verts), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexColors), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    var iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);

    modelMatrixLoc = gl.getUniformLocation(program, "modelMatrix");
    viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix");

    render();


}

function render(){
    gl.clearColor(0.3921, 0.5843, 0.9294,1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(ctm));
    gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(V));

    gl.drawElements(gl.LINES, indices.length, gl.UNSIGNED_BYTE, 0);
}

function matrixFunc(){ // Do CTM stuff here

    ctm = mat4();
    
    R = mat4();
    R = mult(R, rotateZ(0));
    R = mult(R, rotateX(0)); 
    R = mult(R, rotateY(0));
    T = translate(0, 0, 0); // Diagonal is not from (0,0,0) to (1,1,1); change to translate(0.5,0.5,0) and that part would be done.
    S = scalem(1, 1, 1); // Unit scale matrix
    
    ctm = mult(ctm, S);
    ctm = mult(ctm, R);
    ctm = mult(ctm, T);

    var eye = vec3(-0.01, -0.01, -0.01);
    var at = vec3(0.0, 0.0, 0.0);
    var up = vec3(1.0, 1.0, 0.0);
    V = lookAt(eye, at, up);
}