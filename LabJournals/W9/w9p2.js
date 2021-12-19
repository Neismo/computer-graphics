var gl;

window.onload = function init(){
    // Context
    var canvas = document.getElementById("W1-canvas");
    gl = WebGLUtils.setupWebGL(canvas); 
    if (!gl){
        alert("Not supported.");
    }

    // Viewport
    gl.viewport(0,0,canvas.width, canvas.height);

    var rot = document.getElementById("toggleRot");
    rot.onclick = function () {
        console.log(rotate);
        if(rotate == 1){
            rotate = 0;
        } else {
            rotate = 1;
        }
    }

    // Shaders
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);
    
    matrixFunc();

    gl.enable(gl.DEPTH_TEST);
    
    // Texture
    doTexture();
    doRedTexture();
    doBlackTexture();

    // Buffers
    bindBuffers();

    modelMatrixLoc = gl.getUniformLocation(program, "modelMatrix");
    viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

    var aspect = canvas.width/canvas.height;
    
    P = perspective(100, aspect, 0.1, 100);
    V = mat4(); 
    gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(V));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(P));

    matrixFunc();
    render();


}

function render(){

    theta += rotate * 0.03 % (Math.PI * 2);
    lightPos = vec4(Math.cos(theta)*2,2,Math.sin(theta)*2 - 2,0);

    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Black Background
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);    

    // DRAW LARGE PLANE
    bindMatrix();
    gl.uniform1i(gl.getUniformLocation(program, "shadows"), 0);
    gl.uniform1i(gl.getUniformLocation(program, "drawMode"), 1);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);

    // DRAW SHADOW ELEMENTS
    shadowModelCalc();
    gl.uniform1i(gl.getUniformLocation(program, "drawMode"), 0);
    gl.uniform1i(gl.getUniformLocation(program, "shadows"), 1);
    gl.drawElements(gl.TRIANGLES, indices.length-6, gl.UNSIGNED_BYTE, 6);

    // DRAW SMALLER PLANES
    bindMatrix();
    gl.uniform1i(gl.getUniformLocation(program, "shadows"), 0);
    gl.drawElements(gl.TRIANGLES, indices.length-6, gl.UNSIGNED_BYTE, 6);

    requestAnimationFrame(render);
}

function matrixFunc(){

    ctm = mat4();
    
    R = mat4();
    R = mult(R, rotateZ(0));
    R = mult(R, rotateX(0)); 
    R = mult(R, rotateY(0));
    T = translate(0, 0, 0); 
    S = scalem(1, 1, 1);
    
    ctm = mult(ctm, S);
    ctm = mult(ctm, R);
    ctm = mult(ctm, T);
}

function bindBuffers(){
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(verts), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

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

function shadowModelCalc(){
    var d = -(lightPos[1] - (-1));
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

    gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(Ms));
}

function bindMatrix(){
    gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(ctm));
}

function doRedTexture(){
    var image = new Uint8Array([255,0,0]);

    gl.activeTexture(gl.TEXTURE1);
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, image);
    
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.uniform1i(gl.getUniformLocation(program, "colorMap"), 1);
    
}

function doBlackTexture(){
    var image = new Uint8Array([0,0,0]);

    gl.activeTexture(gl.TEXTURE2);
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, image);
    
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.uniform1i(gl.getUniformLocation(program, "shadowMap"), 2);
    
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