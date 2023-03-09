import * as THREE from "three";
import Debug from "./helpers/Debug.js";
import Time from "./helpers/Time.js";
import Sizes from "./helpers/Sizes.js";
import Cameras from "./Cameras.js";
import Renderer from "./Renderer.js";
import World from "./World/World.js";
import Resources from "./helpers/Resources.js";
import Interface from "./Interface/Interface.js";
import Controls from "./Controls.js";
import * as sources from "./sources.js";

export default class Application {
  static instance;

  constructor(_options = {}) {

    if (Application.instance) {
      return Application.instance;
    }
    Application.instance = this;

    // Options
    this.$canvas = _options.$canvas;
    this.config = _options.config;

    // Set up
    this.sizes = new Sizes();
    this.time = new Time();
    this.debug = new Debug();
    this.scene = new THREE.Scene();
    this.cameras = new Cameras();
    this.renderer = new Renderer();
    this.resources = new Resources(sources);
    this.controls = new Controls();
    this.interface = new Interface();
    this.world = new World();

    this.sizes.on("resize", () => {
      this.resize();
    });

    this.time.on("tick", () => {
      if(!this.interface.isGameOnPause) this.update();
    });
  }
  resize() {
    this.cameras.resize();
    this.renderer.resize();
  }
  update() {
    this.cameras.orbitControlsUpdate();
    this.renderer.update();
    this.world.update()
  }
  destroy() {
    this.sizes.off('resize')
    this.time.off('tick')

    this.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()

        for (const key in child.material) {
          const value = child.material[key]

          if (value && typeof value.dispose === 'function') {
            value.dispose()
          }
        }
      }
    })

    this.cameras.pointControls .dispose();
    this.cameras.orbitControls.dispose();
    this.renderer.instance.dispose();
    this.world.destroy();

    if (this.debug.active) {
      this.debug.ui.destroy()
    }
  }
}
