var index = 0;

var points = [];

var gl;

var modelViewMatrixLoc;

// RECTANGLE VERTS
var verts = [
    vec3(-4, -1, 1),    // 0
    vec3(4, -1, 1),     // 1
    vec3(4, -1, -21),   // 2
    vec3(-4, -1, -21)   // 3
];

// TRIANGLE INDICES
var indices = [
    3, 0, 1,
    1, 2, 3,
];

// RECTANGLE VERT COLORS
var vertexColors = [
    [ 1.0, 1.0, 1.0, 1.0],
    [ 1.0, 1.0, 1.0, 1.0],
    [ 1.0, 1.0, 1.0, 1.0],
    [ 1.0, 1.0, 1.0, 1.0]
]

var texCoord = [
    vec2(-1.5,  0.0),
    vec2(2.5,   0.0),
    vec2(2.5,   10.0),
    vec2(-1.5,  10.0)
]

// Matrices
var ctm;
var R;
var T;
var S;
var V;
var P;

var count = 0;

// TEXTURE VARIABLES 
var texSize = 64;
var numRows = 8;
var numCols = 8;

var myTexels = new Uint8Array(4*texSize*texSize);
// TEXTURE VARIALBES END

window.onload = function init(){
    // Context
    var canvas = document.getElementById("W1-canvas");
    gl = WebGLUtils.setupWebGL(canvas); 
    if (!gl){
        alert("Not supported.");
    }

    setupListeners();

    // Viewport
    gl.viewport(0,0,canvas.width, canvas.height);

    // Shaders
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);
    
    matrixFunc();

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    
    // Texture
    doTexture();

    // Buffers
    bindBuffers();

    modelMatrixLoc = gl.getUniformLocation(program, "modelMatrix");
    viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

    var aspect = canvas.width/canvas.height;
    P = perspective(90, aspect, 1, 100);

    render();


}

function render(){
    gl.clearColor(0.0, 0.0, 1.0, 1.0); // Blue Background
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(ctm));
    gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(V));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(P));

    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0);
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

    var eye = vec3(0, 50.0, -10);
    var at = vec3(0.0, 0.0, -10.0);
    var up = vec3(0, 0.0, 1.0);

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

    var iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);

    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoord), gl.STATIC_DRAW);

    var vTexCoord = gl.getAttribLocation(program, "vTexCoord");
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);
}

function doTexture() {
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    
    generateTexels();

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, myTexels);

    gl.generateMipmap(gl.TEXTURE_2D);

    gl.uniform1i(gl.getUniformLocation(program, "texMap"), 0);

    
}

function generateTexels(){
    for(var i = 0; i < texSize; ++i){
        for(var j = 0; j < texSize; ++j){
            var patchx = Math.floor(i/(texSize/numRows));
            var patchy = Math.floor(j/(texSize/numCols));

            var c = (patchx%2 !== patchy%2 ? 255 : 0);

            myTexels[4*i*texSize+4*j]   = c;
            myTexels[4*i*texSize+4*j+1] = c;
            myTexels[4*i*texSize+4*j+2] = c;
            myTexels[4*i*texSize+4*j+3] = 255;
        }
    }
}

var clamp = true;
var filterVal = 1;

function setupListeners(){
    var clamp_repeat_menu = document.getElementById("CLAMP_REPEAT");
    clamp_repeat_menu.addEventListener("click", function(){
        val = clamp_repeat_menu.selectedIndex;
        if(val == 0){
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        }
        render();
    })
    var min_filter_menu = document.getElementById("MIN_FILTER");
    min_filter_menu.addEventListener("click", function(){
        val = min_filter_menu.selectedIndex;
        if(val == 0){
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
        render();
    })
    var mag_filter_menu = document.getElementById("MAG_FILTER");
    mag_filter_menu.addEventListener("click", function(){
        val = mag_filter_menu.selectedIndex;
        if(val == 0){
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        }
        render();
    })
    var sample_menu = document.getElementById("SAMPLING_METHOD");
    sample_menu.addEventListener("click", function(){
        val = sample_menu.selectedIndex;
        if(val == 0){
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
        } else if(val == 1) {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
        } else if(val == 2) {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        }
        render();
    })
}

/**
 * TODO: FORKLAR FORSKELLENE I SAMPLING OG (CLAMP/REPEAT)
 * 
 * CLAMP/REPEAT:
 *  REPEAT: Når vi bruger texture coordinater, så går coordinaterne mellem (0, 1). Hvis vi er i (1,1) er vi i øverste højre hjørne af texturen
 *          og med (0,0) er vi i nedre. Problemet opstår når vi går udover disse værdier. Hvis vi bruger repeat, så er det lidt ligesom
 *          en modulo beregning, så 1.5 er det samme som 0.5 osv.
 *  CLAMP:  Alternativt er at bruge CLAMPING. I stedet for at gøre som ovenover med modulo, så bruger vi bare den nærmeste værdi.
 *          1.0 hvis over 1.0, 0.0 hvis under 0.0. Det giver, lidt sjovt, et "repeat" af hvad end der er tæt ved det texturekoordinat.
 *          I tilfældet af checker patternet, så bliver det bare farven hvid/sort afhængig af farven ved kanten.
 * 
 * SAMPLING METODER:
 *  MIPMAP:
 *      
 *  NEAREST NEIGHBOUR:
 *      
 *  LINEAR:
 *      
 * 
*/