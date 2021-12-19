var maxVertices = 1000;
var index = 0;
var tmpIndex = 0;
var selectedColor = vec4( 0.0, 0.0, 0.0, 1.0 );

var points = [];

var triangles = [];
var triPoints = [];

var circles = [];
var circPoint = [];
var center;
var numCircPoints = 20;

var drawMode = 0; // 0 = points, 1 = triangles, 2 = circles

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
        var bbox = event.target.getBoundingClientRect();
        
        var z = 1 - 2 * ((index+1)/maxVertices)
        t =  vec3(2*(event.clientX - bbox.left)/canvas.width -1 , 2*(canvas.height-event.clientY+bbox.top-1)/canvas.height-1, z);

        // Abstract out into func?
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, index*sizeof['vec3'], flatten(t));

        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, index*sizeof['vec4'], flatten(selectedColor));

        if(drawMode == 1){
            tmpIndex++;
            if(tmpIndex % 3 == 0){
                var tmp = triPoints.pop();
                triangles.push(triPoints.pop());
                triangles.push(tmp);
                triangles.push(index);
                render();
            } else {
                triPoints.push(index);
            }
        } else if(drawMode == 2){
            tmpIndex++;
            if(tmpIndex % 2 == 0){
                circles.push(circPoint.pop());
                var pereferi = t;
                var r = Math.sqrt(Math.pow(center[0]-pereferi[0],2) + Math.pow(center[1]-pereferi[1],2));  
                for(var i = 0; i < numCircPoints+1; i++){
                    angle = (2 * Math.PI * i) / numCircPoints;
                    p = vec3(center[0] + r * Math.cos(angle) , center[1] + r * Math.sin(angle), z);
                    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
                    gl.bufferSubData(gl.ARRAY_BUFFER, index*sizeof['vec3'], flatten(p));
                    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
                    gl.bufferSubData(gl.ARRAY_BUFFER, index*sizeof['vec4'], flatten(selectedColor));
                    circles.push(index);
                    index++;
                }
                render();
            } else {
                center = t;
                circPoint.push(index);
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
        circles = []
        render();
    })

    var menu = document.getElementById("colors");
    menu.addEventListener("click", function(event){
        selectedColor = colors[menu.selectedIndex];
    })

    var drawingMode = document.getElementById("drawingMode");
    drawingMode.addEventListener("click", function(event){
        drawMode = drawingMode.selectedIndex;
        tmpIndex = 0;
    })

    // Viewport
    gl.viewport(0,0,canvas.width, canvas.height);

    // Shaders
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    gl.enable(gl.DEPTH_TEST); // New elements should be on top.

    // Buffers
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, maxVertices*sizeof['vec3'], gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
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
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_TEST_BIT);

    for(var i = 0; i < circles.length; i = i+numCircPoints+2){
        gl.drawArrays(gl.TRIANGLE_FAN, circles[i], numCircPoints+2);
    }

    for(var i = 0; i < triangles.length; i = i+3){
        gl.drawArrays(gl.TRIANGLES, triangles[i], 3);
    }
    for(var i = 0; i < points.length; i++){
        gl.drawArrays(gl.POINTS, points[i], 1);
    }
}