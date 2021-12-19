var index = 0;

var points = [];

var gl;
var canvas;

var modelViewMatrixLoc;

var colors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),
    vec4( 1.0, 0.0, 0.0, 1.0 ),
    vec4( 1.0, 1.0, 0.0, 1.0 ),
    vec4( 0.0, 1.0, 0.0, 1.0 ),
    vec4( 0.0, 0.0, 1.0, 1.0 ),
    vec4( 1.0, 0.0, 1.0, 1.0 ),
    vec4( 0.0, 1.0, 1.0, 1.0 ) 
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

// Box Indices for faces (lines)
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
];

var indices2 = [];

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
//    Transfomration
var R;
var T;
var S;

var ctm;
var P;
var V

var aspect;

window.onload = function init(){
    // Context
    canvas = document.getElementById("W1-canvas");
    gl = WebGLUtils.setupWebGL(canvas); 
    if (!gl){
        alert("Not supported.");
    }

    // Viewport
    gl.viewport(0,0,canvas.width, canvas.height);

    // Shaders
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);
    
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

    // Get uniform locations
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix")

    // Perspective - done once.
    aspect = canvas.width/canvas.height;
    P = perspective(45, aspect, 1, 10);

    render();


}

function render(){
    gl.clearColor(0, 0, 0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    matrixFunc1();
    bindUniform();
    gl.drawElements(gl.LINES, indices.length, gl.UNSIGNED_BYTE, 0);

    matrixFunc2();
    bindUniform();
    gl.drawElements(gl.LINES, indices.length, gl.UNSIGNED_BYTE, 0);
    
    matrixFunc3();
    bindUniform();
    gl.drawElements(gl.LINES, indices.length, gl.UNSIGNED_BYTE, 0);
    
}

function matrixFunc1(){ // Do model, view, projection

    ctm = mat4();
    R = mat4();
    R = mult(R, rotateZ(0));
    R = mult(R, rotateX(0));
    R = mult(R, rotateY(0));
    T = translate(0.0, 0.0, 0.0);
    S = scalem(0.5, 0.5, 0.5);

    var eye = vec3(0, 0, 3.0);
    var at = vec3(0.0, 0.0, 0.0);
    var up = vec3(0, 1.0, 0.0);
    V = lookAt(eye, at, up);
    
    ctm = mult(ctm, S);
    ctm = mult(ctm, T);
    ctm = mult(ctm, R);

}

function matrixFunc2(){ // Do model, view, projection

    ctm = mat4();
    R = mat4();
    R = mult(R, rotateZ(0));
    R = mult(R, rotateX(0));
    R = mult(R, rotateY(45));
    T = translate(1.5, 0.0, 0.0);
    S = scalem(0.5, 0.5, 0.5);
    
    ctm = mult(ctm, S);
    ctm = mult(ctm, T);
    ctm = mult(ctm, R);

}

function matrixFunc3(){ // Do model, view, projection

    ctm = mat4();
    R = mat4();
    R = mult(R, rotateZ(0));
    R = mult(R, rotateX(35));
    R = mult(R, rotateY(35));
    T = translate(-1.5, 0.0, 0.0);
    S = scalem(0.5, 0.5, 0.5);
    
    ctm = mult(ctm, S);
    ctm = mult(ctm, T);
    ctm = mult(ctm, R);

}

function bindUniform(){
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(ctm));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(P));
    gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(V));
}