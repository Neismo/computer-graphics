var points = [];

var gl;
var canvas;

var theta = 0.05;
var r = 3;
// Tetrahedon stuff
var va = vec4(0.0, 0.0, 1.0, 1);
var vb = vec4(0.0, 0.942809, -0.333333, 1);
var vc = vec4(-0.816497, -0.471405, -0.333333, 1);
var vd = vec4(0.816497, -0.471405, -0.333333, 1);

var triangles = [];
var triangleColors = [];
var trinagleNormals = [];
var count = 1;

// Matrices
//    Translate, Rotation, Scaling
var R;
var T;
var S;

var ctm;
var P;
var V

var aspect;
var vBuffer;

// Lights
var lightPos = vec4(0, 0, -1, 0);          // P__l
var lightEmis = vec4(1, 1, 1, 1);             // L__e
var directionToLight = vec4(0, 0, 1, 1);   // l__e

var kd = vec4(0.25, 0.25, 0.25, 1);             // Diffuse Reflection Coefficient
var ka = 0.5;             // Ambiend Reflection Coefficient

window.onload = function init(){
    // Context
    canvas = document.getElementById("W1-canvas");
    gl = WebGLUtils.setupWebGL(canvas); 
    if (!gl){
        alert("Not supported.");
    }

    document.getElementById("but1").onclick = function () {
        count++;
        if(count > 8){count = 8}
        reCalc();
    }
    document.getElementById("but2").onclick = function () {
        if(count != 0){
            count--;
            reCalc();
        }
    }

    // Viewport
    gl.viewport(0,0,canvas.width, canvas.height);

    // Shaders
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    gl.enable(gl.DEPTH_TEST);
    
    gl.enable(gl.CULL_FACE);

    // Buffers
    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);

    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    // Get uniform locations
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix")

    lightPosLoc = gl.getUniformLocation(program, "lightPos");
    lightEmisLoc = gl.getUniformLocation(program, "lightEmis");
    directionToLightLoc = gl.getUniformLocation(program, "directionToLight");
    kdLoc = gl.getUniformLocation(program, "kd");
    kaLoc = gl.getUniformLocation(program, "ka");
    gl.uniform4fv(lightPosLoc, lightPos);
    gl.uniform4fv(lightEmisLoc, lightEmis);
    gl.uniform4fv(directionToLightLoc, directionToLight);
    gl.uniform4fv(kdLoc, kd);
    gl.uniform1f(kaLoc, ka);

    // Perspective - done once.
    aspect = canvas.width/canvas.height;
    P = perspective(45, aspect, 0.3, 10);

    render();


}

function render(){
    gl.clearColor(0, 0, 0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    theta += 0.03%(2*Math.PI);
    matrixFunc();
    bindUniform();
    gl.drawArrays(gl.TRIANGLES, 0, triangles.length);
    requestAnimationFrame(render);
    
}

function matrixFunc(){ // Do model, view, projection

    ctm = mat4();
    R = mat4();
    R = mult(R, rotateZ(0));
    R = mult(R, rotateX(0));
    R = mult(R, rotateY(0));
    T = translate(0.0, 0.0, 0.0);
    S = scalem(1, 1, 1);
    
    ctm = mult(ctm, S);
    ctm = mult(ctm, T);
    ctm = mult(ctm, R);

    
    var eye = vec3(r*Math.sin(theta), 0, r*Math.cos(theta));
    var at = vec3(0.0, 0.0, 0.0);
    var up = vec3(0, 1.0, 0.0);
    V = lookAt(eye, at, up);

}

function bindUniform(){
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(ctm));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(P));
    gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(V));
}

function tetrahedron(a,b,c,d,n){
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}

function divideTriangle(a, b, c, count){
    if(count > 0){
        var ab = normalize(mix(a,b, 0.5), true);
        var ac = normalize(mix(a,c, 0.5), true);
        var bc = normalize(mix(b,c, 0.5), true);
        divideTriangle(a, ab, ac, count-1);
        divideTriangle(ab, b, bc, count-1);
        divideTriangle(bc, c, ac, count-1);
        divideTriangle(ab, bc, ac, count-1);
    } else {
        triangle(a,b,c)
    }
}

function triangle(a,b,c){
    triangles.push(a);
    triangles.push(b);
    triangles.push(c);

    trinagleNormals.push(vec4(a[0], a[1], a[2], 0.0));
    trinagleNormals.push(vec4(b[0], b[1], b[2], 0.0));
    trinagleNormals.push(vec4(c[0], c[1], c[2], 0.0));
}

function bufferstuff(){
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(triangles), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(trinagleNormals), gl.STATIC_DRAW);
    console.log(trinagleNormals);
}

function reCalc(){
    triangles = [];
    trinagleNormals = [];
    tetrahedron(va, vb, vc, vd, count);
    bufferstuff();                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   