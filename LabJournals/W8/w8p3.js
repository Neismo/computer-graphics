var points = [];

var gl;
var canvas;

var theta = 0.05;
var rotate = 1;
var r = 3;
// Tetrahedon stuff
var va = vec4(0.0, 0.0, 1.0, 1);
var vb = vec4(0.0, 0.942809, -0.333333, 1);
var vc = vec4(-0.816497, -0.471405, -0.333333, 1);
var vd = vec4(0.816497, -0.471405, -0.333333, 1);

var triangles = [];
var triangleColors = [];
var trinagleNormals = [];
var count = 4;

var triangleEnd;
var cubeStart;

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
var reflectLoc;
var mTexLoc;

// Lights
var lightPos = vec4(0, 0, -1, 0);          // P__l
var lightEmis = vec4(1, 1, 1, 1);             // L__e
var directionToLight = vec4(0, 0, 1, 1);   // l__e
var lightAmb = vec4(0.25, 0.25, 0.25, 1.0);

var kd = vec4(1, 1, 1, 1);             // Diffuse Reflection Coefficient
var ka = vec4(0, 0, 0, 1);             // Ambiend Reflection Coefficient
var ks = vec4(0, 0, 0, 1);

var alpha = 0.1;
var g_tex_ready = 0;

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

    textureFunction();

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
    reflectLoc = gl.getUniformLocation(program, "reflect");
    mTexLoc = gl.getUniformLocation(program, "mTex");

    gl.uniform4fv(lightPosLoc, lightPos);
    gl.uniform4fv(lightEmisLoc, lightEmis);
    gl.uniform4fv(directionToLightLoc, directionToLight);
    gl.uniform4fv(lightAmbLoc, lightAmb);
    gl.uniform4fv(kdLoc, kd);
    gl.uniform4fv(kaLoc, ka);
    gl.uniform4fv(ksLoc, ks);
    gl.uniform1f(alphaLoc, alpha);
    gl.uniform1f(gl.getUniformLocation(program, "PI"), Math.PI);

    // Perspective - done once.
    aspect = canvas.width/canvas.height;
    P = mat4();
    P = perspective(90, aspect, 0.1, 10);

    reCalc();
    render();


}

function render(){
    if(g_tex_ready < 6){
    } else {
        gl.clearColor(0, 0, 0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        theta += rotate * 0.01%(2*Math.PI);
        
        matrixFunc();
        bindUniform();

        // DRAW SPHERE
        gl.uniform1i(gl.getUniformLocation(program, "reflectVar"), 1);
        mTex = mat4();
        gl.uniformMatrix4fv(mTexLoc, false, flatten(mTex));
        gl.drawArrays(gl.TRIANGLES, 0, triangleEnd);

        // TODO: DRAW BACKGROUND:
        gl.uniform1i(gl.getUniformLocation(program, "reflectVar"), 0);
        calcMTex();
        V = mat4();
        P = mat4();
        ctm = mat4();

        bindUniform();
        gl.uniformMatrix4fv(mTexLoc, false, flatten(mTex));
        gl.drawArrays(gl.TRIANGLES, triangleEnd, 6);

    }
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

    //ctm = mat4();

    
    var eye = vec3(r*Math.cos(theta), 0, r*Math.sin(theta));
    gl.uniform3fv(eyePointLoc, eye);
    var at = vec3(0.0, 0.0, 0.0);
    var up = vec3(0, 1.0, 0.0);
    V = mat4();
    V = lookAt(eye, at, up);

    P = perspective(90, aspect, 0.1, 10);

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

    trinagleNormals.push(vec4(a[0], a[1], a[2], 1.0));
    trinagleNormals.push(vec4(b[0], b[1], b[2], 1.0));
    trinagleNormals.push(vec4(c[0], c[1], c[2], 1.0));
}

function bufferstuff(){
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(triangles), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(trinagleNormals), gl.STATIC_DRAW);
}

function reCalc(){
    triangles = [];
    trinagleNormals = [];
    tetrahedron(va, vb, vc, vd, count);
    triangleEnd = triangles.length;
    quadFunc();
    bufferstuff();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
}

function calcMTex(){
    pInv = inverse(P);
    v3Inv = inverse(mat3(vec3(V[0][0],V[0][1],V[0][2]), vec3(V[1][0],V[1][1],V[1][2]), vec3(V[2][0],V[2][1],V[2][2])));
    vInv = mat4(vec4(v3Inv[0][0], v3Inv[0][1], v3Inv[0][2], 0), vec4(v3Inv[1][0], v3Inv[1][1], v3Inv[1][2], 0), vec4(v3Inv[2][0], v3Inv[2][1], v3Inv[2][2], 0), vec4(0,0,0,0));
    mTex = mult(vInv, pInv);
}

function textureFunction(){

    var cubemap =   ['textures/cm_left.png',
                    'textures/cm_right.png',
                    'textures/cm_top.png',
                    'textures/cm_bottom.png',
                    'textures/cm_back.png',
                    'textures/cm_front.png']
    
    gl.activeTexture(gl.TEXTURE0);
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    
    for(var i = 0; i < 6; i++){
        var image = document.createElement('img');
        image.crossOrigin = 'anonymous';
        image.textarget = gl.TEXTURE_CUBE_MAP_POSITIVE_X + i;
        image.onload = function(event){
            var image = event.target;
            gl.activeTexture(gl.TEXTURE0);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(image.textarget, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
            ++g_tex_ready;
        };
        image.src = cubemap[i];
    }

    gl.uniform1i(gl.getUniformLocation(program, "texMap"), 0);

}

function quadFunc(){
    triangles.push(vec4(-1,-1, 0.999999, 1));
    triangles.push(vec4( 1,-1, 0.999999, 1));
    triangles.push(vec4(-1, 1, 0.999999, 1));
    triangles.push(vec4(-1, 1, 0.999999, 1));
    triangles.push(vec4( 1,-1, 0.999999, 1));
    triangles.push(vec4( 1, 1, 0.999999, 1));
    
    trinagleNormals.push(normalize(vec4( 1, -1,1, 1), true));
    trinagleNormals.push(normalize(vec4( -1, -1,1, 1), true));
    trinagleNormals.push(normalize(vec4( 1, 1,1, 1), true));
    trinagleNormals.push(normalize(vec4( 1, 1,1, 1), true));
    trinagleNormals.push(normalize(vec4( -1, -1,1, 1), true));
    trinagleNormals.push(normalize(vec4( -1, 1, 1, 1), true));

    console.log(triangles);
    console.log(triangleEnd);
    
}