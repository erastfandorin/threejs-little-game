import * as THREE from "three";
import Application from "./Application.js";

export default class Renderer {
  constructor() {
    this.application = new Application();
    this.$canvas = this.application.$canvas;
    this.sizes = this.application.sizes;
    this.scene = this.application.scene;
    this.cameras = this.application.cameras;
    this.config = this.application.config;

    this.setInstance();
  }

  setInstance() {
    this.instance = new THREE.WebGLRenderer({
      canvas: this.$canvas,
      powerPreference: 'high-performance',
      antialias: (this.config.graphicIsHeight) ? true : false,
    });
    this.instance.physicallyCorrectLights = true;
    this.instance.outputEncoding = THREE.sRGBEncoding;
    this.instance.toneMapping = THREE.ACESFilmicToneMapping;
    this.instance.toneMappingExposure = 1.75;
    this.instance.shadowMap.enabled = true;
    this.instance.shadowMap.type = THREE.VSMShadowMap; //  THREE.PCFSoftShadowMap
    this.instance.setSize(this.sizes.viewport.width, this.sizes.viewport.height);
    this.instance.setPixelRatio(this.sizes.pixelRatio);
    // this.instance.gammaFactor = 2.2;
    // this.instance.logarithmicDepthBuffer = true;
    // this.instance.setClearColor("#211d20");
  }

  resize() {
    this.instance.setSize(this.sizes.viewport.width, this.sizes.viewport.height);
    this.instance.setPixelRatio(this.sizes.pixelRatio);
  }

  update() {
    this.instance.render(this.scene, this.cameras.activeCamera);
  }
}
