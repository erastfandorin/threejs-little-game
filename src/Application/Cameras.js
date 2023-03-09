import * as THREE from "three";
import Application from './Application.js'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";

export default class Cameras {
  constructor() {
    this.application = new Application()
    this.sizes = this.application.sizes;
    this.debug = this.application.debug;
    this.scene = this.application.scene;
    this.canvas = this.application.$canvas;

    this.setCameras();
    this.setCamerasControls();

    if (this.debug.active) {
      this.setCameraHelper();
    }
  }

  setCameras() {
    this.firstPersonViewCamera = new THREE.PerspectiveCamera(60, this.sizes.width / this.sizes.height, 0.1, 240);
    this.firstPersonViewCamera.position.set(0, 1.37, 0);
    this.firstPersonViewCamera.rotation.order = "YXZ";

    this.threePersonViewCamera = new THREE.PerspectiveCamera(60, this.sizes.width / this.sizes.height, 0.1, 1000);
    this.threePersonViewCamera.position.set(15, 15, 18);

    this.activeCamera = this.firstPersonViewCamera;
  }

  setCamerasControls() {
    this.orbitControls = new OrbitControls(this.threePersonViewCamera, this.canvas);
    this.orbitControls.screenSpacePanning = false;

    if (!this.debug.active) {
      this.orbitControls.enableDamping = true;
      this.orbitControls.dampingFactor = 0.05;
      this.orbitControls.maxDistance = 60;
      this.orbitControls.minDistance = 10;
      this.orbitControls.maxPolarAngle = Math.PI / 2.25;
    }

    this.pointControls = new PointerLockControls(this.firstPersonViewCamera, document.body);
    this.pointControls.maxPolarAngle = 2.25;
    this.pointControls.minPolarAngle = 0.5;
  }

  setCameraHelper() {
    const material = new THREE.LineBasicMaterial({ color: 0xAAFFAA });
    const geometry = new THREE.BufferGeometry();
    const x = 0.01;
    const y = 0.01;

    const vertices = new Float32Array([
      0, y, 0,
      0, -y, 0,
      0, 0, 0,

      0, 0, 0,
      x, 0, 0,
      -x, 0, 0
    ]);

    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

    const crosshair = new THREE.Line(geometry, material);
    // place it in the center
    const crosshairPercentX = 50;
    const crosshairPercentY = 50;
    const crosshairPositionX = (crosshairPercentX / 100) * 2 - 1;
    const crosshairPositionY = (crosshairPercentY / 100) * 2 - 1;

    crosshair.position.x = crosshairPositionX * this.firstPersonViewCamera.aspect;
    crosshair.position.y = crosshairPositionY;
    crosshair.position.z = -0.3;

    this.firstPersonViewCamera.add(crosshair);
  }

  resize() {
    this.firstPersonViewCamera.aspect = this.sizes.width / this.sizes.height;
    this.firstPersonViewCamera.updateProjectionMatrix();

    this.threePersonViewCamera.aspect = this.sizes.width / this.sizes.height;
    this.threePersonViewCamera.updateProjectionMatrix();
  }

  orbitControlsUpdate() {
    this.orbitControls.update();
  }
}
