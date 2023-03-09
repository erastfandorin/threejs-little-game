import * as THREE from "three";

import EventEmitter from "./helpers/EventEmitter";
import Application from "./Application.js";

export default class Controls extends EventEmitter {
  constructor() {
    super();
    this.application = new Application();
    this.sizes = this.application.sizes;
    this.cameras = this.application.cameras;


    this.setKeyboard();
    this.setMouse();
  }

  setKeyboard() {
    this.keyboard = {};
    this.keyboard.events = {};

    this.keyStates = [];

    this.keyboard.events.keyDown = e => {
      if (e.repeat) {
        return
      }
      this.keyStates[e.code] = true;
    };

    this.keyboard.events.keyUp = e => {
      if (e.repeat) {
        return
      }
      this.keyStates[e.code] = false;
    };

    document.addEventListener("keydown", this.keyboard.events.keyDown);
    document.addEventListener("keyup", this.keyboard.events.keyUp);
  }

  setMouse() {
    this.mouse = new THREE.Vector2();

    window.addEventListener("mousemove", e => {
      this.mouse.x = (e.clientX / this.sizes.viewport.width) * 2 - 1;
      this.mouse.y = -(e.clientY / this.sizes.viewport.height) * 2 + 1;

      if (document.pointerLockElement === document.body) {
        this.cameras.firstPersonViewCamera.rotation.y -= e.movementX / 500;
        this.cameras.firstPersonViewCamera.rotation.x -= e.movementY / 500;
      }
    });
  }
}
