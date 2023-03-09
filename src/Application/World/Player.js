import * as THREE from "three";

import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import Application from "../Application";
import World from "./World.js";
import { debounce } from "../helpers/utilFunctions.js";

export default class Player {
  constructor() {
    this.world = new World();
    this.collider = this.world.collider;
    this.changeActiveArticle = this.world.changeActiveArticle;
    this.changeActiveTeleportPoint = this.world.changeActiveTeleportPoint;
    this.activeTeleport = this.world.activeTeleport;
    this.eventsAreas = this.world.eventsAreas;

    this.application = new Application();
    this.config = this.application.config;
    this.time = this.application.time;
    this.debug = this.application.debug;
    this.resources = this.application.resources;
    this.controls = this.application.controls;
    this.cameras = this.application.cameras;
    this.scene = this.application.scene;
    this.interface = this.application.interface;

    this.playerHeight = 3.0;
    this.playerStartPosition = { x: 0, y: 0, z: 0 };

    this.setCapsule();
    this.addDelayForKeyMethods();

    this.move();
  }

  setCapsule() {
    this.playerCapsule = new THREE.Mesh(new RoundedBoxGeometry(1.0, this.playerHeight, 1.0, 10, 0.5), new THREE.MeshStandardMaterial());
    this.playerCapsule.capsuleInfo = {
      radius: 0.5,
      segment: new THREE.Line3(new THREE.Vector3(), new THREE.Vector3(0, -1.0, 0.0)),
    };
    this.scene.add(this.playerCapsule);

    const { x, y, z } = this.playerStartPosition;
    this.playerCapsule.position.set(x, y, z);

    if (this.debug.active) {
      const box = new THREE.Box3();
      box.setFromObject(this.playerCapsule);
      this.arrowHelper = new THREE.ArrowHelper(new THREE.Vector3(1, 2, 0), new THREE.Vector3(0, 0, 0), 100, 0x7cfc00);
      this.scene.add(this.arrowHelper);

      const axesHelper = new THREE.AxesHelper(1);
      this.scene.add(axesHelper);
    }
  }

  addDelayForKeyMethods() {
    this.toggleView = debounce(this.toggleView, 300);
    this.showLocationInfo = debounce(this.showLocationInfo, 300);
    this.togglePosition = debounce(this.togglePosition, 300);
  }

  move() {
    const STEPS_PER_FRAME = 5;
    this.time.on("tick", () => {
      if (!this.interface.isGameOnPause) {
        const deltaTime = Math.min(0.05, this.time.delta * 0.001) / STEPS_PER_FRAME;

        for (let i = 0; i < STEPS_PER_FRAME; i++) {
          this._checkActionKeys();

          if (this.cameras.activeCamera === this.cameras.firstPersonViewCamera) {
            this.collider.updatePlayer(this.playerCapsule, deltaTime, this.playerStartPosition);

            if (this.debug.active) {
              this.arrowHelper.position.copy(this.playerCapsule.position);
            }
          }
        }
      }
    });
  }

  _checkActionKeys() {
    this.keyStates = this.controls.keyStates;

    if (this.keyStates["KeyV"]) {
      this.toggleView();
    }

    if (this.cameras.pointControls.isLocked) {

      if (this.keyStates["KeyI"]) {
        this.showLocationInfo();
      }
      if (this.keyStates["KeyC"]) {
        this.togglePosition();
      }
    }
  }

  toggleView() {
    if (this.cameras.pointControls.isLocked) {
      this.cameras.orbitControls.enabled = true;
      this.cameras.activeCamera = this.cameras.threePersonViewCamera;
      this.cameras.pointControls.unlock();

      window.setTimeout(this.hideFirstPersonViewTexts, 0);
    } else {
      this.cameras.orbitControls.enabled = false;
      this.cameras.activeCamera = this.cameras.firstPersonViewCamera;
      this.cameras.pointControls.lock();
    }
  }

  showLocationInfo() {
    if (this.debug.active) {
      console.log(
        "Player on this coordinates:",
        "x:" + this.cameras.firstPersonViewCamera.position.x.toFixed(2) + ",",
        "y:" + this.cameras.firstPersonViewCamera.position.y.toFixed(2) + ",",
        "z:" + this.cameras.firstPersonViewCamera.position.z.toFixed(2)
      );
    }
  }

  togglePosition() {
    if (this.playerCapsule.scale.y === 0.5) {
      this.playerCapsule.position.y += 0.25;
      this.playerCapsule.scale.y = 1;
    } else {
      this.playerCapsule.scale.y = 0.5;
    }
  }

  destroy() {
    window.removeEventListener("mouseup", this.clickEvent);
  }
}
