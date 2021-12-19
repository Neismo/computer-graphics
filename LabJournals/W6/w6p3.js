/*
  This is both part 3 & 4 
*/
var points = [];

var gl;
var canvas;

var theta = 0.05;
var rotate = 1;
var r = 6;

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

var eyePointLoc;

var model;

// Lights
var lightPos = vec4(0, 0, -1, 0);          // P__l
var lightEmis = vec4(1, 1, 1, 1);             // L__e
var directionToLight = vec4(0, 0, 1, 1);   // l__e
var lightAmb = vec4(0.25, 0.25, 0.25, 1.0);

var kd = vec4(1, 1, 1, 1);             // Diffuse Reflection Coefficient
var ka = vec4(0, 0, 0, 1);             // Ambiend Reflection Coefficient
var ks = vec4(0, 0, 0, 1);

var alpha = 2;

var g_objDoc = null;
var g_drawingInfo = null;

window.onload = function init(){
    // Context
    canvas = document.getElementById("W1-canvas");
    gl = WebGLUtils.setupWebGL(canvas); 
    if (!gl){
        alert("Not supported.");
    }

    var sKa = document.getElementById("sKa");
    sKa.oninput = function () {
        val = sKa.value / 100;
        ka = vec4(val, val, val, 1);
        gl.uniform4fv(kaLoc, ka);
    }

    var sKd = document.getElementById("sKd");
    sKd.oninput = function () {
        val = sKd.value / 100;
        kd = vec4(val, val, val, 1);
        gl.uniform4fv(kdLoc, kd);
    }

    var sKs = document.getElementById("sKs");
    sKs.oninput = function () {
        val = sKs.value / 100;
        ks = vec4(val, val, val, 1);
        gl.uniform4fv(ksLoc, ks);
    }

    var sAlpha = document.getElementById("sAlpha");
    sAlpha.oninput = function () {
        alpha = sAlpha.value / 100;
        gl.uniform1f(alphaLoc, alpha);
    }

    var sEmis = document.getElementById("sEmis");
    sEmis.oninput = function () {
       val = sEmis.value / 100;
       lightEmis = vec4(val, val, val, 1); 
       gl.uniform4fv(lightEmisLoc, lightEmis);
    }

    var pauseBut = document.getElementById("but3");
    pauseBut.onclick = function () {
        if(rotate == 1){
            rotate = 0;
        } else {
            rotate = 1;
        }
    }

    // Viewport
    gl.viewport(0,0,canvas.width, canvas.height);

    // Shaders
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    program.vPosition = gl.getAttribLocation(program, 'vPosition');
    program.vNormal = gl.getAttribLocation(program, 'vNormal');
    program.vColor = gl.getAttribLocation(program, 'vColor');

    var model = initVertexBuffers(gl, program);
    readOBJFile('monke_smooth.obj', gl, model, 1, true);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);


    // Get uniform locations
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix"); // Techincally is just a model matrix, just didn't realize I named it after the book example.
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix")

    lightPosLoc = gl.getUniformLocation(program, "lightPos");
    lightEmisLoc = gl.getUniformLocation(program, "lightEmis");
    directionToLightLoc = gl.getUniformLocation(program, "directionToLight");
    lightAmbLoc = gl.getUniformLocation(program, "lightAmb");
    kdLoc = gl.getUniformLocation(program, "kd");
    kaLoc = gl.getUniformLocation(program, "ka");
    ksLoc = gl.getUniformLocation(program, "ks");
    alphaLoc = gl.getUniformLocation(program, "alpha");
    eyePointLoc = gl.getUniformLocation(program, "eyePoint");

    gl.uniform4fv(lightPosLoc, lightPos);
    gl.uniform4fv(lightEmisLoc, lightEmis);
    gl.uniform4fv(directionToLightLoc, directionToLight);
    gl.uniform4fv(lightAmbLoc, lightAmb);
    gl.uniform4fv(kdLoc, kd);
    gl.uniform4fv(kaLoc, ka);
    gl.uniform4fv(ksLoc, ks);
    gl.uniform1f(alphaLoc, alpha);

    // Perspective - done once.
    aspect = canvas.width/canvas.height;
    P = perspective(45, aspect, 0.1, 50);

    var tick = function(){
        render(model); 
        requestAnimationFrame(tick);
    }
    tick();


}

function render(model){

    if (g_objDoc != null && g_objDoc.isMTLComplete()){
        g_drawingInfo = onReadComplete(gl, model, g_objDoc);
        g_objDoc = null;
        console.log("Drawing Info recieved - now drawing!");
    }
    if (!g_drawingInfo) {return;}

    gl.clearColor(0, 0, 0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    theta += rotate * 0.03%(2*Math.PI);
    matrixFunc();
    bindUniform();

    gl.drawElements(gl.TRIANGLES, g_drawingInfo.indices.length, gl.UNSIGNED_SHORT, 0);
    
}

function matrixFunc(){ // Do model, view, projection matrix calculations

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
    gl.uniform3fv(eyePointLoc, eye);
    var at = vec3(0.0, 0.0, 0.0);
    var up = vec3(0, 1.0, 0.0);
    V = lookAt(eye, at, up);

}

function bindUniform(){
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(ctm));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(P));
    gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(V));
}

function initVertexBuffers(gl, program) {
  var o = new Object(); // Utilize Object object to return multiple buffer objects
  o.vertexBuffer = createEmptyArrayBuffer(gl, program.vPosition, 3, gl.FLOAT); 
  o.normalBuffer = createEmptyArrayBuffer(gl, program.vNormal, 3, gl.FLOAT);
  o.colorBuffer = createEmptyArrayBuffer(gl, program.vColor, 4, gl.FLOAT);
  o.indexBuffer = gl.createBuffer();
  if (!o.vertexBuffer || !o.normalBuffer || !o.colorBuffer || !o.indexBuffer) { 
    console.log("OOF");
    return null; 
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return o;
}

function createEmptyArrayBuffer(gl, a_attribute, num, type) {
  var buffer =  gl.createBuffer();  // Create a buffer object
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return null;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);  // Assign the buffer object to the attribute variable
  gl.enableVertexAttribArray(a_attribute);  // Enable the assignment

  return buffer;
}

function readOBJFile(fileName, gl, model, scale, reverse) {
  var request = new XMLHttpRequest();

  request.onreadystatechange = function() {
    if (request.readyState === 4 && request.status !== 404) {
      onReadOBJFile(request.responseText, fileName, gl, model, scale, reverse);
    }
  }
  request.open('GET', fileName, true); // Create a request to acquire the file
  request.send();                      // Send the request
}

function onReadOBJFile(fileString, fileName, gl, o, scale, reverse) {
  var objDoc = new OBJDoc(fileName);  // Create a OBJDoc object
  var result = objDoc.parse(fileString, scale, reverse); // Parse the file
  if (!result) {
    g_objDoc = null; g_drawingInfo = null;
    console.log("OBJ file parsing error.");
    return;
  }
  g_objDoc = objDoc;
}

function onReadComplete(gl, model, objDoc) {
  // Acquire the vertex coordinates and colors from OBJ file
  var drawingInfo = objDoc.getDrawingInfo();

  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, model.vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.vertices, gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.normals, gl.STATIC_DRAW);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, model.colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.colors, gl.STATIC_DRAW);
  
  // Write the indices to the buffer object
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, drawingInfo.indices, gl.STATIC_DRAW);

  return drawingInfo;
}