/* COMP 3801 - Assignment 2 Sphere Solar System
 * Yuwen Sang
 */
"use strict";

function Solar(canvasID) {
  var t = this;  // save reference to this object for callbacks
  this.canvasID = canvasID;
  var canvas = this.canvas = document.getElementById(canvasID);
  if (!canvas) {
      alert("Canvas ID '" + canvasID + "' not found.");
      return;
  }
  
  var gl = this.gl = WebGLUtils.setupWebGL(this.canvas);
  if (!gl) {
      alert("WebGL isn't available in this browser");
      return;
  }
  gl.enable(gl.SCISSOR_TEST);
  gl.enable(gl.DEPTH_TEST);
  
  var aspectRatio = (canvas.width/2) / canvas.height;
  if (aspectRatio > 1.0) {
    this.aspectScale = scalem(1.0/aspectRatio, 1.0, 1.0);
  } else {
    this.aspectScale = scalem(1.0, aspectRatio, 1.0);
  }

   //Add animation
  var flag = false;
  var viewMat = mat4();
  
  var ppButton = document.getElementById("gl-canvas-PP-button");
  var viewSwitchButton = document.getElementById("gl-canvas-ViewSwitch-button");
  var orbitButton = document.getElementById("gl-canvas-OrbitOC-button");
  
  ppButton.addEventListener("click", function(){
    flag = !flag;
  });
  
  var viewSwitch = true;
  viewSwitchButton.addEventListener("click", function(){
      viewSwitch = !viewSwitch;
  });
  
  var showOrbit = false;
  orbitButton.addEventListener("click", function(){showOrbit = !showOrbit});
  //****************************************//
  gl.viewport(0, 0, canvas.width, canvas.height);
  // Enable hidden-surface removal (draw pixel closest to viewer)
  
  gl.clearColor(0.2, 0.2, 0.3, 1.0);
  // Compile and link shaders
  this.shaderProgram = initShaders(gl, "vShader.glsl", "fShader.glsl");
  if (this.shaderProgram === null) return;
  gl.useProgram(this.shaderProgram);
  //Now create a fixed + world y map view here..
  // Setup a fixed perspective projection matrix
  var fov = 90.0;
  var aspect = this.canvas.width / this.canvas.height; //(this.canvas.width/2) / this.canvas.height;
  var near = 0.1;
  var far = 20.0;
  this.projectionMat = perspective(fov, aspect, near, far);
  
  // polar coordinates
  var long  = 0;
  var lat  = 90; //latitude is 90 degrees
  var rad  = 2.0;
 
  // Note Math.cos/sin need rad so need to convert from degrees
  var cx = rad * Math.cos(lat*Math.PI/180) * Math.cos(long*Math.PI/180);
  var cy = rad * Math.sin(lat*Math.PI/180);
  var cz = rad * Math.cos(lat*Math.PI/180) * Math.sin(long*Math.PI/180);
  
  var eye = vec3(cx,cy,cz);  // location of camera
   // Look at and up 
  var at = vec3(0,0,0);  // always looking at the center
  var up = vec3(0,1,0);  // this will work for everything except the poles
  viewMat = lookAt(eye, at, up);  // Form the view matrix
  //viewMat = mult(this.projectionMat, viewMat);
  viewMat = mult(this.aspectScale, viewMat);
  
  
  var animate = function(){
      t.Render(flag, viewMat, viewSwitch, showOrbit);
      requestAnimationFrame(animate);
  };
  
  var orbitDistArray = [5, 10, 15, 2, 25, 3, 2, 2.5, 3, 40, 50, 60];
  for(var i = 0; i < orbitDistArray.length; i++){
      orbitDistArray[i] = orbitDistArray/20;
  }
  //Planet constructor takes: gl, shaderProgram, scale, color, dayPeriod, yearPeriod, orbitDist, axisTilt, orbitTilt
  this.sun = new Planet(gl, this.shaderProgram, 8.0, "sun.png", 0, 0, 0, 0, 0);
  this.mercury = new Planet(gl, this.shaderProgram, 1.0, "mercury.png", 10, 100, 5, 0, 7);
  this.venus = new Planet(gl, this.shaderProgram, 2.0, "venus.png",1, 50, 10, 2, 7);
  this.earth = new Planet(gl, this.shaderProgram, 2.0, "earth.png", 200, 15, 15, 24, 7);
  this.earthmoon = new Planet(gl, this.shaderProgram, 0.5, "moon.png", 100, 100, 2, 7, 80);
  this.mars = new Planet(gl, this.shaderProgram, 2.0, "mars.png", 210, 50, 20, 25, 7);
  this.jupiter = new Planet(gl, this.shaderProgram, 4.0, "jupiter.png", 500, 5, 30, 3, 7);
  this.jupiterEuropa = new Planet(gl, this.shaderProgram, 0.5, "", 100, 100, 2, 0, 10);
  this.jupiterIo = new Planet(gl, this.shaderProgram, 0.25, "", 100, 75, 2.5, 0, 40);
  this.jupiterGanymede = new Planet(gl, this.shaderProgram, 0.75, "", 100, 125, 3, 0, 90);
  this.saturn = new Planet(gl, this.shaderProgram, 4.0, "saturn.png", 110, 6, 40, 27, 7);
  this.uranus = new Planet(gl, this.shaderProgram, 3.0, "uranus.png", 250, 2, 50, 82, 7);
  this.neptune = new Planet(gl, this.shaderProgram, 3.0, "neptune.png", 260, 1, 60, 28, 7);
  this.ship = new Ship(gl, canvas, this.shaderProgram);
  

  this.mercuryR = new Ring(gl, this.shaderProgram, 5, 0.01, 7);
  this.venusR = new Ring(gl, this.shaderProgram, 10, 0.01, 7);
  this.earthR = new Ring(gl, this.shaderProgram, 15, 0.01, 7);
  this.marsR = new Ring(gl, this.shaderProgram, 20, 0.01, 7);
  this.jupiterR = new Ring(gl, this.shaderProgram, 30, 0.01, 7);
  this.saturnR = new Ring(gl, this.shaderProgram, 40, 0.01, 7);
  this.uranusR = new Ring(gl, this.shaderProgram, 50, 0.01, 7);
  this.neptuneR = new Ring(gl, this.shaderProgram, 60, 0.01, 7);
  
  this.saturnRing = new Ring(gl, this.shaderProgram, 5, 0.005, 0);
  
  
  //Show the first frame
  requestAnimationFrame(animate);
 

};

/**
 * Render - draw the scene on the canvas
 * 
 */
Solar.prototype.Render = function(flag, viewMat, viewSwitch, showOrbit) {
  var gl = this.gl;
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  
  gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  gl.clearColor(0.2, 0.2, 0.3, 1.0);
  if(viewSwitch) this.ship.Render(viewMat, this.projectionMat);
  else viewMat = getViewMat();
  
  //Planet Render takes: flag(for play/pause button), viewMat
  this.sun.Render(flag,viewMat, this.projectionMat, vec3(0,0,0), 1);
  this.mercury.Render(flag,viewMat, this.projectionMat, vec3(0,0,0), 1);
  this.venus.Render(flag, viewMat, this.projectionMat, vec3(0,0,0), 1);
  this.earth.Render(flag,viewMat, this.projectionMat, vec3(0,0,0), 1);
  this.earthmoon.Render(flag,viewMat, this.projectionMat, vec3(0,0,0), 1);
  this.mars.Render(flag,viewMat, this.projectionMat, vec3(0,0,0), 1);
  this.jupiter.Render(flag,viewMat, this.projectionMat, vec3(0,0,0), 1);
  this.jupiterEuropa.Render(flag,viewMat, this.projectionMat, vec3(0,0,0), 1);
  this.jupiterIo.Render(flag,viewMat, this.projectionMat, vec3(0,0,0), 1);
  this.jupiterGanymede.Render(flag,viewMat, this.projectionMat, vec3(0,0,0), 1);
  this.saturn.Render(flag,viewMat, this.projectionMat, vec3(0,0,0), 1);
  this.uranus.Render(flag,viewMat, this.projectionMat, vec3(0,0,0), 1);
  this.neptune.Render(flag,viewMat, this.projectionMat, vec3(0,0,0), 1);
  
 if(showOrbit){
  this.mercuryR.Render(viewMat, vec3(0.0, 1.0, 1.0), this.projectionMat, vec3(0,0,0), 1);
  this.venusR.Render(viewMat, vec3(0.0, 1.0, 1.0), this.projectionMat, vec3(0,0,0), 1);
  this.earthR.Render(viewMat, vec3(0.0, 1.0, 1.0), this.projectionMat, vec3(0,0,0), 1);
  this.marsR.Render(viewMat, vec3(0.0, 1.0, 1.0), this.projectionMat, vec3(0,0,0), 1);
  this.jupiterR.Render(viewMat, vec3(0.0, 1.0, 1.0), this.projectionMat, vec3(0,0,0), 1);
  this.saturnR.Render(viewMat, vec3(0.0, 1.0, 1.0), this.projectionMat, vec3(0,0,0), 1);
  this.uranusR.Render(viewMat, vec3(0.0, 1.0, 1.0), this.projectionMat, vec3(0,0,0), 1);
  this.neptuneR.Render(viewMat, vec3(0.0, 1.0, 1.0), this.projectionMat, vec3(0,0,0), 1);
  this.saturnRing.Render(viewMat, vec3(1.0, 1.0, 0), this.projectionMat, vec3(0,0,0), 1);
  
  //attach ring for saturn
  attachRing(this.saturn, this.saturnRing);
 }
  attachMoon(this.earth, this.earthmoon);
  attachMoon(this.jupiter, this.jupiterEuropa);
  attachMoon(this.jupiter, this.jupiterIo);
  attachMoon(this.jupiter, this.jupiterGanymede);
  

};
