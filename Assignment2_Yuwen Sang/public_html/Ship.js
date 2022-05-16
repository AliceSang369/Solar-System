"use strict";
/* COMP 3801 - Assignment 2 Sphere Solar System
 * Yuwen Sang
 */
//The class that handles the rendering of the ship and related viewMat
// - ship will be a cube in white

  let moveValue = 0.2;
  let rotateValue = 1;
  
  let currentRotation = 0;
  let currentForward = 0;
  let currentSideWays = 0;
  let currentUp = 0;
  let initialDistance = 0.5;
  
  // polar coordinates
  let long  = 0;
  let lat  = 0; //latitude is 90 degrees
  let rad  = 2.0;

function Ship(gl, canvas, shaderProgram){
    this.gl = gl;
    this.shaderProgram = shaderProgram;
    this.vetxArr = gl.createVertexArray();
    this.color = vec3(1,1,1);
    gl.bindVertexArray(this.vetxArr);
    var s = 0.025;
    this.cubeArray = Float32Array.of(
         s,  -s,  -s,  // +x face 
         s,   s,  -s,
         s,  -s,   s,
         s,   s,   s,

        -s,  -s,   s,  // -x face 
        -s,   s,   s,
        -s,  -s,  -s,
        -s,   s,  -s,

        -s,   s,  -s,  // +y face 
        -s,   s,   s,
         s,   s,  -s,
         s,   s,   s,

         s,  -s,  -s,  // -y face
         s,  -s,   s,
        -s,  -s,  -s,
        -s,  -s,   s,

        -s,  -s,   s,  // +z face 
         s,  -s,   s,
        -s,   s,   s,
         s,   s,   s,

        -s,   s,  -s,  // -z face
         s,   s,  -s,
        -s,  -s,  -s,
         s,  -s,  -s,
     );
    
    // Load vertex coordinates and colors into WebGL buffer
  this.cubeBuffer = gl.createBuffer();  // get unique buffer ID number
  gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeBuffer );
  gl.bufferData(gl.ARRAY_BUFFER, flatten(this.cubeArray), gl.STATIC_DRAW );
  
  // Specify locations of vertex coordinates in buffer for vPosition
  var floatBytes = 4;  // number of bytes in a float value
  this.vPosition = gl.getAttribLocation(shaderProgram, "vPosition");
  gl.vertexAttribPointer(this.vPosition, 3, gl.FLOAT, false, 3 * floatBytes, 0);
  gl.enableVertexAttribArray(this.vPosition);
  
  // Specify locations of vertex colors in buffer for vColor
  this.vColor = gl.getUniformLocation(shaderProgram, "vColor");
  // Get uniform variable location for transform matrix
  this.mm = gl.getUniformLocation(this.shaderProgram, "modelMat");
  this.vm = gl.getUniformLocation(this.shaderProgram, "viewMat");
  this.pm = gl.getUniformLocation(this.shaderProgram, "projectionMat");
  gl.bindVertexArray(null);  // un-bind our vertexArr
  
  
  
  //ship key movement
canvas.addEventListener("keydown", function(e){
    switch(e.keyCode){
        case 90: //z
            moveForward(-moveValue);
            //alert("call forward, currentMove is"+this.currentMove);
            break;
        case 88: //x
            moveForward(moveValue);
            break;
        case 65: //a
            moveSideways(-moveValue);
            break;
        case 68: //d
            moveSideways(moveValue);
            break;
        case 87: //w
            moveUp(moveValue);
            break;
        case 83: //s
            moveUp(-moveValue);
            break;
        case 81: //q
            rotateShip(-rotateValue);
            break;
        case 69: //e
            rotateShip(rotateValue);
            break;
    }
//    alert(e.keyCode);
});
  function moveForward(delta){ currentForward += delta; } //alert("currentMove = "+currentMove); }
  function moveSideways(delta){ currentSideWays += delta;}
  function moveUp(delta){ currentUp += delta;}
  function rotateShip(delta){ currentRotation += delta;}
    
}

Ship.prototype.numVertices = 24;  // total number of vertices
Ship.prototype.faceVertices = 4;
//ship render draw the ship location 
Ship.prototype.Render=function(viewMat, projectionMat){
    var gl = this.gl;
    gl.bindVertexArray(this.vetxArr);
    //gl.uniform3fv(this.vColor, flatten(this.color))
    
    //setStarting position of the camera
    var modelMat = mat4();
    var r = rotateZ(currentRotation);
    modelMat = mult(r, modelMat);
    var forward = -(initialDistance+currentForward);
    
    modelMat = [vec4(modelMat[0][0], modelMat[0][1], modelMat[0][2], modelMat[0][3]+currentSideWays), 
        vec4(modelMat[1][0], modelMat[1][1], modelMat[1][2], modelMat[1][3]+forward), 
        vec4(modelMat[2][0], modelMat[2][1], modelMat[2][2], modelMat[2][3]+currentUp), 
        vec4(modelMat[3][0], modelMat[3][1], modelMat[3][2], modelMat[3][3])];

    modelMat.matrix = true;
    gl.uniform3fv(this.vColor, flatten(vec3(1.0, 1.0, 1.0)));
    gl.uniformMatrix4fv(this.mm, false, flatten(modelMat));
    gl.uniformMatrix4fv(this.vm, false, flatten(mat4()));
    gl.uniformMatrix4fv(this.pm, false, flatten(projectionMat));
    for (var start = 0; start < this.numVertices; start += this.faceVertices) {
        gl.drawArrays(gl.TRIANGLE_STRIP, start, this.faceVertices);
    }
    gl.bindVertexArray(null);  // un-bind our verterxArr
};

function getViewMat(){
    var cx = (initialDistance+currentForward*10); // z/x
    var cy = currentUp;// w/s
    var cz = currentSideWays; // a/d
    
    var r = initialDistance+currentForward;//Math.sqrt((cx)^2+(cy)^2+(cz)^2);
    var rx = Math.cos(radians(currentRotation))*r+cx;
    var ry = currentUp;
    var rz = Math.sin(radians(currentRotation))*r+cz;
    
    
    var long = currentUp;
    var lat = currentSideWays;
    var rad = initialDistance+currentForward;
    var cx = rad * Math.cos(lat*Math.PI/180) * Math.cos(long*Math.PI/180);
    var cy = rad * Math.cos(lat*Math.PI/180) * Math.sin(long*Math.PI/180);
    var cz = rad * Math.sin(lat*Math.PI/180);
    var at = vec3(0,0,0); //vec3(rx,ry,rz);
    var up = vec3(0,1,0);  //positive direction
    var vm = lookAt(vec3(cx, cy, cz), at, up);
    return vm;
}

