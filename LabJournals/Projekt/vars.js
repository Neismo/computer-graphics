var maxVertices = 100000;
var index = 0;
var tmpIndex = 0;

var t, z;
var selectedColor = vec4( 1.0, 0.0, 0.0, 1.0 );

var points = [];

var triangles = [];
var triPoints = [];

var circles = [];
var circPoint = [];
var center;
var numCircPoints = 50;

var bezierIndices = [];
var curveLengths = [];
var allPoint = [];
var bezierInfo = [];
var bezWeight = 1.0;
var bezWeights = [];

var drawMode = 0; // 0 = points, 1 = triangles, 2 = circles
var bezierDrawMode = 0;
var bezierQual = 10;

var gl;

var canvas, HUD;

var vBuffer, vPosition, cBuffer, vColor;