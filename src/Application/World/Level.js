import * as THREE from "three";
import Application from "../Application.js";

export default class Level {
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
    this.level = this.resources.items.level.scene;
    this.level.position.y = 14;
    // this.floor.rotation.x = Math.PI * 0.5;
    // this.floor.position.set(-109.7, 14, 297.57);

    if (this.debug.active) {
      this.gridXZ = new THREE.GridHelper(this.sizes.worldWidth, this.sizes.worldHeight / 10);
      this.scene.add(this.gridXZ);
    }

    if (this.debug.active) {
      const levelDebug = this.debug.ui.addFolder("level");
      levelDebug.add(this.level.position, "x");
      levelDebug.add(this.level.position, "z");
      levelDebug.add(this.level.position, "y", -2, 20);
    }

    this.level.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        console.log(child);
        child.updateWorldMatrix();
        if(child.name !== "1A_woodplanks_0") {
            // this.collider.addMesh(child);

        }
      }
    });
    this.scene.add(this.level);
  }
}
