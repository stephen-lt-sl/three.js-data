function box(containerElt) {
	var camera, scene, renderer;
	var mesh, geometry;

	var boxGeometry = new THREE.BoxGeometry(200, 200, 200, 2, 2, 2);

	var material = new THREE.MeshBasicMaterial({ color: 0xfefefe, wireframe: true, opacity: 0.5 });

	init();
	animate();

	function addMesh() {
		if (mesh !== undefined) {
			scene.remove(mesh);
			geometry.dispose();
		}

		geometry = boxGeometry;

		geometry.computeBoundingSphere();

		var scaleFactor = 160 / geometry.boundingSphere.radius;
		geometry.scale(scaleFactor, scaleFactor, scaleFactor);

		mesh = new THREE.Mesh(geometry, material);
		scene.add(mesh);
	}

	function init() {
		camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
		camera.position.z = 500;

		scene = new THREE.Scene();

		addMesh();

		renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);
		containerElt.appendChild(renderer.domElement);

		window.addEventListener('resize', onWindowResize, false);
	}

	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize(window.innerWidth, window.innerHeight);
	}

	function animate() {
		requestAnimationFrame(animate);
		render();
	}

	function render() {
		renderer.render(scene, camera);
	}
}

