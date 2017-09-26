function particles(containerElt, particleVertexShader, particleFragmentShader) {
    var camera, scene, renderer, geometry;
    var particleUniforms;

    var WIDTH = 64;
    var PARTICLES = WIDTH * WIDTH;

    var radius = 300;
    var height = 8;
    var exponent = 0.4;

    init();
    animate();

    function init() {
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 5, 15000);
        camera.position.y = 120;
        camera.position.z = 400;

        scene = new THREE.Scene();

        renderer = new THREE.WebGLRenderer();
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        containerElt.appendChild(renderer.domElement);

        initParticles();

        window.addEventListener('resize', onWindowResize, false);
    }

    function initParticles() {
        geometry = new THREE.BufferGeometry();

        var positions = new Float32Array(PARTICLES * 3);

        for (var particle = 0; particle < PARTICLES; ++particle) {
            for (var dimension = 0; dimension < 3; ++dimension) {
                positions[(particle * 3) + dimension] = (Math.random() * 2 - 1) * radius;
            }
        }

        var uvs = new Float32Array(PARTICLES * 2);
        for (var i = 0; i < WIDTH; ++i) {
            for (var j = 0; j < WIDTH; ++j) {
                uvs[(i * WIDTH) + j] = i / (WIDTH - 1);
                uvs[(i * WIDTH) + j + 1] = j / (WIDTH - 1);
            }
        }

        geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.addAttribute('uv', new THREE.BufferAttribute(uvs, 2));

        var particleArrayPosition = new Float32Array(WIDTH * WIDTH * 4);
        var particleTexturePosition = new THREE.DataTexture(particleArrayPosition, WIDTH, WIDTH, THREE.RGBAFormat, THREE.FloatType);
        particleTexturePosition.needsUpdate = true;
        initTextures(particleTexturePosition);

        particleUniforms = {
            texturePosition: {value: particleTexturePosition},
            cameraConstant: {value: getCameraConstant(camera)}
        };

        var shaderMaterial = new THREE.ShaderMaterial({
            uniforms: particleUniforms,
            vertexShader: particleVertexShader,
            fragmentShader: particleFragmentShader
        });

        shaderMaterial.extensions.drawBuffers = true;

        var particles = new THREE.Points(geometry, shaderMaterial);
        particles.matrixAutoUpdate = false;
        particles.updateMatrix();

        scene.add(particles);
    }

    function initTextures(texturePosition) {
        var posArray = texturePosition.image.data;

        var arrayLength = posArray.length;
        for (var k = 0; k < arrayLength; k += 4) {
            var x, y, z, rr;

            do {
                x = Math.random() * 2 - 1;
                z = Math.random() * 2 - 1;
                rr = x * x + z * z;
            } while (rr > 1);

            var r = Math.sqrt(rr);

            var rExp = radius * Math.pow(r, exponent);
            x *= rExp;
            z *= rExp;
            y = (Math.random() * 2 - 1) * height;

            posArray[k] = x;
            posArray[k + 1] = y;
            posArray[k + 2] = z;
            posArray[k + 3] = 1;
        }
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
        particleUniforms.cameraConstant.value = getCameraConstant(camera);
    }

    function getCameraConstant(camera) {
        return window.innerHeight / ( Math.tan(THREE.Math.DEG2RAD * 0.5 * camera.fov) / camera.zoom );
    }

    function animate() {
        requestAnimationFrame(animate);
        render();
    }

    function render() {
        renderer.render(scene, camera);
    }
}

