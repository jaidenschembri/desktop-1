import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';

const canvas = document.querySelector('#vrm-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0.9, 2.);

// 💡 Lighting
const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
dirLight.position.set(1.5, 3, 2);
dirLight.castShadow = true;
dirLight.shadow.bias = -0.001;
scene.add(dirLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const rimLight = new THREE.DirectionalLight(0x88ccff, 0.3);
rimLight.position.set(-2, 1, -1);
scene.add(rimLight);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.7, 0);
controls.update();

let vrm = null;
let headBone = null;
let clock = new THREE.Clock();

const loader = new GLTFLoader();
loader.register((parser) => new VRMLoaderPlugin(parser));

loader.load(import.meta.env.BASE_URL + 'characters/kurabu.vrm', (gltf) => {
  
  console.log('✅ GLTF loaded:', gltf);
  VRMUtils.removeUnnecessaryJoints(gltf.scene);

  vrm = gltf.userData.vrm;
  const leftUpperArm = vrm.humanoid.getNormalizedBoneNode('leftUpperArm');
const leftLowerArm = vrm.humanoid.getNormalizedBoneNode('leftLowerArm');
const rightUpperArm = vrm.humanoid.getNormalizedBoneNode('rightUpperArm');
const rightLowerArm = vrm.humanoid.getNormalizedBoneNode('rightLowerArm');

if (leftUpperArm && rightUpperArm && leftLowerArm && rightLowerArm) {
  console.log("✅ Applying final relaxed pose");

  // 🦴 Drop upper arms down along Z axis
  leftUpperArm.rotation.z = THREE.MathUtils.degToRad(-65);   // arm hangs down at side
  rightUpperArm.rotation.z = THREE.MathUtils.degToRad(65);

  // 💪 Slight elbow bend so arms don’t look stiff
  leftLowerArm.rotation.z = THREE.MathUtils.degToRad(-15);
  rightLowerArm.rotation.z = THREE.MathUtils.degToRad(15);
}

  scene.add(vrm.scene);

  // 👁 Proper LookAt target
  if (vrm.lookAt) {
    vrm.lookAt.target = camera;
    console.log("👀 VRM LookAt target set to camera");
  }

  // Material & texture fixes
  vrm.scene.traverse(obj => {
    if (obj.isMesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;

      const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
      materials.forEach(mat => {
        if (mat.map) mat.map.encoding = THREE.sRGBEncoding;
        if (mat.color) mat.color.setScalar(0.5); // Adjust brightness
        console.log(`🧴 Material: ${obj.name}`);
        console.log('    color:', mat.color);
        console.log('    map:', mat.map);
      });
    }
  });

  console.log('✅ VRM added to scene:', vrm);

  const faceMesh = vrm.scene.getObjectByName('Face') || vrm.scene.children.find(child => child.material);
  if (faceMesh?.material) {
    console.log('🧴 Material color before:', faceMesh.material.color);
  }

  if (vrm.expressionManager) {
    const expr = vrm.expressionManager.expressions;
    for (const key in expr) {
      console.log('🧠 Expression:', key, expr[key]);
    }
  } else {
    console.warn('❌ expressionManager not found');
  }

  window.vrm = vrm;
  animate();
});

// 👄 Lipsync handler
window.animateMouth = (shape) => {
  if (!vrm || !vrm.expressionManager) {
    console.warn('No VRM or expressionManager for animation');
    return;
  }

  const mouthShapes = ['aa', 'ih', 'ou', 'ee', 'oh'];
  mouthShapes.forEach(s => vrm.expressionManager.setValue(s, 0.0));

  if (shape && mouthShapes.includes(shape)) {
    vrm.expressionManager.setValue(shape, 1.0);
    console.log(`👄 Mouth shape: ${shape}`);
  } else {
    console.log('🤐 Mouth closed');
  }
};

let time = 0;
let blinkTimer = 0;
let emotionTimer = 0;

function updateIdleAnimation(delta) {

  function updateFloat(delta) {
    if (vrm && vrm.scene) {
      const y = 0.02 * Math.sin(Date.now() * 0.002); // Float height
      vrm.scene.position.y = y;
    }
  }
  
  if (!vrm || !vrm.expressionManager) return;
  if (window.isSpeaking) return;

  time += delta;
  blinkTimer += delta;
  emotionTimer += delta;

  // Blink every 3–5s
  if (blinkTimer > 3 + Math.random() * 2) {
    vrm.expressionManager.setValue('blink', 1.0);
    setTimeout(() => {
      vrm.expressionManager.setValue('blink', 0.0);
    }, 150);
    blinkTimer = 0;
  }

  // Random emotion every 8–12s
  if (emotionTimer > 8 + Math.random() * 4) {
    const emotions = ['happy', 'relaxed', 'angry', 'sad', 'surprised'];
    const emotion = emotions[Math.floor(Math.random() * emotions.length)];

    vrm.expressionManager.setValue(emotion, 1.0);
    setTimeout(() => {
      vrm.expressionManager.setValue(emotion, 0.0);
      if (vrm.update) vrm.update(0.016);
    }, 800);

    emotionTimer = 0;
  }

  // Reset mouth if not speaking
  const mouthShapes = ['aa', 'ih', 'ou', 'ee', 'oh'];
  mouthShapes.forEach(shape => vrm.expressionManager.setValue(shape, 0.0));
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// 💫 Floating motion function
function updateFloat(delta) {
  if (!vrm || !vrm.scene) return;

  const floatY = 0.02 * Math.sin(Date.now() * 0.002); // Smooth up/down
  vrm.scene.position.y = floatY;
}

function animate() {

  // 🌬️ Subtle breathing motion
if (vrm && vrm.scene) {
  const t = performance.now() * 0.001;
  const breath = 0.01 * Math.sin(t * 1.5); // amplitude and speed
  vrm.scene.position.y = breath;
}


  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  if (vrm) {
    if (vrm.update) vrm.update(delta);
    if (vrm.lookAt) vrm.lookAt.update();

    updateFloat(delta); // 💫 Floating animation

    // 👤 Head follows camera
    if (headBone) {
      const headWorldPos = new THREE.Vector3();
      const camWorldPos = new THREE.Vector3();
      headBone.getWorldPosition(headWorldPos);
      camera.getWorldPosition(camWorldPos);

      const direction = camWorldPos.clone().sub(headWorldPos);
      const yaw = Math.atan2(direction.x, direction.z);
      const pitch = Math.atan2(direction.y, direction.length());

      const maxYaw = THREE.MathUtils.degToRad(30);
      const maxPitch = THREE.MathUtils.degToRad(10);
      const clampedYaw = THREE.MathUtils.clamp(yaw, -maxYaw, maxYaw);
      const clampedPitch = THREE.MathUtils.clamp(pitch, -maxPitch, maxPitch);

      const targetQuat = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(clampedPitch, clampedYaw, 0, 'YXZ')
      );

      headBone.quaternion.slerp(targetQuat, 0.1);
    }
  }

  updateIdleAnimation(delta);
  renderer.render(scene, camera);
}

animate();




// 🔥 Test emotion function
window.testEmotions = () => {
  if (!vrm || !vrm.expressionManager) {
    console.warn("VRM or expressionManager not ready");
    return;
  }

  const emotions = ['happy', 'angry', 'sad', 'relaxed', 'surprised'];
  let i = 0;

  const interval = setInterval(() => {
    const emotion = emotions[i];
    console.log(`🧠 Triggering emotion: ${emotion}`);
    vrm.expressionManager.setValue(emotion, 1.0);

    setTimeout(() => {
      vrm.expressionManager.setValue(emotion, 0.0);
    }, 800);

    i++;
    if (i >= emotions.length) {
      clearInterval(interval);
      console.log('✅ Emotion cycle complete');
    }
  }, 1200);
};
