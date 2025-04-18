// script/vrm.js
const canvas = document.querySelector('#vrm-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
renderer.setSize(canvas.width, canvas.height);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, canvas.width / canvas.height, 0.1, 100);
camera.position.set(0, 0.9, 2);

const light = new THREE.DirectionalLight(0xffffff, 1.2);
light.position.set(1.5, 3, 2);
light.castShadow = true;
scene.add(light);

scene.add(new THREE.AmbientLight(0xffffff, 0.4));
scene.add(new THREE.DirectionalLight(0x88ccff, 0.3).position.set(-2, 1, -1));

let vrm = null;
let clock = new THREE.Clock();
let headBone = null;

const loader = new THREE.GLTFLoader();
loader.register((parser) => new THREE.VRMLoaderPlugin(parser));
loader.load('characters/kurabu.vrm', (gltf) => {
  THREE.VRMUtils.removeUnnecessaryJoints(gltf.scene);
  vrm = gltf.userData.vrm;
  scene.add(vrm.scene);

  const leftUpperArm = vrm.humanoid.getNormalizedBoneNode('leftUpperArm');
  const rightUpperArm = vrm.humanoid.getNormalizedBoneNode('rightUpperArm');
  const leftLowerArm = vrm.humanoid.getNormalizedBoneNode('leftLowerArm');
  const rightLowerArm = vrm.humanoid.getNormalizedBoneNode('rightLowerArm');

  if (leftUpperArm && rightUpperArm && leftLowerArm && rightLowerArm) {
    leftUpperArm.rotation.z = THREE.MathUtils.degToRad(-65);
    rightUpperArm.rotation.z = THREE.MathUtils.degToRad(65);
    leftLowerArm.rotation.z = THREE.MathUtils.degToRad(-15);
    rightLowerArm.rotation.z = THREE.MathUtils.degToRad(15);
  }

  if (vrm.lookAt) vrm.lookAt.target = camera;

  vrm.scene.traverse(obj => {
    if (obj.isMesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;
      if (Array.isArray(obj.material)) {
        obj.material.forEach(mat => mat.map && (mat.map.encoding = THREE.sRGBEncoding));
      } else if (obj.material?.map) {
        obj.material.map.encoding = THREE.sRGBEncoding;
      }
    }
  });

  window.vrm = vrm;
  animate();
});

window.animateMouth = (shape) => {
  if (!vrm || !vrm.expressionManager) return;
  ['aa', 'ih', 'ou', 'ee', 'oh'].forEach(s => vrm.expressionManager.setValue(s, 0.0));
  if (shape) vrm.expressionManager.setValue(shape, 1.0);
};

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  if (vrm) {
    vrm.update?.(delta);
    vrm.lookAt?.update?.();

    const t = performance.now() * 0.001;
    vrm.scene.position.y = 0.01 * Math.sin(t * 1.5);
  }
  renderer.render(scene, camera);
}
