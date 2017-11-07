
let shader = `

  #define delta (1.0/60.0)
  #define gravity (146.0)

  uniform float time;
  uniform sampler2D textureMass;

  void main() {

      vec2 uv = gl_FragCoord.xy / resolution.xy;

      vec4 tmpPos = texture2D(texturePosition, uv);
      vec3 pos = tmpPos.xyz;

      vec4 tmpVel = texture2D(textureVelocity, uv);
      vec3 vel = tmpVel.xyz;

      vec4 tmpMass = texture2D(textureMass, uv);
      float mass = tmpMass.a;

      float distance = length(pos);
      float distSqr = max(distance * distance, 1.0);

      vec3 acceleration = -pos * (gravity / distSqr);

      vel += acceleration * delta;

      gl_FragColor = vec4(vel, mass);
  }`;

export default shader;
