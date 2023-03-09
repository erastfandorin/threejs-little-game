import * as THREE from "three";
import Application from "../Application";
import World from "./World.js";

import { MeshBVH, MeshBVHVisualizer, StaticGeometryGenerator } from "three-mesh-bvh";

export default class Collider {
  constructor() {
    this.application = new Application();
    this.debug = this.application.debug;
    this.controls = this.application.controls;
    this.cameras = this.application.cameras;
    this.scene = this.application.scene;

    this.world = new World();
    this.collider = this.world.collider;

    this.collisionMeshes = new THREE.Group();
    this.isFirstLoad = true;

    this.tempVector = new THREE.Vector3();
    this.tempVector2 = new THREE.Vector3();
    this.tempBox = new THREE.Box3();
    this.tempMat = new THREE.Matrix4();
    this.tempSegment = new THREE.Line3();

    this.playerOnFloor = false;

    this.playerDirection = new THREE.Vector3();
    this.playerVelocity = new THREE.Vector3();

    this.capsuleInfo = {
      radius: 0.5,
      segment: new THREE.Line3(new THREE.Vector3(), new THREE.Vector3(0, -1, 0)),
    };

    this.parameters = {
      gravity: -25,
      speed: 8,
    };

    this.i = 0;

    if (this.debug.active) {
      this.debug.ui.add(this.parameters, "gravity");
      this.debug.ui.add(this.parameters, "speed");
    }
  }

  addMesh(mesh) {
    mesh.updateWorldMatrix();
    this.collisionMeshes.add(mesh);
    this.updateCollider();
  }
  removeMesh(mesh) {
    this.collisionMeshes.remove(mesh);
    this.updateCollider();
  }

  updateCollider() {
    this.staticGenerator = new StaticGeometryGenerator(this.collisionMeshes);
    this.staticGenerator.attributes = ["position"];

    this.mergedGeometry = this.staticGenerator.generate();
    this.mergedGeometry.boundsTree = new MeshBVH(this.mergedGeometry, {
      lazyGeneration: false,
    });

    this.collider = new THREE.Mesh(this.mergedGeometry);
    this.collider.material.wireframe = true;

    if (this.isFirstLoad) {
      this.scene.add(this.collider);
      this.scene.add(this.collisionMeshes);

      this.isFirstLoad = false;
    }
  }

  updatePlayer(player, delta, startPosition) {

    this.keyStates = this.controls.keyStates;

    this.playerVelocity.y += this.playerOnFloor ? 0 : delta * this.parameters.gravity; // 30 = params.gravity

    player.position.addScaledVector(this.playerVelocity, delta);

    let speed = this.parameters.speed;

    if (this.keyStates["ShiftLeft"] || this.keyStates["ShiftRight"]) {
      speed = speed * 2;

      if (this.debug.active) {
        speed = speed * 5;
      }
    }

    if (this.keyStates["ArrowUp"] || this.keyStates["KeyW"]) {
      const direction = this.getForwardVector();
      player.position.addScaledVector(direction, speed * delta);
    }
    if (this.keyStates["ArrowRight"] || this.keyStates["KeyD"]) {
      const direction = this.getSideVector();
      player.position.addScaledVector(direction, speed * delta);
    }
    if (this.keyStates["ArrowDown"] || this.keyStates["KeyS"]) {
      const direction = this.getForwardVector();
      player.position.addScaledVector(direction, -speed * delta);
    }
    if (this.keyStates["ArrowLeft"] || this.keyStates["KeyA"]) {
      const direction = this.getSideVector();
      player.position.addScaledVector(direction, -speed * delta);
    }

    if (this.keyStates["Control"] || this.keyStates["Space"]) {
      if (this.playerOnFloor) {
        this.playerVelocity.y = 8.0; // 15.0;
        player.position.addScaledVector(this.playerVelocity, speed * delta);
      }
    }

    player.updateMatrixWorld();

    this.tempBox.makeEmpty();
    this.tempMat.copy(this.collider.matrixWorld).invert();
    this.tempSegment.copy(this.capsuleInfo.segment);

    // get the position of the capsule in the local space of the collider
    this.tempSegment.start.applyMatrix4(player.matrixWorld).applyMatrix4(this.tempMat);
    this.tempSegment.end.applyMatrix4(player.matrixWorld).applyMatrix4(this.tempMat);

    // get the axis aligned bounding box of the capsule
    this.tempBox.expandByPoint(this.tempSegment.start);
    this.tempBox.expandByPoint(this.tempSegment.end);

    this.tempBox.min.addScalar(-this.capsuleInfo.radius);
    this.tempBox.max.addScalar(this.capsuleInfo.radius);

    this.collider.geometry.boundsTree.shapecast({
      intersectsBounds: (box) => box.intersectsBox(this.tempBox),

      intersectsTriangle: (tri) => {
        // check if the triangle is intersecting the capsule and adjust the
        // capsule position if it is.
        const triPoint = this.tempVector;
        const capsulePoint = this.tempVector2;

        const distance = tri.closestPointToSegment(this.tempSegment, triPoint, capsulePoint);
        if (distance < this.capsuleInfo.radius) {
          const depth = this.capsuleInfo.radius - distance;
          const direction = capsulePoint.sub(triPoint).normalize();

          this.tempSegment.start.addScaledVector(direction, depth);
          this.tempSegment.end.addScaledVector(direction, depth);
        }
      },
    });

    // get the adjusted position of the capsule collider in world space after checking
    // triangle collisions and moving it. this.capsuleInfo.segment.start is assumed to be
    // the origin of the player model.
    const newPosition = this.tempVector;
    newPosition.copy(this.tempSegment.start).applyMatrix4(this.collider.matrixWorld);

    // check how much the collider was moved
    const deltaVector = this.tempVector2;
    deltaVector.subVectors(newPosition, player.position);

    // if the player was primarily adjusted vertically we assume it's on something we should consider ground
    this.playerOnFloor = deltaVector.y > Math.abs(delta * this.playerVelocity.y * 0.25);

    // adjust the player model
    player.position.add(deltaVector);

    if (!this.playerOnFloor) {
      deltaVector.normalize();
      this.playerVelocity.addScaledVector(deltaVector, -deltaVector.dot(this.playerVelocity));
    } else {
      this.playerVelocity.set(0, 0, 0);
    }

    this.cameras.firstPersonViewCamera.position.copy(this.tempSegment.start);

    // if the player has fallen too far below the level reset their position to the start
    if (player.position.y < -25) {
      this.cameras.firstPersonViewCamera.rotation.set(0, 0, 0);

      this.playerVelocity.set(0, 0, 0);
      player.position.copy(startPosition);
    }
  }

  getForwardVector() {
    this.cameras.firstPersonViewCamera.getWorldDirection(this.playerDirection);
    this.playerDirection.y = 0;
    this.playerDirection.normalize();

    return this.playerDirection;
  }
  getSideVector() {
    this.cameras.firstPersonViewCamera.getWorldDirection(this.playerDirection);
    this.playerDirection.y = 0;
    this.playerDirection.normalize();
    this.playerDirection.cross(this.cameras.firstPersonViewCamera.up);

    return this.playerDirection;
  }
}
