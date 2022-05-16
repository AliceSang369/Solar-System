"use strict";
/* COMP 3801 - Assignment 2 Sphere Solar System
 * Yuwen Sang
 */
//The class that handles the rendering of a single planet
function Planet(gl, shaderProgram, scale, imageName, dayPeriod, yearPeriod, orbitDist, axisTilt, orbitTilt){ 
    var t = this;
    this.gl = gl;
    this.shaderProgram = shaderProgram;
    this.scale = scale/40;
    this.imageName = imageName;
    this.orbitDist = orbitDist/20;
    this.axisTilt = axisTilt;
    this.orbitTilt = orbitTilt;
    this.fixedDayPeriod = dayPeriod/180; //180
    this.rotation = 0;
    this.fixedYearPeriod = yearPeriod/50; //50
    this.revolution = 0;
    this.modelMat = mat4();
    this.attachMat =[vec4(0,0,0,0),
                    vec4(0,0,0,0), 
                    vec4(0,0,0,0),
                    vec4(0,0,0,0)];
    this.attachMat.matrix = true;
    // Create a Vertex Array Object.  This remembers the buffer bindings and
    // vertexAttribPointer settings so that we can reinstate them all just using
    // bindVertexArray.
    this.vetxArr = gl.createVertexArray();
    gl.bindVertexArray(this.vetxArr);
    
    this.verticies = [];
    this.normals = [];
    this.texCoords = [];
    
    //You can change the number of horizontalSec & verticalSec to get better sphere
    this.latitudeSec = 100; //each latitude divided into how many points
    this.longitudeSec = 100; //how many layer of latitude in other words
    
    var latitudeTexSpace = 1.0/this.latitudeSec;
    var longitudeTexSpace = 1.0/(this.longitudeSec+1);
    
    var latAng = 0, latDiff = (2 * Math.PI)/this.latitudeSec;
    var loDiff = Math.PI/this.longitudeSec, loAng = Math.PI/2-loDiff;
    
    //North Pole
    var northPole = vec3(0, this.scale, 0), northPoleN = normalize(vec3(0, 0, 0));
    this.verticies.push(northPole);
    this.texCoords.push(vec2(0, 1));
    this.normals.push(northPoleN);
    //verticies of the sphere
    var currentLatVerts = [];
    var lastLatVerts = [];
    var currentTC = [];
    var lastTC = [];
    for(var lo = 0; lo < this.longitudeSec-1; lo++){
        var sinLo = Math.sin(loAng);
        var cosLo = Math.cos(loAng);
        var pointCount = 1;
        for(var lat = 0; lat < this.latitudeSec; lat++){
            var sinLat = Math.sin(latAng);
            var cosLat = Math.cos(latAng);
            
            var texX = lat*latitudeTexSpace;
            var texY = 1.0-(lo+1)*longitudeTexSpace;
            //this.texCoords.push(vec2(texX, texY));
            
            var x = sinLat * cosLo * this.scale;
            var y = sinLo*this.scale;
            var z = cosLat * cosLo * this.scale;
            
            var vt = vec3(x,y,z), vtN = normalize(vec3(x, 0, z));
            var tc = vec2(texX, texY);
            if((lat == 0 || lat == 1)&&lo == 0){
                this.verticies.push(vt);
                this.texCoords.push(tc);
                this.normals.push(vtN);
            }else if (lo == 0){
                this.verticies.push(northPole);
                this.texCoords.push(vec2(0, 1));
                this.verticies.push(vt);
                this.texCoords.push(tc);
                this.normals.push(northPoleN);
                this.normals.push(vtN);
            }else if(lat == 0){
                var lastvt = lastLatVerts[pointCount], lastvtN = normalize(vec3(lastvt[0], 0, lastvt[2]));
                var lasttc = lastTC[pointCount];
                pointCount++;
                this.verticies.push(lastvt);
                this.texCoords.push(lasttc);
                this.verticies.push(vt);
                this.texCoords.push(tc);
                this.normals.push(lastvtN);
                this.normals.push(vtN);
            }else if (lat == 1){
                this.verticies.push(vt);
                this.texCoords.push(tc);
            }else if(lat != this.latitudeSec-1){
                var lastvt = lastLatVerts[pointCount], lastvtN = normalize(vec3(lastvt[0], 0, lastvt[2]));
                var lasttc = lastTC[pointCount];
                pointCount++;
                this.verticies.push(lastvt);
                this.texCoords.push(lasttc);
                this.verticies.push(vt);
                this.texCoords.push(tc);
                this.normals.push(lastvtN);
                this.normals.push(vtN);
            }else{
                var lastvt = lastLatVerts[0], lastvtN = normalize(vec3(lastvt[0], 0, lastvt[2]));
                var lasttc = lastTC[0];
                this.verticies.push(lastvt);
                this.texCoords.push(lasttc);
                this.verticies.push(vt);
                this.texCoords.push(tc);
                this.normals.push(lastvtN);
                this.normals.push(vtN);
            }
            currentLatVerts.push(vt);
            currentTC.push(tc);
            latAng += latDiff;
        }
        loAng -= loDiff;
        lastLatVerts = currentLatVerts;
        lastTC = currentTC;
        currentTC = [];
        currentLatVerts = [];
    }
    
    //Sourth Pole
    var sourthPole = vec3(0, -this.scale, 0),sourthPoleN = normalize(vec3(0, 0, 0));
    for(var a = 0; a < lastLatVerts.length; a++){
        var lastv = lastLatVerts[a], lastvN = normalize(vec3(lastv[0], 0, lastv[2]));
        var lasttc = lastTC[a];
        this.verticies.push(lastv);
        this.texCoords.push(lasttc);
        this.verticies.push(sourthPole);
        this.texCoords.push(vec2(0, 0));
        this.normals.push(lastvN);
        this.normals.push(sourthPoleN);
    }
    
    
  var floatBytes = 4;  // number of bytes in a float value
  // Load vertex coordinates and colors into WebGL buffer
  this.sphereBuffer = gl.createBuffer();  // get unique buffer ID number
  gl.bindBuffer(gl.ARRAY_BUFFER, this.sphereBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(this.verticies), gl.STATIC_DRAW );
  this.vPosition = gl.getAttribLocation(this.shaderProgram, "vPosition");
  gl.vertexAttribPointer(this.vPosition, 3, gl.FLOAT, false, 3 * floatBytes, 0);
  gl.enableVertexAttribArray(this.vPosition);

  this.sphereNormal = gl.createBuffer();  // get unique buffer ID number
    gl.bindBuffer(gl.ARRAY_BUFFER, this.sphereNormal );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(this.normals), gl.STATIC_DRAW );
    this.vNormal = gl.getAttribLocation(shaderProgram, "vNormal");
    gl.vertexAttribPointer(this.vNormal, 3, gl.FLOAT, false, 3 * floatBytes, 0);
    gl.enableVertexAttribArray(this.vNormal);

  
  
  // Get uniform variable location for transform matrix
  this.mm = gl.getUniformLocation(this.shaderProgram, "modelMat");
  this.vm = gl.getUniformLocation(this.shaderProgram, "viewMat");
  this.pm = gl.getUniformLocation(this.shaderProgram, "projectionMat");
  
  // Get uniform variable locations for light info
  // At the moment, we only send one color and use it for ambient, diffuse and specular
  this.lightPosition = gl.getUniformLocation(shaderProgram, "lightPosition");
  this.ambientFactor = gl.getUniformLocation(shaderProgram, "ambientFactor");
  this.vColor = gl.getUniformLocation(shaderProgram, "vColor");
  
    
  //Texture
  this.planetTexture = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.planetTexture);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(this.texCoords), gl.STATIC_DRAW);
  this.vTexCoord = gl.getAttribLocation(shaderProgram, "vTexCoord");
  gl.vertexAttribPointer(this.vTexCoord, 2, gl.FLOAT, false, 2 * floatBytes, 0);
  gl.enableVertexAttribArray(this.vTexCoord);
  this.fTexSampler = gl.getUniformLocation(shaderProgram, "fTexSampler");
  this.InitTexture(this.imageName);
  gl.bindVertexArray(null);  // un-bind our vertexArr
};


Planet.prototype.Render = function(flag,viewMat, projectionMat, lightPosition, ambientFactor){
    var gl = this.gl;
    gl.bindVertexArray(this.vetxArr);
    var modelMat = mat4();
    if(flag){
        this.rotation += this.fixedDayPeriod;
        this.revolution += this.fixedYearPeriod;
    }
    modelMat.matrix = true;
    //Set rotation first
    var rotate1 = rotateY(this.rotation);
    var rotate2 = rotateZ(-this.axisTilt);
    modelMat = mult(rotate1, modelMat);
    modelMat = mult(rotate2, modelMat);
    
    //Then set the transformation & revolution
    modelMat = [vec4(modelMat[0][0], modelMat[0][1], modelMat[0][2], modelMat[0][3]+this.orbitDist), 
        vec4(modelMat[1]), 
        vec4(modelMat[2]), 
        vec4(modelMat[3])];
    modelMat.matrix = true;
    var revolute1 = rotateY(this.revolution);
    var revolute2 = rotateZ(this.orbitTilt);
    modelMat = mult(revolute1, modelMat);
    modelMat = mult(revolute2, modelMat);
    
    modelMat = add(this.attachMat,modelMat);//if no attachment, attchMat is a zero matrix
    
    //distortion correction
    //this.modelMat = mult(viewMat, this.modelMat);
    
    // Set transformation matrices for shader
    gl.uniformMatrix4fv(this.mm, false, flatten(modelMat));
    gl.uniformMatrix4fv(this.vm, false, flatten(viewMat));
    gl.uniformMatrix4fv(this.pm, false, flatten(projectionMat));
    gl.uniform3fv(this.lightPosition, flatten(lightPosition));
    gl.uniform1f(this.ambientFactor, ambientFactor);
    gl.uniform3fv(this.vColor, flatten(vec3(1,1,1)));
    //gl.Materialfv(gl.front, gl.emission, flatten(vec4(1,1,1,1)));
    // Set up texture
    if(this.textureLoaded){
        //alert("textureLoaded");
        gl.activeTexture(gl.TEXTURE0);  // which of the multiple texture units to use
        gl.uniform1i(this.fTexSampler, 0); // The texture unit to use
        gl.bindTexture(gl.TEXTURE_2D, this.texture);  // The image
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    }
    
    //gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.horizontalSec*(this.verticalSec-1)+2);
//    gl.drawArrays(gl.LINE_STRIP, 0, this.latitudeSec*this.longitudeSec*2+4);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.latitudeSec*this.longitudeSec*2+4);
    gl.bindVertexArray(null);  // un-bind our verterxArr
};

Planet.prototype.InitTexture = function (textureURL) {
    var gl = this.gl;
    
    // First make a white texture for when we don't want to have a texture
    //   This prevents shader warnings even if we don't sample from it
    this.whiteTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.whiteTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0,
                  gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));

    var texture = this.texture = gl.createTexture();
    var textureImage = new Image();
    var t = this;
    t.textureLoaded = false;
    textureImage.onload = function () {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImage);
        //alert("loaded");
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      
        gl.generateMipmap(gl.TEXTURE_2D);  // incase we need min mipmap
        t.textureLoaded = true;
    }
    // Set up function to run asynchronously after texture image loads

    textureImage.src = textureURL;  // start load of texture image
    
};

function attachMoon(centerPlanet, cp){ //cp = currentPlanet
    cp.attachMat = [vec4(0,0,0,centerPlanet.orbitDist),
                    vec4(0,0,0,0), 
                    vec4(0,0,0,0),
                    vec4(0,0,0,0)];
    cp.attachMat.matrix = true;
    var revolute1 = rotateY(centerPlanet.revolution);
    var revolute2 = rotateZ(centerPlanet.orbitTilt);
    cp.attachMat = mult(revolute1, cp.attachMat);
    cp.attachMat = mult(revolute2, cp.attachMat);

}

function attachRing(centerPlanet, ring){
    ring.attachMat = [vec4(0,0,0,centerPlanet.orbitDist),
                    vec4(0,0,0,0), 
                    vec4(0,0,0,0),
                    vec4(0,0,0,0)];
    ring.attachMat.matrix = true;
    var revolute1 = rotateY(centerPlanet.revolution);
    var revolute2 = rotateZ(centerPlanet.orbitTilt);
    ring.attachMat = mult(revolute1, ring.attachMat);
    ring.attachMat = mult(revolute2, ring.attachMat);
}
