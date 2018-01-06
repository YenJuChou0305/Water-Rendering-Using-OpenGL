#version 330 core

in vec4 clipSpace;
in vec2 textureCoords;
in vec3 toCameraVector;
in vec3 fromLightVector;

out vec4 out_Color;

uniform sampler2D reflectionTexture;
uniform sampler2D refractionTexture;
uniform sampler2D dudvMap;
uniform sampler2D normalMap;
uniform vec3 lightColor;

uniform float moveFactor;

const float waveStrength = 0.009;
const float shine = 20;
const float reflectivity = 0.6;

void main(void) {
    
    vec2 ndc = (clipSpace.xy / clipSpace.w) / 2.0 + 0.5;
    vec2 reflectTexCoords = vec2(ndc.x, -ndc.y);
    vec2 refractTexCoords = vec2(ndc.x, ndc.y);
    
    vec2 distortedTexCoords = texture(dudvMap, vec2(textureCoords.x + moveFactor, textureCoords.y)).rg*0.1;
    distortedTexCoords = textureCoords + vec2(distortedTexCoords.x, distortedTexCoords.y+moveFactor);
    vec2 totalDistortion = (texture(dudvMap, distortedTexCoords).rg * 2.0 - 1.0) * waveStrength;
    
    reflectTexCoords += totalDistortion;
    reflectTexCoords.x = clamp(reflectTexCoords.x, 0.001, 0.999);
    reflectTexCoords.y = clamp(reflectTexCoords.y, -0.999, -0.001);
    
    refractTexCoords += totalDistortion;
    refractTexCoords = clamp(refractTexCoords, 0.001, 0.999);
    
    vec4 reflectColor = texture(reflectionTexture, reflectTexCoords);
    vec4 refractColor = texture(refractionTexture, refractTexCoords);
    
    vec3 viewVector = normalize(toCameraVector);
    float refractiveFactor = dot(viewVector, vec3(0, 1, 0));
    refractiveFactor = pow(refractiveFactor, 1);
    
    vec4 normalMapColor = texture(normalMap, distortedTexCoords);
    vec3 normal = vec3(normalMapColor.r * 2 - 1, normalMapColor.b, normalMapColor.g * 2 -1);
    normal = normalize(normal);
    
    vec3 reflectLight = reflect(normalize(fromLightVector), normal);
    float specular = max(dot(reflectLight, viewVector), 0);
    specular = pow(specular, shine);
    vec3 specularHighlight = lightColor * specular * reflectivity;
    
    out_Color = mix(reflectColor, refractColor, refractiveFactor);
	//out_Color = mix(reflectColor, refractColor, 0.5);
	//out_Color = mix(out_Color, vec4(0.0, 0.3, 0.5, 1.0), 0.2);
    out_Color = mix(out_Color, vec4(0.0, 0.3, 0.5, 1.0), 0.2) + vec4(specularHighlight, 0);
	
}
