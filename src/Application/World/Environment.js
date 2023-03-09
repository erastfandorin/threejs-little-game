import * as THREE from "three";
import Application from "../Application.js";

export default class Environment {
  constructor() {
    this.application = new Application();
    this.scene = this.application.scene;
    this.resources = this.application.resources;
    this.cameras = this.application.cameras;
    this.interface = this.application.interface;
    this.debug = this.application.debug;
    this.time = this.application.time;

    this.setBackground();
    this.setSunLight();
  }

  setBackground() {
    // const endWorldTexture = this.resources.items.environmentMapTexture;
    // this.scene.background = endWorldTexture;
    this.scene.background = new THREE.Color(0xffffff);

    if (!this.debug.active) {
      this.scene.fog = new THREE.FogExp2(0xffffff, 0.0095);
    }
  }

  setSunLight() {
    this.sunLight = new THREE.DirectionalLight("#ffffff", 1.5);
    this.sunLight.position.set(0, 800, 0);
    // this.sunLight.castShadow = true;
    // this.sunLight.shadow.camera.far = 15;
    // this.sunLight.shadow.mapSize.set(1024, 1024);
    // this.sunLight.shadow.normalBias = 0.05;
    // this.sunLight.rotation.set(-15, 0, -15);

    this.scene.add(this.sunLight);

    const fillLight = new THREE.HemisphereLight(0x7d7c8e, 0x7d7c8e, 1);
    fillLight.position.set(2, 30, 1);
    this.scene.add(fillLight);

    if (this.debug.active) {
      this.sunLightHelper = new THREE.DirectionalLightHelper(this.sunLight, 5);
      this.scene.add(this.sunLightHelper);

      const fillLightHelper = new THREE.HemisphereLightHelper(fillLight, 5);
      this.scene.add(fillLightHelper);
    }
  }
}
