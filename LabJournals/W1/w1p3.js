var theta;

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
    var vertices = [ vec2(-0.5,0.0), vec2(0.5,0.0), vec2(0.0, 0.5),
                     vec2(-0.5,0.0), vec2(0.5,0.0), vec2(0.0, -0.5)];
    
    var colors = [ vec4(1,0,0) , vec4(0,1,0), vec4(0,0,1),
                   vec4(1,0,0) , vec4(0,1,0), vec4(0,0,1) ];

    // Buffers
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    // Bind Theta Value
    theta = 0.0;
    thetaLoc = gl.getUniformLocation(program, "theta");

    render();


}

function render(){
    gl.clearColor(0.3921, 0.5843, 0.9294,1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    theta += 0.005;
    gl.uniform1f(thetaLoc, theta);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimFrame(render);
}