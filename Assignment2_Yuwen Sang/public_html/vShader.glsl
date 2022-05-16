#version 300 es
// Vertex shader for Assignment 1 - COMP3801 Spring 2021

in vec3 vPosition;           // position of vertex (x, y, z)
in vec3 vNormal;
in vec2 vTexCoord;
uniform vec3 vColor;    
// We need to separate projection and and location so we can put points into view/camera
//   coordinates to do lighting calculations
uniform mat4 projectionMat;   // projection matrix
uniform mat4 viewMat;         // the view/camera location matrix
uniform mat4 modelMat;        // model matrix

// Light info
uniform vec3 lightPosition; // light position in world coords
uniform float ambientFactor;


out vec3 fColor;             // output color to send to fragment shader
out vec2 fTexCoord;

void main() {
    vec4 posVC4 = viewMat * modelMat * vec4(vPosition.xyz, 1.0); 
    vec4 normVC4 = viewMat * modelMat * vec4(vNormal.xyz, 0.0);
    vec4 lightVC4 = viewMat * vec4(lightPosition.xyz, 1.0);
    
    vec3 normVC3 = normalize(normVC4.xyz); 
    vec3 posVC3 = posVC4.xyz;
    vec3 lightVC3 = lightVC4.xyz;
    
    vec3 ambientComponent = ambientFactor * vColor;
    vec3 L = normalize(lightVC3-posVC3); //point light
    vec3 diffuseComponent = vColor * dot(L, normVC3);
    vec3 phong = ambientComponent + diffuseComponent;
    
    gl_Position = projectionMat * posVC4; //viewMat * modelMat* vec4(vPosition, 1.0); // set vertex position
    fColor = phong;           // output color to fragment shader
    fTexCoord = vTexCoord;
}
