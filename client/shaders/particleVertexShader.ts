
let shader = `

  // For PI declaration:
  #include <common>

  #define DENSITY 0.45

  uniform sampler2D texturePosition;
  uniform sampler2D textureVelocity;
  uniform sampler2D textureColour;

  uniform float cameraConstant;

  varying vec4 vColor;

  float radiusFromMass( float mass ) {
      // Calculate radius of a sphere from mass and density
      return pow( ( 3.0 / ( 4.0 * PI ) ) * mass / DENSITY, 1.0 / 3.0 );
  }


  void main() {


      vec4 posTemp = texture2D( texturePosition, uv );
      vec3 pos = posTemp.xyz;
      float mass = posTemp.w;

      vec4 velTemp = texture2D( textureVelocity, uv );
      vec3 vel = velTemp.xyz;

      float velLen = clamp(length(vel), 0.0, 250.0);

      vColor = texture2D( textureColour, uv );

      vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );

      float radius = radiusFromMass( mass );

      // Apparent size in pixels
      if ( mass == 0.0 ) {
          gl_PointSize = 0.0;
      }
      else {
          gl_PointSize = radius * cameraConstant / ( - mvPosition.z );
      }

      gl_Position = projectionMatrix * mvPosition;
  }`;

export default shader;
