// Animation attributes:
var height;
var theta = 0;
var translation = vec2(0,0);
var direction = 1;
var speed = 0.01;

// Circle attributes
var numPoints = 100;
var r = 0.5;

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
    gl.useProgram(program)

    // Points & Point Colors
    var vertices = [ vec2(0,0) ];
    var colors = [ vec4(0,1,0,1) ];

    for(var i = 0; i < numPoints+1; i++){
        angle = (2 * Math.PI * i) / numPoints;
        p = vec2(r * Math.cos(angle) , r * Math.sin(angle));
        vertices.push(p);
        colors.push(vec4(0, 0.7, 0,1));
    }

    // VertexBuffers
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Color Buffer
    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    // Bind Theta Value
    height = 1-0.5;
    heightLoc = gl.getUniformLocation(program, "height");
    translationLoc = gl.getUniformLocation(program, "translation");


    render();


}

function render(){
    // Clear canvas.
    gl.clearColor(0.3921, 0.5843, 0.9294,1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // Calculate height of jump (with angle and theta)
    angleY = Math.sin(theta);
    theta += 0.05;
    height = Math.abs(0.5 * angleY);
    
    gl.uniform1f(heightLoc, height);

    // calculate position (with vec2)
    if(translation[0] > 1-r){
        translation = vec2(1.0-r,0);
        direction = -1;
    } else if (translation[0] < -1+r){
        translation = vec2(-1.0+r,0);
        direction = 1;
    } else {
        translation[0] = speed * direction + translation[0];
    }

    gl.uniform2fv(translationLoc, translation);

    // Draw circle
    gl.drawArrays(gl.TRIANGLE_FAN, 0, numPoints+2);
    requestAnimFrame(render);
}