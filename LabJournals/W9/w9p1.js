var gl;

var modelMatrixLoc;
var viewMatrixLoc;
var projectionMatrixLoc;

// Lighting
var theta = 0;
var pointLightCenter = vec4(0, 2, -2, 0);
var lightPos;


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
    4, 5, 6,
    5, 6, 7,

    // SMALL QUAD ALIGNED X;
    8, 9, 10,
    11, 10, 9
];

var vertexColors = [
    // LARGE QUAD PLANE - IRRELEVANT
    vec4(0,0,0,0),
    vec4(0,0,0,0),
    vec4(0,0,0,0),
    vec4(0,0,0,0),

    // SMALL QUAD ALIGNED Y
    vec4(1.0, 0, 0, 1),
    vec4(1.0, 0, 0, 1),
    vec4(1.0, 0, 0, 1),
    vec4(1.0, 0, 0, 1),

    // SMALL QUAD ALIGNED X
    vec4(1.0, 0, 0, 1),
    vec4(1.0, 0, 0, 1),
    vec4(1.0, 0, 0, 1),
    vec4(1.0, 0, 0, 1)
]

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

// Matrices
var ctm;
var R;
var T;
var S;
var V;
var P;

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

    gl.enable(gl.DEPTH_TEST);
    
    // Texture
    doTexture();
    doRedTexture();

    // Buffers
    bindBuffers();

    modelMatrixLoc = gl.getUniformLocation(program, "modelMatrix");
    viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

    var aspect = canvas.width/canvas.height;
    P = perspective(90, aspect, 0.1, 100);

    render();


}

function render(){

    theta += 0.003 % (Math.PI * 2);
    lightPos = vec4(Math.cos(theta)*2,2,Math.sin(theta)*2 - 2,0)



    gl.clearColor(0.0, 0.0, 1.0, 0.0); // Blue Background
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    calcProjM();
    bindMatrix();

    // DRAW LARGE PLANE
    gl.uniform1i(gl.getUniformLocation(program, "drawMode"), 1);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);

    // DRAW SMALLER PLANES
    gl.uniform1i(gl.getUniformLocation(program, "drawMode"), 0);
    gl.drawElements(gl.TRIANGLES, indices.length-6, gl.UNSIGNED_BYTE, 6);

    requestAnimationFrame(render);
}

function matrixFunc(){ // Do CTM stuff here

    ctm = mat4();
    
    R = mat4();
    R = mult(R, rotateZ(0));
    R = mult(R, rotateX(0)); 
    R = mult(R, rotateY(0));
    T = translate(0, 0, 0); 
    S = scalem(1, 1, 1);   // Unit scale matrix
    
    ctm = mult(ctm, S);
    ctm = mult(ctm, R);
    ctm = mult(ctm, T);

    var eye = vec3(0.0, 1.0, -6.0);
    var at = vec3(0.0, 0.0, 0.0);
    var up = vec3(0, 1.0, 0.0);

    V = mat4(); // No view
    //V = lookAt(eye, at, up);
}

function bindBuffers(){
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

    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoord), gl.STATIC_DRAW);

    var vTexCoord = gl.getAttribLocation(program, "vTexCoord");
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);

    var iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);
}

function doTexture() {

    gl.activeTexture(gl.TEXTURE0);
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    var image = document.createElement('img');
    image.crossOrigin = 'anonymous';
    image.textarget = gl.TEXTURE_2D;
    image.onload = function(event){
        var image = event.target;
        gl.activeTexture(gl.TEXTURE0);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(image.textarget, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    }
    image.src = 'xamp23.png';

    gl.uniform1i(gl.getUniformLocation(program, "texMap"), 0);
    
}

function calcProjM(){
    var d = -(lightPos[1] + 1);
    var Mp = mat4(vec4(1, 0, 0, 0))
}

function bindMatrix(){
    gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(ctm));
    gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(V));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(P));
}

function doRedTexture(){
    var image = new Uint8Array([255,0,0]);

    gl.activeTexture(gl.TEXTURE1);
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, image);
    
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.uniform1i(gl.getUniformLocation(program, "colorMap"), 1);
    
}