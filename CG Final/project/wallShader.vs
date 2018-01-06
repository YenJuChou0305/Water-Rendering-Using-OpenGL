#version 330 core
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec2 aTexCoord;

out vec2 textureCoords;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;
uniform vec4 plane;

void main()
{
    vec4 worldPos = model * vec4(aPos, 1.0);
	gl_ClipDistance[0] = dot(worldPos, plane);
    gl_Position = projection * view * model * vec4(aPos, 1.0);
    textureCoords = aTexCoord;
}
