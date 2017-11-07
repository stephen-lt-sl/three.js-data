import {
    DataTexture,
    ShaderMaterial,
    WebGLRenderTarget,
    Wrapping,
    TextureFilter,
    WebGLRenderer,
    IUniform
} from "three/three-core";

export class GPUComputationVariable {

    name: string;
    initialValueTexture: DataTexture;
    material: ShaderMaterial;
    dependencies: GPUComputationVariable[];
    renderTargets: WebGLRenderTarget[];
    wrapS: Wrapping;
    wrapT: Wrapping;
    minFilter: TextureFilter;
    magFilter: TextureFilter;
}

export class GPUComputationRenderer {
    constructor(sizeX: number, sizeY: number, renderer: WebGLRenderer);

    variables: GPUComputationVariable[];
    currentTextureIndex: number;

    addVariable(variableName: string, computeFragmentShader: string, initialValueTexture: DataTexture): GPUComputationVariable;
    setVariableDependencies(variable: GPUComputationVariable, dependencies: GPUComputationVariable[]): void;
    init(): void;
    compute(): void;
    getCurrentRenderTarget(variable: GPUComputationVariable): WebGLRenderTarget;
    getAlternateRenderTarget(variable: GPUComputationVariable): WebGLRenderTarget;
    addResolutionDefine(materialShader: ShaderMaterial): void;
    createShaderMaterial(computeFragmentShader: string, uniforms?: { [uniform: string]: IUniform } ): ShaderMaterial;
    createRenderTarget(sizeXTexture?: number, sizeYTexture?: number, wrapS?: Wrapping, wrapT?: Wrapping, minFilter?: TextureFilter, magFilter?: TextureFilter): WebGLRenderTarget;
    createTexture(sizeXTexture?: number, sizeYTexture?: number): DataTexture;
    renderTexture(input: DataTexture, output: WebGLRenderTarget): void;
    doRenderTarget(material: ShaderMaterial, output: WebGLRenderTarget): void;
    getPassThroughVertexShader(): string;
    getPassThroughFragmentShader(): string;

}
