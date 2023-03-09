import * as THREE from "three";

// DEBOUNCE
export function debounce(fn, ms) {
  let isCooldown = false;

  return function () {
    if (isCooldown) return;

    fn.apply(this, arguments);

    isCooldown = true;
    setTimeout(() => (isCooldown = false), ms);
  };
}

// CREATE BARRIERS
const boxBarrierGeometry = new THREE.BufferGeometry();
const vertices = new Float32Array([
  // Front face
  -0.5, -0.5,  0.5,
   0.5, -0.5,  0.5,
   0.5,  0.5,  0.5,
  -0.5,  0.5,  0.5,

  // Back face
   0.5, -0.5,  -0.5,
  -0.5, -0.5,  -0.5,
  -0.5,  0.5,  -0.5,
   0.5,  0.5,  -0.5,

  // Top face
  -0.5,  0.5,   0.5,
   0.5,  0.5,   0.5,
   0.5,  0.5,  -0.5,
  -0.5,  0.5,  -0.5,

  // Bottom face
  -0.5, -0.5,  -0.5,
   0.5, -0.5,  -0.5,
   0.5, -0.5,   0.5,
  -0.5, -0.5,   0.5,

  // Right face
  0.5, -0.5,   0.5,
  0.5, -0.5,  -0.5,
  0.5,  0.5,  -0.5,
  0.5,  0.5,   0.5,

  // Left face
  -0.5, -0.5,  -0.5,
  -0.5, -0.5,   0.5,
  -0.5,  0.5,   0.5,
  -0.5,  0.5,  -0.5,
]);
boxBarrierGeometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));

const indices = new Uint16Array([
0, 1, 2,    0, 2, 3,    // front
4, 5, 6,    4, 6, 7,    // back
8, 9, 10,   8, 10, 11,  // left
12, 13, 14, 12, 14, 15, // right
16, 17, 18, 16, 18, 19, // top
20, 21, 22, 20, 22, 23  // bottom
]);
boxBarrierGeometry.setIndex(new THREE.BufferAttribute(indices, 1));
const barrierMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true, visible: false });

export function createBarrier(scale = [0, 0, 0], position = [0, 0, 0], debug = undefined) {

  if (debug && debug.active) {
    barrierMaterial.visible = true;
  }

  const cube = new THREE.Mesh(sphereBarrierGeometry, barrierMaterial);
  cube.scale.set(...scale);
  cube.position.set(...position);

  return cube;
}

export function createBarriers(barrier, debug, collider) {
  const cube = createBarrier([0, 0, 0], [0, 0, 0], debug);
  cube.scale.set(barrier.scale.x, barrier.scale.y, barrier.scale.z);
  cube.position.set(
    barrier.position.x,
    barrier.position.y,
    barrier.position.z
  );
  if (barrier.rotation) {
    cube.rotation.set(
      barrier.rotation.x,
      barrier.rotation.y,
      barrier.rotation.z
    );
  }

  cube.updateWorldMatrix();
  collider.addMesh(cube);
}

// CREATE CUBE FROM MIN/MAX
export function createCubeFromMinMaxPoint(min, max, topY, bottomY) {
  const locationBoxGeometry = new THREE.BufferGeometry();
  const locationBoxMaterial = new THREE.MeshBasicMaterial({ 
    side: THREE.DoubleSide, 
    wireframe: true,
    visible: false  
  });

  const vertices = new Float32Array([
    // Front face
    min.x, bottomY, max.z,    // 0
    max.x, bottomY, max.z,    // 1
    max.x, topY, max.z,       // 2
    min.x, topY, max.z,       // 3

    // Back face
    max.x, bottomY, min.z,    // 4
    min.x, bottomY, min.z,    // 5
    min.x, topY, min.z,       // 6
    max.x, topY, min.z,       // 7

    // Top face
    min.x, topY, max.z,       // 8
    max.x, topY, max.z,       // 9
    max.x, topY, min.z,       // 10
    min.x, topY, min.z,       // 11

    // Bottom face
    min.x, bottomY, min.z,    // 12
    max.x, bottomY, min.z,    // 13
    max.x, bottomY, max.z,    // 14
    min.x, bottomY, max.z,    // 15

    // Right face
    max.x, bottomY, max.z,    // 16
    max.x, bottomY, min.z,    // 17
    max.x, topY, min.z,       // 18
    max.x, topY, max.z,       // 19

    // Left face
    min.x, bottomY, min.z,    // 20
    min.x, bottomY, max.z,    // 21
    min.x, topY, max.z,       // 22
    min.x, topY, min.z,       // 23
  ]);
  locationBoxGeometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));

  const indices = new Uint16Array([
    0, 1, 2,    0, 2, 3,   // front
    4, 5, 6,    4, 6, 7,   // back
    8, 9, 10,   8, 10, 11, // left
    12, 13, 14, 12, 14, 15, // right
    16, 17, 18, 16, 18, 19, // top
    20, 21, 22, 20, 22, 23  // bottom
  ]);
  locationBoxGeometry.setIndex(new THREE.BufferAttribute(indices, 1));
  
  const cube = new THREE.Mesh(locationBoxGeometry, locationBoxMaterial);
  return cube;
}

// CHANGE MATERIAL
export function changeMaterialInModel({ materialType, oldMaterial }) {
  switch (materialType) {
    case "lambert":
      return new THREE.MeshLambertMaterial({
        map: oldMaterial?.map ? oldMaterial.map : null,
        color: oldMaterial?.color ? oldMaterial.color : new THREE.Color(0xffffff),
        side: THREE.DoubleSide,
        transparent: false,
      });
    default:
      console.log("uncorect material type")
      break;
  }
}
