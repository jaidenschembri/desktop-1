// vrm.js — legacy version (no modules, GH Pages safe)

const canvas = document.querySelector('#vrm-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
renderer.setSize(canvas.clientWidth, canvas.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
camera.position.set(0, 1.4, 2);

scene.add(new THREE.AmbientLight(0xffffff, 0.6));

const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
dirLight.position.set(1, 3, 2);
dirLight.castShadow = true;
scene.add(dirLight);

let currentVrm = null;
const clock = new THREE.Clock();

const loader = new THREE.GLTFLoader();
loader.load('characters/kurabu.vrm', function (gltf) {
  THREE.VRMUtils.removeUnnecessaryJoints(gltf.scene);

  THREE.VRM.from(gltf).then(function (vrm) {
    scene.add(vrm.scene);
    currentVrm = vrm;

    console.log('✅ GLTF loaded:', vrm);

    // Set up basic pose
    const leftUpperArm = vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.LeftUpperArm);
    const rightUpperArm = vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.RightUpperArm);
    const leftLowerArm = vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.LeftLowerArm);
    const rightLowerArm = vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.RightLowerArm);

    if (leftUpperArm) leftUpperArm.rotation.z = THREE.Math.degToRad(-65);
    if (rightUpperArm) rightUpperArm.rotation.z = THREE.Math.degToRad(65);
    if (leftLowerArm) leftLowerArm.rotation.z = THREE.Math.degToRad(-15);
    if (rightLowerArm) rightLowerArm.rotation.z = THREE.Math.degToRad(15);

    animate();
  });
});

function animate() {
  requestAnimationFrame(animate);
  const deltaTime = clock.getDelta();
  if (currentVrm) {
    currentVrm.update(deltaTime);
    currentVrm.scene.position.y = 0.01 * Math.sin(performance.now() * 0.0015);
  }
  renderer.render(scene, camera);
}

// ✅ External mouth control
window.animateMouth = function (shape) {
  if (!currentVrm || !currentVrm.blendShapeProxy) return;
  const proxy = currentVrm.blendShapeProxy;

  const keys = ['aa', 'ih', 'ou', 'ee', 'oh'];
  keys.forEach(k => proxy.setValue(THREE.VRM.blendShapePresetName[k.toUpperCase()], 0.0));

  if (shape) {
    proxy.setValue(THREE.VRM.blendShapePresetName[shape.toUpperCase()], 1.0);
  }
};
