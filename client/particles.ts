import * as Three from "three/three-core"
import { OrbitControls } from "three/three-orbitcontrols"
import { GPUComputationVariable, GPUComputationRenderer } from "./types/GPUComputationRenderer"

let WIDTH = 512;
let PARTICLES = WIDTH * WIDTH;

let radius = 300;
let height = 16;
let exponent = 0.4;

type Uniforms = { [uniform: string]: Three.IUniform };

export class Particles {
  camera: Three.PerspectiveCamera;
  controls: OrbitControls;
  scene: Three.Scene = new Three.Scene();
  renderer: Three.WebGLRenderer;

  particleColourTexture: Three.DataTexture;

  readonly gpuCompute: GPUComputationRenderer;
  positionVariable: GPUComputationVariable;
  velocityVariable: GPUComputationVariable;
  particleUniforms: Uniforms;
  positionUniforms: Uniforms;
  velocityUniforms: Uniforms;

  constructor(
      containerElement: HTMLElement,
      particleVertexShader: string,
      particleFragmentShader: string,
      positionComputeShader: string,
      velocityComputeShader: string) {

    this.camera = new Three.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 5, 15000);
    this.camera.position.y = 120;
    this.camera.position.z = 400;

    this.controls = new OrbitControls(this.camera);

    this.renderer = new Three.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    containerElement.appendChild(this.renderer.domElement);


    this.gpuCompute = new GPUComputationRenderer(WIDTH, WIDTH, this.renderer);

    this.initComputeRenderer(positionComputeShader, velocityComputeShader);
    this.initParticles(particleVertexShader, particleFragmentShader);

    window.addEventListener('resize', this.onWindowResize, false);
  }

  initComputeRenderer(positionComputeShader: string, velocityComputeShader: string): void {

    let dtVelocity = this.gpuCompute.createTexture();
    let dtPosition = this.gpuCompute.createTexture();

    this.particleColourTexture = this.gpuCompute.createTexture();

    let massData = new Uint8Array(WIDTH * WIDTH);
    let particleMassTexture = new Three.DataTexture(massData, WIDTH, WIDTH, Three.AlphaFormat, Three.UnsignedByteType);
    particleMassTexture.needsUpdate = true;

    this.initTextures(dtPosition, dtVelocity, particleMassTexture, this.particleColourTexture);

    this.velocityVariable = this.gpuCompute.addVariable("textureVelocity", velocityComputeShader, dtVelocity);
    this.positionVariable = this.gpuCompute.addVariable("texturePosition", positionComputeShader, dtPosition);

    this.gpuCompute.setVariableDependencies(this.velocityVariable, [this.positionVariable, this.velocityVariable]);
    this.gpuCompute.setVariableDependencies(this.positionVariable, [this.positionVariable, this.velocityVariable]);

    this.velocityUniforms = this.velocityVariable.material.uniforms;
    this.positionUniforms = this.positionVariable.material.uniforms;

    this.velocityUniforms.time = { value: 0.0 };
    this.velocityUniforms.textureMass = { value: particleMassTexture };

    var error = this.gpuCompute.init();

    if (error !== null) {
        console.error(error);
    }
  }

  initTextures(
    texturePosition: Three.DataTexture,
    textureVelocity: Three.DataTexture,
    particleMassTexture: Three.DataTexture,
    particleColourTexture: Three.DataTexture): void {

    var posArray = texturePosition.image.data;
    var velArray = textureVelocity.image.data;
    var massArray = particleMassTexture.image.data;
    var colourArray = particleColourTexture.image.data;

    var arrayLength = posArray.length;
    for (var k = 0; k < arrayLength; k += 4) {
        var x, y, z, rr;

        var r, d;
        r = Math.random() * 2 * Math.PI;
        d = Math.random() * (radius - 1.0) + 1.0;
        // do {
        //     x = Math.random() * 2 - 1;
        //     z = Math.random() * 2 - 1;
        //     rr = x * x + z * z;
        // } while (rr > 1);
        //
        // var r = Math.sqrt(rr);
        //
        // var rExp = radius * Math.pow(r, exponent);
        // x *= rExp;
        // z *= rExp;
        x = d * Math.cos(r);
        z = d * Math.sin(r);
        y = 0.0;//(Math.random() * 2 - 1) * height;

        var mass = 1.0;

        posArray[k] = x;
        posArray[k + 1] = y;
        posArray[k + 2] = z;
        posArray[k + 3] = 1;

        velArray[k] = (z / d) * 12;
        velArray[k + 1] = 0.0;
        velArray[k + 2] = -(x / d) * 12;
        velArray[k + 3] = mass;

        var massIndex = k/4;

        massArray[massIndex] = mass;

        var particleColour = new Three.Color();
        particleColour.setHSL(r / (Math.PI * 2), 0.5 + 0.5 * (d - 1.0) / (radius - 1.0), 0.5);
        colourArray[k] = particleColour.r;
        colourArray[k + 1] = particleColour.g;
        colourArray[k + 2] = particleColour.b;
        colourArray[k + 3] = 1.0;
    }
  }

  initParticles(particleVertexShader: string, particleFragmentShader: string): void {
      let geometry = new Three.BufferGeometry();

      var uvs = new Float32Array(PARTICLES * 2);
      for (var i = 0; i < WIDTH; ++i) {
          for (var j = 0; j < WIDTH; ++j) {
              uvs[(i * WIDTH) + j] = i / (WIDTH - 1);
              uvs[(i * WIDTH) + j + 1] = j / (WIDTH - 1);
          }
      }

      geometry.addAttribute('position', new Three.BufferAttribute(new Float32Array(PARTICLES * 3), 3));
      geometry.addAttribute('uv', new Three.BufferAttribute(uvs, 2));

      this.particleUniforms = {
          texturePosition: {value: null},
          textureVelocity: {value: null},
          textureColour: {value: this.particleColourTexture},
          cameraConstant: {value: this.getCameraConstant()}
      };

      var shaderMaterial = new Three.ShaderMaterial({
          uniforms: this.particleUniforms,
          vertexShader: particleVertexShader,
          fragmentShader: particleFragmentShader
      });

      shaderMaterial.extensions.drawBuffers = true;

      var particles = new Three.Points(geometry, shaderMaterial);
      particles.matrixAutoUpdate = false;
      particles.updateMatrix();

      this.scene.add(particles);
  }

  getCameraConstant(): number {
      return window.innerHeight / ( Math.tan(Three.Math.DEG2RAD * 0.5 * this.camera.fov) / this.camera.zoom );
  }

  onWindowResize(): void {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.particleUniforms.cameraConstant.value = this.getCameraConstant();
  }

  animate(): void {
    requestAnimationFrame(this.animate);
    this.render();
  }

  render(): void {
    for (var i = 0 ; i < 2; ++i) {

      this.gpuCompute.compute();

      this.particleUniforms.texturePosition.value = this.gpuCompute.getCurrentRenderTarget(this.positionVariable).texture;
      this.particleUniforms.textureVelocity.value = this.gpuCompute.getCurrentRenderTarget(this.velocityVariable).texture;

      this.velocityUniforms.time.value = this.velocityUniforms.time.value + (1.0/60.0);
    }

    this.renderer.render(this.scene, this.camera);
  }
}
