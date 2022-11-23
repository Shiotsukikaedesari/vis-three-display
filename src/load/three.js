import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  Vector3,
  AmbientLight,
  DirectionalLight,
  TextureLoader,
  CubeTextureLoader,
  Quaternion,
  MeshStandardMaterial,
  Euler,
  Clock,
  ReinhardToneMapping,
  ObjectLoader,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const objectLoader = new ObjectLoader();

const renderer = new WebGLRenderer({
  antialias: true,
});

renderer.physicallyCorrectLights = true;
renderer.toneMapping = ReinhardToneMapping;
renderer.toneMappingExposure = 3;
renderer.shadowMap.enabled = true;

const camera = new PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  1,
  1000
);

camera.position.set(90, -90, 100);
camera.lookAt(new Vector3(0, 0, 0));
camera.up = new Vector3(0, 1, 0);

const orbitControls = new OrbitControls(camera, renderer.domElement);

orbitControls.autoRotate = true;
orbitControls.autoRotateSpeed = 0.5;
orbitControls.enableDamping = true;
orbitControls.maxDistance = 200;
orbitControls.minDistance = 100;
orbitControls.enablePan = false;

const clock = new Clock();

console.time();
objectLoader.loadAsync("config/three.json").then((scene) => {
  let timer = "";
  console.timeEnd();

  console.log(scene);
  const renderFun = () => {
    orbitControls.update();

    renderer.render(scene, camera);

    const delta = clock.getDelta();

    timer = requestAnimationFrame(renderFun);
  };

  renderFun();
});

window.onload = () => {
  const dom = document.getElementById("app");
  dom.appendChild(renderer.domElement);
  renderer.setSize(dom.offsetWidth, dom.offsetHeight, true);
  camera.aspect = dom.offsetWidth / dom.offsetHeight;
  camera.updateProjectionMatrix();
};
