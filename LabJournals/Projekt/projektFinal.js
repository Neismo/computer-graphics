window.onload = function init(){
    // Context
    canvas = document.getElementById("P-canvas");
    
    //drawHUD();

    gl = WebGLUtils.setupWebGL(canvas); 
    if (!gl){
        alert("Not supported.");
    } else {
        console.log("CAD Version 2.0");
    }

    // Event Listeners
    addListeners();

    // Viewport
    gl.viewport(0,0,canvas.width, canvas.height);
    gl.clearColor(0,0,0,1.0);

    // Shaders
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    gl.enable(gl.DEPTH_TEST); // New elements should be on top.

    // Buffers
    console.log("Max Vertices: ", maxVertices);
    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, maxVertices*sizeof['vec3'], gl.STATIC_DRAW);

    vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, maxVertices*sizeof['vec4'], gl.STATIC_DRAW);

    vColor = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    render();


}

function render(){
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
    //console.log(bezierIndices);
    //console.log(index);
    for (var i = 0; i < bezierInfo.length; i++){
        var inf = bezierInfo[i];
        var start = inf[0];
        var count = inf[1];
        gl.drawArrays(gl.LINE_STRIP, start, count);
    }
}

function addListeners() {
    canvas.addEventListener("mousedown", function(event){
        var bbox = event.target.getBoundingClientRect();
        z = 1 - 2 * ((index+1)/maxVertices);
        t = vec3(2*(event.clientX - bbox.left)/canvas.width -1 , 2*(canvas.height-event.clientY+bbox.top-1)/canvas.height-1, z);

        if(drawMode == 2){
            prepareTriangle(t);
        } else if(drawMode == 3){
            prepareCircle(t);
        } else if(drawMode == 1) {
            preparePoint(t);
        } else {
            prepareBezierCurve(t);
        }
    });

    var clearButton = document.getElementById("clear");
    clearButton.addEventListener("click", function(event){
        index = 0;
        tmpIndex = 0;
        points = [];
        triangles = [];
        circles = [];
        bezierIndices = [];
        allPoint = [];
        bezierInfo = [];
        bezWeight = 1.0;
        bezWeights = [];
        render();
    });

    var drawingMode = document.getElementById("drawingMode");
    drawingMode.addEventListener("click", function(event){
        drawMode = drawingMode.selectedIndex;
        tmpIndex = 0;
    });

    var bezierMode = document.getElementById("bezierMode");
    bezierMode.addEventListener("click", function(event){
        bezierDrawMode = bezierMode.selectedIndex;
        tmpIndex = 0;
    });

    document.getElementById("quality").addEventListener("change", function(event){
        console.log(this.value)
        if (tmpIndex != 0){
            console.log("Please, draw first the current beziér curve, before changinf the quality.")
        }
        bezierQual = this.value
    });

    document.getElementById("weightP").addEventListener("change", function(event){
        bezWeight = Math.min(Math.max(0.0, this.value), 10.0);
        console.log(bezWeight);
    });

    window.addEventListener('resize', resize);
    bezierInfo = [];

}

// Inspired by
// https://stackoverflow.com/questions/65154794/how-can-i-get-the-rgb-values-from-color-picker-and-display-them
function hexTorgb(hex) {
  return ['0x' + hex[1] + hex[2] | 0, '0x' + hex[3] + hex[4] | 0, '0x' + hex[5] + hex[6] | 0];
}

function getRGBColor(that){
 let thatv = that.value; 
 let rgbV = hexTorgb(thatv);

 selectedColor = vec4(rgbV[0]/255, rgbV[1]/255, rgbV[2]/255, 1.0)
}
// end inspiration

function setClearColor(that){
 let v = that.value; 
 let rgbV = hexTorgb(v);

 gl.clearColor(rgbV[0]/255, rgbV[1]/255, rgbV[2]/255, 1.0);
 console.log("Clear Color Changed");
}

function sendToBuffer(t, selectedColor){
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, index*sizeof['vec3'], flatten(t));

    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, index*sizeof['vec4'], flatten(selectedColor));
}

function resize(){
    console.log("test");
}


function prepareTriangle(t){
    tmpIndex++;
    sendToBuffer(t, selectedColor);
    if(tmpIndex % 3 == 0){
        var tmp = triPoints.pop();
        triangles.push(triPoints.pop());
        triangles.push(tmp);
        triangles.push(index);
        render();
    } else {
        triPoints.push(index);
    }
    index++;
}

function prepareCircle(t){
    tmpIndex++;
    sendToBuffer(t, selectedColor);
    if(tmpIndex % 2 == 0){
        circles.push(circPoint.pop());
        var pereferi = t;
        var r = Math.sqrt(Math.pow(center[0]-pereferi[0],2) + Math.pow(center[1]-pereferi[1],2));  
        for(var i = 0; i < numCircPoints+1; i++){
            angle = (2 * Math.PI * i) / numCircPoints;
            p = vec3(center[0] + r * Math.cos(angle) , center[1] + r * Math.sin(angle), z);
            sendToBuffer(p, selectedColor);
            circles.push(index);
            index++;
        }
        render();
    } else {
        center = t;
        circPoint.push(index);
    }
    index++;
}

function preparePoint(t) {
    sendToBuffer(t, selectedColor);
    points.push(index);
    render();
    index++;
}

function fac(n){
    if(n == 0) return 1;
    let result = n;
    for(let i = 1; i < n; i++){
        result *= n - i;
    }
    return result;
}

// Not very fast, but alas, it works for a drawing program.
function binom(n, k){
    return fac(n) / (fac(k) * fac(n - k));
}

// Implementation of explicit definition from:
// https://en.wikipedia.org/wiki/B%C3%A9zier_curve#Rational_B%C3%A9zier_curves
// with inspiration from: https://dev.to/ndesmic/splines-from-scratch-bezier-curves-1c1m
function bezierFun(points, t){
    const order = points.length - 1;
    const result = new Array(3);
    for(let d = 0; d < 3; d++){
        let dimRes      = 0;
        let dimWeight   = 0;
        for(let i = 0; i < points.length; i++){
            let weight = binom(order,i) * ((1 - t) ** (order - i)) * (t ** i) * bezWeights[i];
            dimRes += weight * points[i][d]
            dimWeight += weight;
        }
        result[d] = dimRes / dimWeight;
    }
    return result;
}

/*
function bezierFun(points, t){
    const order = points.length - 1;
    const result = new Array(3);
    for(let d = 0; d < 3; d++){
        let dimRes = 0;
        for(let i = 0; i < points.length; i++){
            let weight = 
            dimRes += binom(order,i) * ((1 - t) ** (order - i)) * (t ** i) * points[i][d];
        }
        result[d] = dimRes;
    }
    return result;
}
*/

// RATIONAL BÉZIER CURVE.
function prepareBezierCurve(t){
    bezWeights.push(bezWeight);
    if (bezierDrawMode == 1){ // Cubic (2 control points)
        if (tmpIndex < 4) {
            var initIndex = index
            if (tmpIndex == 0){
                allPoint.push(t);
            } else if (tmpIndex == 1 || tmpIndex == 2) {
                allPoint.push(t);
            } else {
                allPoint.push(t);
                for (var tt = 0; tt <= 1; tt = tt + 1/bezierQual){
                    res = bezierFun(allPoint, tt);
                    sendToBuffer(res, selectedColor);
                    bezierIndices.push(index);
                    index++;
                }
                bezierInfo.push([initIndex,index-initIndex]);
                render();
                allPoint = [];
            }
        }
        tmpIndex++;
        tmpIndex = tmpIndex % 4
    } else { // Quadratic
        if (tmpIndex < 4) {
            var initIndex = index
            if (tmpIndex == 0){
                allPoint.push(t);
            } else if (tmpIndex == 1) {
                allPoint.push(t);
            } else {
                allPoint.push(t);
                for (var tt = 0; tt <= 1; tt = tt + 1/bezierQual){
                    res = bezierFun(allPoint, tt);
                    sendToBuffer(res, selectedColor);
                    bezierIndices.push(index);
                    index++;
                }
                bezierInfo.push([initIndex,index-initIndex]);
                render();
                allPoint = [];
            }
        }
        tmpIndex++;
        tmpIndex = tmpIndex % 3
    }
    if(tmpIndex == 0){
        bezWeights = [];
    }
    console.log(bezierInfo);
}

