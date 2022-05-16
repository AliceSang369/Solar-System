"use strict";
/* COMP 3801 - Assignment 2 Sphere Solar System
 * Yuwen Sang
 */

//In the Ring class, we will draw a triangle strip on the x-z plane as a ring.
//use orbitDist and thickness instead of the inner and outter radius in the instruction
function Ring(gl, shaderProgram, orbitDist,thickness, tiltDegree){ 
    var t = this;
    this.gl = gl;
    this.shaderProgram = shaderProgram;
    this.ringSections = 100;
    this.orbitDist = orbitDist/20;
    this.tiltDegree = radians(tiltDegree);
    var innerRadius = this.orbitDist;
    var outterRadius = this.orbitDist + thickness;
    this.attachMat =[vec4(0,0,0,0),
                    vec4(0,0,0,0), 
                    vec4(0,0,0,0),
                    vec4(0,0,0,0)];
    this.attachMat.matrix = true;
    this.vetxArr = gl.createVertexArray();
    gl.bindVertexArray(this.vetxArr);
    
    this.verticies = [];
    
    var degree = 0.0;
    var degDiff = Math.PI/this.ringSections;
    var tilt = -this.tiltDegree;
    var tiltDiff = (this.tiltDegree/this.ringSections)*2;
    var addFlag = false;
    for(var i = 0; i <= this.ringSections; i++){
        var sinD = Math.sin(degree);
        var cosD = Math.cos(degree);
        var sinT = Math.sin(tilt);
        var cosT = Math.cos(tilt);
        
        var innerX = cosT * cosD * innerRadius;
        var outterX = cosT * cosD * outterRadius;
        var innerY = sinT * innerRadius;
        var outterY = sinT * outterRadius;
        var innerZ = sinD * innerRadius;
        var outterZ = sinD * outterRadius;
        this.verticies.push(vec3(innerX, innerY, innerZ));
        this.verticies.push(vec3(outterX, outterY, outterZ));
        degree += degDiff;
        tilt += tiltDiff;
    }
    
    
    //add the second half verticies of the ring
    this.verts = [];
    for (var i in this.verticies){
        var temp = this.verticies[i];
        var temp = vec3(temp[0], temp[1], -temp[2]);
        this.verts.push(temp);
    }
    for(var i in this.verts){ this.verticies.push(this.verts[i]); }
    
    
    this.ringBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.ringBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(this.verticies), gl.STATIC_DRAW);
    
    var floatBytes = 4;
    this.vPosition = gl.getAttribLocation(this.shaderProgram, "vPosition");
    gl.vertexAttribPointer(this.vPosition, 3, gl.FLOAT, false, 3 * floatBytes, 0);
    gl.enableVertexAttribArray(this.vPosition);
    
    this.vColor = gl.getUniformLocation(shaderProgram, "vColor");
    this.mm = gl.getUniformLocation(this.shaderProgram, "modelMat");
    this.vm = gl.getUniformLocation(this.shaderProgram, "viewMat");
    this.pm = gl.getUniformLocation(this.shaderProgram, "projectionMat");
    this.lightPosition = gl.getUniformLocation(shaderProgram, "lightPosition");
    this.ambientFactor = gl.getUniformLocation(shaderProgram, "ambientFactor");
    gl.bindVertexArray(null);
};

Ring.prototype.Render = function(viewMat, color, projectionMat, lightPosition, ambientFactor){
    var gl = this.gl;
    gl.bindVertexArray(this.vetxArr);
    var modelMat = mat4();
    modelMat.matrix = true;
    modelMat = add(modelMat, this.attachMat);
    //modelMat = mult(viewMat, modelMat);
    gl.uniformMatrix4fv(this.mm, false, flatten(modelMat));
    gl.uniformMatrix4fv(this.vm, false, flatten(viewMat));
    gl.uniformMatrix4fv(this.pm, false, flatten(projectionMat));
    gl.uniform3fv(this.lightPosition, flatten(lightPosition));
    gl.uniform1f(this.ambientFactor, ambientFactor);
    gl.uniform3fv(this.vColor, flatten(vec3(1,1,1)));
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.ringSections*4+4);
    gl.bindVertexArray(null);
};