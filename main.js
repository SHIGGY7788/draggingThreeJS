import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';


let camera, scene, renderer, stats;
let controls, gui;
let raycaster;
let intersection = null;

let pointer = new THREE.Vector2();

const threshold = 0.1;
const pointSize = 0.05;

let planeGeometry, planeMaterial;

init();
animate();
setupInitObjects();



class Cube extends THREE.Mesh {
	constructor() {
		super()
		this.geometry = new THREE.BoxGeometry();
		this.material = new THREE.MeshStandardMaterial();
		this.cubeSize = 0;
		this.cubeActive = false;
	}

	onPointerOver(e) {
		this.material.color.set('orange');
		this.material.color.convertSRGBToLinear();
	}

	onPointerOut(e) {
		this.material.color.set('white');
		this.material.color.convertSRGBToLinear();
	}

	onClick(e) {
		this.cubeActive = !this.cubeActive;
		
	}
}




function init() {
	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
	camera.position.set( 10, 10, 10);
	camera.lookAt(0, 0, 0);
	camera.updateMatrix();

	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	controls = new OrbitControls(camera, renderer.domElement);
	controls.enableDamping = true;

	raycaster = new THREE.Raycaster();
	raycaster.params.Points.threshold = threshold;

	stats = new Stats();
	document.body.appendChild(stats.dom);

	document.addEventListener('pointermove', onPointerMove);
}



function animate() {
	requestAnimationFrame( animate );
	render();
	stats.update();
}

function render() {
	raycaster.setFromCamera(pointer, camera);
	const intersections = raycaster.intersectObjects(scene.children, false);
	intersection = (intersections.length) > 0 ? intersections[0] : null;



	renderer.render(scene, camera);
	stats.update();
}

