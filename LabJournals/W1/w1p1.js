
numPoints = 3;

window.onload = function init(){
    // Context
    var canvas = document.getElementById("W1-canvas");
    gl = WebGLUtils.setupWebGL(canvas); 
    if (!gl){
        alert("Not supported.");
    }

    // Background
    gl.viewport(0,0,canvas.width, canvas.height);
    gl.clearColor(0.3921, 0.5843, 0.9294,1.0);

    // Shaders
    //program = initShaders(gl, "vertex-shader", "fragment-shader");
    //gl.useProgram(program)

    render();

}

function render(){
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, numPoints)
}