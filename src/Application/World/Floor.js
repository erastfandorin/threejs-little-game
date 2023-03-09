import * as THREE from "three";
import Application from "../Application.js";

export default class Floor {
  constructor(collider) {
    this.collider = collider;
    this.application = new Application();
    this.scene = this.application.scene;
    this.sizes = this.application.sizes;
    this.debug = this.application.debug;
    this.resources = this.application.resources;

    this.setMesh();
  }

  setMesh() {
    // this.floor = this.resources.items.floor.scene;
    const geometry = new THREE.PlaneGeometry(this.sizes.worldWidth, this.sizes.worldHeight);
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide });
    this.floor = new THREE.Mesh(geometry, material);
    this.floor.rotation.x = Math.PI * 0.5;
    this.floor.position.set(-109.7, -0.18, 297.57);

    if (this.debug.active) {
      this.gridXZ = new THREE.GridHelper(this.sizes.worldWidth, this.sizes.worldHeight / 10);
      this.scene.add(this.gridXZ);
    }

    if (this.debug.active) {
      const floorDebug = this.debug.ui.addFolder("floor");
      floorDebug.add(this.floor.position, "x");
      floorDebug.add(this.floor.position, "z");
      floorDebug.add(this.floor.position, "y", -2, 2);
    }

    this.floor.updateWorldMatrix();
    this.collider.addMesh(this.floor);
    this.scene.add(this.floor);
  }
}
