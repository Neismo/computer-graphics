var points = [];

var gl;
var canvas;

var theta = 0.05;

// W11
var thetaX = 0.05;
var thetaY = 0.05;
var lastX = -1;
var lastY = -1;
var u;
var v;
var dragging = false;
var noDrag = false;

var dateStart;
var dateEnd;

var rotate = 1;
var r = 6;

var q_rot = new Quaternion();
var q_inc = new Quaternion();

var camMode = 1;

// Matrices
//    Translate, Rotation, Scaling
var R;
var T;
var S;

var ctm;
var P;
var V

var eye;
var at;
var up;
var z;
var z_len;

var aspect;
var vBuffer;

var eyePointLoc;

var model;

// Lights
var lightPos = vec4(0, 0, -1, 0);          // P__l
var lightEmis = vec4(1, 1, 1, 1);             // L__e
var directionToLight = vec4(0, 0, 1, 1);   // l__e
var lightAmb = vec4(0.25, 0.25, 0.25, 1.0);

var kd = vec4(1, 1, 1, 1);             // Diffuse Reflection Coefficient
var ka = vec4(0, 0, 0, 1);             // Ambiend Reflection Coefficient
var ks = vec4(0, 0, 0, 1);

var alpha = 2;

var g_objDoc = null;
var g_drawingInfo = null;
