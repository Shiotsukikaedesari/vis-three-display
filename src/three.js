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
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";

const textureLoader = new TextureLoader();
const cubeTextureLoader = new CubeTextureLoader();
const objLoader = new OBJLoader();

export const transfromAnchor = function (geometry, config) {
  geometry.center();

  geometry.computeBoundingBox();

  const box = geometry.boundingBox;
  const position = config.position;
  const rotation = config.rotation;
  const scale = config.scale;

  // 先应用旋转缩放
  const quaternion = new Quaternion().setFromEuler(
    new Euler(rotation.x, rotation.y, rotation.z, "XYZ")
  );

  // 再应用缩放
  geometry.applyQuaternion(quaternion);
  geometry.scale(scale.x, scale.y, scale.z);

  // 计算位置
  geometry.center();

  geometry.computeBoundingBox();

  // 根据旋转缩放运算位置
  geometry.translate(
    ((box.max.x - box.min.x) / 2) * position.x,
    ((box.max.y - box.min.y) / 2) * position.y,
    ((box.max.z - box.min.z) / 2) * position.z
  );
  return geometry;
};

const renderer = new WebGLRenderer({
  antialias: true,
});

renderer.physicallyCorrectLights = true;
renderer.toneMapping = ReinhardToneMapping;
renderer.toneMappingExposure = 3;
renderer.shadowMap.enabled = true;

const scene = new Scene();
const sceneTexture = cubeTextureLoader
  .setPath("/lightblue/")
  .load(["px.png", "nx.png", "py.png", "ny.png", "pz.png", "nz.png"]);

scene.background = sceneTexture;
scene.environment = sceneTexture;

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

const ambientLight = new AmbientLight("white", 1);

const directionLight1 = new DirectionalLight(
  "rgb(255, 255, 255)",
  1000 * 4 * Math.PI
);

directionLight1.position.set(-10, 40, 20);

const directionLight2 = new DirectionalLight(
  "rgb(255, 255, 255)",
  1000 * 4 * Math.PI
);

directionLight2.position.set(10, 40, -20);

scene.add(ambientLight, directionLight1, directionLight2);

let threeObj = "";

objLoader.loadAsync("/three.obj").then((group) => {
  const obj = group.children[0];
  const geometry = obj.geometry;

  transfromAnchor(geometry, {
    rotation: {
      x: Math.PI / 2,
      y: -(Math.PI / 180) * 30,
      z: 0,
    },
    position: {
      x: 0.13,
      y: -0.14,
      z: 0,
    },
    scale: {
      x: 80,
      y: 80,
      z: 80,
    },
  });

  const material = new MeshStandardMaterial({
    color: "white",
    metalness: 1,
    roughness: 0,
    envMapIntensity: 0.8,
  });

  obj.material.dispose();
  obj.material = material;

  scene.add(obj);

  threeObj = obj;
});

let visObj = "";

objLoader.loadAsync("/vis.obj").then((group) => {
  const obj = group.children[0];
  const geometry = obj.geometry;

  transfromAnchor(geometry, {
    rotation: {
      x: 0,
      y: 0,
      z: 0,
    },
    position: {
      x: 0,
      y: 0,
      z: 0,
    },
    scale: {
      x: 6,
      y: 6,
      z: 6,
    },
  });

  const colorMap = textureLoader.load("colorMap.png");

  const material = new MeshStandardMaterial({
    metalness: 1,
    roughness: 0,
    transparent: true,
    opacity: 0.8,
    map: colorMap,
  });

  obj.material.dispose();
  obj.material = material;

  scene.add(obj);

  visObj = obj;
});

const clock = new Clock();

let timer = "";

const renderFun = () => {
  orbitControls.update();

  renderer.render(scene, camera);

  const delta = clock.getDelta();

  threeObj && (threeObj.rotation.z += delta * 0.2);
  visObj && (visObj.rotation.y += delta * 0.7);

  timer = requestAnimationFrame(renderFun);
};

window.onload = () => {
  const dom = document.getElementById("app");
  dom.appendChild(renderer.domElement);
  renderer.setSize(dom.offsetWidth, dom.offsetHeight, true);
  camera.aspect = dom.offsetWidth / dom.offsetHeight;
  camera.updateProjectionMatrix();

  document.getElementById("save").onclick = () => {
    cancelAnimationFrame(timer);
    const blob = new Blob([JSON.stringify(scene.toJSON())], {
      type: "text/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    a.download = "three.json";
    a.click();
    renderFun();
  };
};

renderFun();
