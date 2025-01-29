import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';



// Extending the Arrow Class to make vector 3 helper
class Cylinder extends THREE.Mesh {
	constructor() {
		super();
		this.geometry = new THREE.CylinderGeometry();
		this.material = new THREE.MeshBasicMaterial({ color: 'blue' });
		this.cylinderSize = 0;
		this.cylinderActive = false;
	}

	onResize(width, height, aspect) {
		this.cylinderSize = width / 5; // 1/5 of the full width
		this.scale.setScalar(this.cylinderSize * (this.cylinderActive ? 1.5 : 1));
	}

	render() {
	}

	onPointerOver(e) {
		this.color.set('hotpink');
		this.color.convertSRGBToLinear();
	}

	onPointerOut(e) {
		this.color.set('orange');
		this.color.convertSRGBToLinear();
	}

	onClick(e) {
		this.arrowActive = !this.arrowActive;
		this.color = 'red';
		console.log("arrow clicked")
	}

}






class Cube extends THREE.Mesh {
	constructor() {
		super();
		this.geometry = new THREE.BoxGeometry();
		this.material = new THREE.MeshBasicMaterial({ color: 'orange' });
		this.cubeSize = 0;
		this.cubeActive = false;


		const origin = this.position;

		const length = 10;

		this.Zarrow = new THREE.ArrowHelper(new THREE.Vector3(0,0,1), origin, length, 0x00ff00);
		this.Zarrow.name = "Z_arrow";

		this.Xarrow = new THREE.ArrowHelper(new THREE.Vector3(1,0,0), origin, length, 0x0000ff);
		this.Xarrow.name = "X_arrow";

		this.Yarrow = new THREE.ArrowHelper(new THREE.Vector3(0,1,0), origin, length, 0xff0000);
		this.Yarrow.name = "Y_arrow";
	}

	render() {
	}

	onResize(width, height, aspect) {
		this.cubeSize = width / 5; // 1/5 of the full width
		this.scale.setScalar(this.cubeSize * (this.cubeActive ? 1.5 : 1));
	}

	onPointerOver(e) {
		this.material.color.set('hotpink');
		this.material.color.convertSRGBToLinear();
	}

	onPointerOut(e) {
		this.material.color.set('orange');
		this.material.color.convertSRGBToLinear();
	}

	onClick(e) {
		if (scene.getObjectByName("Z_arrow")){
			scene.remove(this.Zarrow);
			scene.remove(this.Yarrow);
			scene.remove(this.Xarrow);
		}
		else {
			scene.add(this.Zarrow);
			scene.add(this.Yarrow);
			scene.add(this.Xarrow);
		}

		this.cubeActive = !this.cubeActive;
		console.log("cube clicked")

	}

	onArrowDrag(e) {
		if (e.object === this.arrow) {
			console.log("Arrow is being dragged");
		}
	}

}

// state
let width = 0
let height = 0
let intersects = []
let hovered = {}

// setup
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(10, 10, 10)
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
renderer.setPixelRatio(Math.min(Math.max(1, window.devicePixelRatio), 2))
document.getElementById('root').appendChild(renderer.domElement)
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()


// controls
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true


// view
const cube1 = new Cube()
cube1.position.set(0, 5, 0)
scene.add(cube1)



const axesHelper = new THREE.AxesHelper(5);
axesHelper.position.set(5,5,5)
scene.add(axesHelper);


//Log all objects that arent cubes
scene.traverse((obj) => {
	if (!(obj instanceof Cube)) {
		console.log(obj.type, obj.position, obj.origin, obj.length)
	}
});

const plane = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshStandardMaterial({ color: 'lightblue' }))
plane.position.set(0, 0, 0)
plane.rotation.x = -Math.PI / 2
scene.add(plane)


const ambientLight = new THREE.AmbientLight()
const pointLight = new THREE.PointLight()
pointLight.position.set(10, 10, 10)
scene.add(ambientLight)
scene.add(pointLight)

// responsive
function resize() {
	width = window.innerWidth
	height = window.innerHeight
	camera.aspect = width / height
	const target = new THREE.Vector3(0, 0, 0)
	const distance = camera.position.distanceTo(target)
	const fov = (camera.fov * Math.PI) / 180
	const viewportHeight = 2 * Math.tan(fov / 2) * distance
	const viewportWidth = viewportHeight * (width / height)
	camera.updateProjectionMatrix()
	renderer.setSize(width, height)
	scene.traverse((obj) => {
		if (obj.onResize) obj.onResize(viewportWidth, viewportHeight, camera.aspect)
	})
}

window.addEventListener('resize', resize)
resize()

// events
window.addEventListener('pointermove', (e) => {
	mouse.set((e.clientX / width) * 2 - 1, -(e.clientY / height) * 2 + 1)
	raycaster.setFromCamera(mouse, camera)
	intersects = raycaster.intersectObjects(scene.children, true)

	// If a previously hovered item is not among the hits we must call onPointerOut
	Object.keys(hovered).forEach((key) => {
		const hit = intersects.find((hit) => hit.object.uuid === key)
		if (hit === undefined) {
			const hoveredItem = hovered[key]
			if (hoveredItem.object.onPointerOver) hoveredItem.object.onPointerOut(hoveredItem)
			delete hovered[key]
		}
	})

	intersects.forEach((hit) => {
		// If a hit has not been flagged as hovered we must call onPointerOver
		if (!hovered[hit.object.uuid]) {
			hovered[hit.object.uuid] = hit
			if (hit.object.onPointerOver) hit.object.onPointerOver(hit)
		}
		// Call onPointerMove
		if (hit.object.onPointerMove) hit.object.onPointerMove(hit)
	})
})

window.addEventListener('click', (e) => {
	intersects.forEach((hit) => {
		// Call onClick
		if (hit.object.onClick) hit.object.onClick(hit)
	})
})

let isDragging = false;

window.addEventListener('pointerdown', (e) => {
    intersects.forEach((hit) => {
        if (hit.object.onArrowDrag) {
            isDragging = true;
            hit.object.onArrowDrag(hit);
        }
    });
});


window.addEventListener('pointerup', () => {
    isDragging = false;
});

// render-loop, called 60-times/second
function animate(t) {
	requestAnimationFrame(animate)
	scene.traverse((obj) => {
		if (obj.render) obj.render(t)
	})
	renderer.render(scene, camera)
}

animate()