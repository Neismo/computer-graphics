var maxVertices = 1000;
var index = 0;
var triIndex = 0;
var selectedColor = vec4( 0.0, 0.0, 0.0, 1.0 );

var points = []

var triangles = [];
var triPoints = [];

var drawPoints = true;

var gl;

var colors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
];

window.onload = function init(){
    // Context
    var canvas = document.getElementById("W1-canvas");
    gl = WebGLUtils.setupWebGL(canvas); 
    if (!gl){
        alert("Not supported.");
    }

    // Event Listeners
    canvas.addEventListener("mousedown", function(event){
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        var bbox = event.target.getBoundingClientRect();
        
        t =  vec2(2*(event.clientX - bbox.left)/canvas.width -1 , 2*(canvas.height-event.clientY+bbox.top-1)/canvas.height-1);


        gl.bufferSubData(gl.ARRAY_BUFFER, index*sizeof['vec2'], flatten(t));

        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, index*sizeof['vec4'], flatten(selectedColor));

        if(!drawPoints){
            triIndex++;
            if(triIndex % 3 == 0){
                var tmp = triPoints.pop();
                triangles.push(triPoints.pop());
                triangles.push(tmp);
                triangles.push(index);
                render();
            } else {
                triPoints.push(index);
            }
        } else {
            points.push(index);
            render();
        }
        
        index++;
    })

    var clearButton = document.getElementById("clear");
    clearButton.addEventListener("click", function(event){
        index = 0;
        points = [];
        triangles = [];
        render();
    })

    var menu = document.getElementById("colors");
    menu.addEventListener("click", function(event){
        selectedColor = colors[menu.selectedIndex];
    })

    var drawingMode = document.getElementById("drawingMode");
    drawingMode.addEventListener("click", function(event){
        if(drawPoints){
            drawPoints = false;
            drawingMode.value = "Drawing Triangles";
            console.log(drawingMode.value)
            triIndex = 0;
        } else {
            drawPoints = true;
            drawingMode.value = "Drawing Points";
            console.log(drawingMode.value)
        }
    })

    // Viewport
    gl.viewport(0,0,canvas.width, canvas.height);

    // Shaders
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Buffers
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, maxVertices*sizeof['vec2'], gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, maxVertices*sizeof['vec4'], gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    render();


}

function render(){
    gl.clearColor(0.3921, 0.5843, 0.9294,1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    for(var i = 0; i < points.length; i++){
        gl.drawArrays(gl.POINTS, points[i], 1);
    }
    for(var i = 0; i < triangles.length; i = i+3){
        gl.drawArrays(gl.TRIANGLES, triangles[i], 3);
    }
}