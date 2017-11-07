import positionComputeShader from "./shaders/positionComputeShader"
import velocityComputeShader from "./shaders/velocityComputeShader"
import particleVertexShader from "./shaders/particleVertexShader"
import particleFragmentShader from "./shaders/particleFragmentShader"
import {Particles} from "./particles"

console.log('This has run');

let container = document.getElementById('container');

if (container) {
  let particleSystem = new Particles(container, particleVertexShader, particleFragmentShader, positionComputeShader, velocityComputeShader);
  particleSystem.animate();
}
