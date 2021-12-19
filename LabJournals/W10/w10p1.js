window.onload = function init(){
    // Context
    canvas = document.getElementById("W1-canvas");
    gl = WebGLUtils.setupWebGL(canvas); 
    if (!gl){
        alert("Not supported.");
    }

    setupListeners();

    // Viewport
    gl.viewport(0,0,canvas.width, canvas.height);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Shaders
    program_teapot = initShaders(gl, "vertex-shader", "fragment-shader");
    program_quad = initShaders(gl, "vertex-shader-quad", "fragment-shader-quad");

    gl.useProgram(program_quad);
    var modelQuad = prepareQuad();
    prepareQuadBuffers(modelQuad);
    doTexture();

    gl.useProgram(program_teapot);

    var modelTeapot = prepareTeapot();

    readOBJFile('models/teapot/teapot.obj', gl, modelTeapot, 1, true);

    get();
    send();

    // Perspective - done once.
    aspect = canvas.width/canvas.height;
    P = perspective(90, aspect, 0.1, 100);
    
    matrixFunc();

    var tick = function(){
        render(modelTeapot, modelQuad); 
        requestAnimationFrame(tick);
    }
    tick();


}

function render(modelTeapot, modelQuad){

    if (g_objDoc != null && g_objDoc.isMTLComplete()){
        g_drawingInfo = onReadComplete(gl, modelTeapot, g_objDoc);
    }
    if (!g_drawingInfo) {return;}

    gl.clearColor(lightAmb[0], lightAmb[1], lightAmb[2], 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    theta += rotate * 0.03%(2*Math.PI);
    lightPos = vec4(Math.cos(theta)*2,2,Math.sin(theta)*2 - 2, 1);
    setupLightV();
    send();

    drawQuad(modelQuad);

    // Shadow?
    drawShadowTeapot(modelTeapot);

    
    gl.uniform1i(gl.getUniformLocation(program_teapot, "shadows"), 0);
    gl.depthFunc(gl.LESS);
    drawTeapot(modelTeapot);

    
}

function drawTeapot(model){
  gl.useProgram(program_teapot);
  matrixFunc();
  bindUniform(program_teapot);
  onReadComplete(gl, model, g_objDoc);
  initAttributeVariable(gl, program_teapot.vPosition, model.vertexBuffer, 3, gl.FLOAT);
  initAttributeVariable(gl, program_teapot.vColor, model.colorBuffer, 4, gl.FLOAT);
  initAttributeVariable(gl, program_teapot.vNormal, model.normalBuffer, 3, gl.FLOAT);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
  gl.drawElements(gl.TRIANGLES, g_drawingInfo.indices.length, gl.UNSIGNED_SHORT, 0);
}

function drawShadowTeapot(model){
  gl.useProgram(program_teapot);
  matrixFunc();
  bindUniform(program_teapot);
  gl.depthFunc(gl.GREATER);
  gl.uniform1i(gl.getUniformLocation(program_teapot, "shadows"), 1);
  shadowModelCalc();
  onReadComplete(gl, model, g_objDoc);
  initAttributeVariable(gl, program_teapot.vPosition, model.vertexBuffer, 3, gl.FLOAT);
  initAttributeVariable(gl, program_teapot.vColor, model.colorBuffer, 4, gl.FLOAT);
  initAttributeVariable(gl, program_teapot.vNormal, model.normalBuffer, 3, gl.FLOAT);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
  gl.drawElements(gl.TRIANGLES, g_drawingInfo.indices.length, gl.UNSIGNED_SHORT, 0);
}

function drawQuad(model){
  gl.useProgram(program_quad);
  ctm = mat4();
  bindUniform(program_quad);
  initAttributeVariableQuad(gl, program_quad.vPosition, model.vertexBuffer, 3, gl.FLOAT, quadVerts);
  initAttributeVariableQuad(gl, program_quad.texCoord, model.texBuffer, 2, gl.FLOAT, texCoord);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0);
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

function prepareQuad(){
  program_quad.vPosition = gl.getAttribLocation(program_quad, "vPosition");
  program_quad.vTexCoord = gl.getAttribLocation(program_quad, "vTexCoord");  

  program_quad.modelMatrixLoc = gl.getUniformLocation(program_quad, "modelMatrix");
  program_quad.projectionMatrixLoc = gl.getUniformLocation(program_quad, "projectionMatrix");
  program_quad.viewMatrixLoc = gl.getUniformLocation(program_quad, "viewMatrix")

  var o = new Object(); // Utilize Object object to return multiple buffer objects
  o.vertexBuffer = createEmptyArrayBuffer(gl, program_quad.vPosition, 3, gl.FLOAT);
  o.texBuffer = createEmptyArrayBuffer(gl, program_quad.vTexCoord, 2, gl.FLOAT)
  o.indexBuffer = gl.createBuffer();
  if (!o.vertexBuffer || !o.texBuffer || !o.indexBuffer) { 
    console.log("OOF");
    return null; 
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return o;

}

function prepareQuadBuffers(model){
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, model.vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(quadVerts), gl.STATIC_DRAW);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, model.texBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoord), gl.STATIC_DRAW);
  
  // Write the indices to the buffer object
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);
}

function initAttributeVariable(gl, a_attribute, buffer, num, type) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  gl.enableVertexAttribArray(a_attribute);
}

function initAttributeVariableQuad(gl, a_attribute, buffer, num, type, data) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(data), gl.STATIC_DRAW);
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  gl.enableVertexAttribArray(a_attribute);
}

function prepareTeapot(){
  program_teapot.vPosition = gl.getAttribLocation(program_teapot, 'vPosition');
  program_teapot.vNormal = gl.getAttribLocation(program_teapot, 'vNormal');
  program_teapot.vColor = gl.getAttribLocation(program_teapot, 'vColor');
  return initVertexBuffers(gl, program_teapot);
}

function bindUniform(model){
    gl.uniformMatrix4fv(model.modelMatrixLoc, false, flatten(ctm));
    gl.uniformMatrix4fv(model.projectionMatrixLoc, false, flatten(P));
    if(useLightV) gl.uniformMatrix4fv(model.viewMatrixLoc, false, flatten(lightV));
    else gl.uniformMatrix4fv(model.viewMatrixLoc, false, flatten(V));
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

function matrixFunc(){ // Do model, view, projection matrix calculations

    ctm = mat4();
    R = mat4();
    R = mult(R, rotateZ(0));
    R = mult(R, rotateX(0));
    R = mult(R, rotateY(0));
    T = translate(0, -1 + (1 + Math.cos(theta))/2, -3.0);
    S = scalem(0.25, 0.25, 0.25);
    
    ctm = mult(ctm, T);
    ctm = mult(ctm, R);
    ctm = mult(ctm, S);
    
    var eye = vec3(0, 0.25, 1.2);
    gl.uniform3fv(program_teapot.eyePointLoc, eye);
    var at = vec3(0, 0, 0);
    var up = vec3(0, 1.0, 0);
    V = lookAt(eye, at, up);

}

function setupLightV(){
  var eye = vec3(lightPos[0], lightPos[1], lightPos[2]);
  var at = vec3(0, -1, -3);
  var up = vec3(0, 1, 0);
  lightV = lookAt(eye, at, up);
}

function get(){
  // Get uniform locations
  program_teapot.modelMatrixLoc = gl.getUniformLocation(program_teapot, "modelMatrix"); // Techincally is just a model matrix, just didn't realize I named it after the book example.
  program_teapot.projectionMatrixLoc = gl.getUniformLocation(program_teapot, "projectionMatrix");
  program_teapot.viewMatrixLoc = gl.getUniformLocation(program_teapot, "viewMatrix")

  program_teapot.lightPosLoc = gl.getUniformLocation(program_teapot, "lightPos");
  program_teapot.lightEmisLoc = gl.getUniformLocation(program_teapot, "lightEmis");
  program_teapot.directionToLightLoc = gl.getUniformLocation(program_teapot, "directionToLight");
  program_teapot.lightAmbLoc = gl.getUniformLocation(program_teapot, "lightAmb");
  program_teapot.kdLoc = gl.getUniformLocation(program_teapot, "kd");
  program_teapot.kaLoc = gl.getUniformLocation(program_teapot, "ka");
  program_teapot.ksLoc = gl.getUniformLocation(program_teapot, "ks");
  program_teapot.alphaLoc = gl.getUniformLocation(program_teapot, "alpha");
  program_teapot.eyePointLoc = gl.getUniformLocation(program_teapot, "eyePoint");
}

function send(){
  gl.uniform4fv(program_teapot.lightPosLoc, lightPos);
  gl.uniform4fv(program_teapot.lightEmisLoc, lightEmis);
  gl.uniform4fv(program_teapot.directionToLightLoc, directionToLight);
  gl.uniform4fv(program_teapot.lightAmbLoc, lightAmb);
  gl.uniform4fv(program_teapot.kdLoc, kd);
  gl.uniform4fv(program_teapot.kaLoc, ka);
  gl.uniform4fv(program_teapot.ksLoc, ks);
  gl.uniform1f(program_teapot.alphaLoc, alpha);
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
  image.src = '../W9/xamp23.png';

  gl.uniform1i(gl.getUniformLocation(program_quad, "texMap"), 0);
  
}

function shadowModelCalc(){
    var d = -(lightPos[1] - (-1 - eps));
    var Mp = mat4(vec4(1, 0, 0, 0),
                  vec4(0, 1, 0, 0),
                  vec4(0, 0, 1, 0),
                  vec4(0, 1/d, 0, 0));
    var TtoC = translate(-lightPos[0], -lightPos[1], -lightPos[2]);
    var Tback = translate(lightPos[0], lightPos[1], lightPos[2]);

    var Ms = mat4();
    Ms = mult(ctm, Ms);
    Ms = mult(TtoC,Ms);
    Ms = mult(Mp, Ms);
    Ms = mult(Tback, Ms);

    gl.uniformMatrix4fv((gl.getUniformLocation(program_teapot, "modelMatrix")), false, flatten(Ms));
}

function setupListeners(){
  var sKa = document.getElementById("sKa");
    sKa.oninput = function () {
        val = sKa.value / 100;
        ka = vec4(val, val, val, 1);
        gl.uniform4fv(program_teapot.kaLoc, ka);
    }

    var sKd = document.getElementById("sKd");
    sKd.oninput = function () {
        val = sKd.value / 100;
        kd = vec4(val, val, val, 1);
        gl.uniform4fv(program_teapot.kdLoc, kd);
    }

    var sKs = document.getElementById("sKs");
    sKs.oninput = function () {
        val = sKs.value / 100;
        ks = vec4(val, val, val, 1);
        gl.uniform4fv(program_teapot.ksLoc, ks);
    }

    var sAlpha = document.getElementById("sAlpha");
    sAlpha.oninput = function () {
        alpha = sAlpha.value / 100;
        gl.uniform1f(program_teapot.alphaLoc, alpha);
    }

    var sEmis = document.getElementById("sEmis");
    sEmis.oninput = function () {
       val = sEmis.value / 100;
       lightEmis = vec4(val, val, val, 1);
       gl.uniform4fv(program_teapot.lightEmisLoc, lightEmis);
    }

    var pauseBut = document.getElementById("but3");
    pauseBut.onclick = function () {
        if(rotate == 1){
            rotate = 0;
        } else {
            rotate = 1;
        }
    }

    var changeView = document.getElementById("VChange");
    changeView.onclick = function () {
      useLightV = !useLightV;
    }
}