import * as THREE from "three";
import Collider from "./Collider.js";
import Application from "../Application.js";
import Environment from "./Environment.js";
import Player from "./Player.js";
import Floor from "./Floor.js";

export default class World {
  static instance;

  constructor() {
    if (World.instance) {
      return World.instance;
    }
    World.instance = this;

    this.application = new Application();
    this.config = this.application.config;
    this.time = this.application.time;
    this.scene = this.application.scene;
    this.cameras = this.application.cameras;
    this.debug = this.application.debug;
    this.resources = this.application.resources;
    this.interface = this.application.interface;

    this.collider = new Collider();

    this.resources.on("ready", () => {
      if (!this.floor) {
        this.floor = new Floor(this.collider);
        this.environment = new Environment();

        this.player = new Player();
      }
    });
  }

  destroyMesh(meshName) {
    this[meshName].traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();

        for (const key in child.material) {
          const value = child.material[key];

          if (value && typeof value.dispose === "function") {
            value.dispose();
          }
        }
      }
    });
    this.scene.remove(this[meshName]);
    this[meshName] = undefined;
  }

  update() {
    if (this.resources.filesLoaded === this.resources.filesToLoad) {
    }
  }

  destroy() {
    if (this.player) {
      this.player.destroy();
    }
  }
}
