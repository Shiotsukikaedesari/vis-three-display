import {
  DisplayEngineSupport,
  CONFIGTYPE,
  generateConfig,
  AniScriptLibrary,
} from "vis-three";
import { ReinhardToneMapping } from "three";

const engine = new DisplayEngineSupport();
generateConfig.injectEngine = engine;

const scene = generateConfig(CONFIGTYPE.SCENE);

engine.setScene(scene.vid);

const camera = generateConfig(CONFIGTYPE.PERSPECTIVECAMERA, {
  far: 10000,
  near: 0.01,
  position: {
    x: 90,
    y: -90,
    z: 100,
  },
});

engine.setCamera(camera.vid);

generateConfig.injectScene = true;

generateConfig(CONFIGTYPE.WEBGLRENDERER, {
  clearColor: "rgba(10, 2, 10, 1)",
  physicallyCorrectLights: true,
  toneMapping: ReinhardToneMapping,
  toneMappingExposure: 3,
});

generateConfig(CONFIGTYPE.ORBITCONTROLS, {
  autoRotate: true,
  autoRotateSpeed: 0.5,
  enableDamping: true,
  maxDistance: 200,
  minDistance: 100,
  enablePan: false,
});

engine
  .loadResourcesAsync([
    "/three.obj",
    "/vis.obj",
    "/colorMap.png",
    "/lightblue/px.png",
    "/lightblue/py.png",
    "/lightblue/pz.png",
    "/lightblue/nx.png",
    "/lightblue/ny.png",
    "/lightblue/nz.png",
  ])
  .then(({ resourceConfig }) => {
    const envTexture = generateConfig(CONFIGTYPE.CUBETEXTURE, {
      cube: {
        px: "/lightblue/px.png",
        py: "/lightblue/py.png",
        pz: "/lightblue/pz.png",
        nx: "/lightblue/nx.png",
        ny: "/lightblue/ny.png",
        nz: "/lightblue/nz.png",
      },
    });

    scene.background = envTexture.vid;
    scene.environment = envTexture.vid;

    generateConfig(CONFIGTYPE.AMBIENTLIGHT, {
      intensity: 1,
    });

    generateConfig(CONFIGTYPE.DIRECTIONALLIGHT, {
      color: "rgb(255, 255, 255)",
      position: {
        x: -10,
        y: 40,
        z: 20,
      },
      intensity: 1000 * 4 * Math.PI,
    });

    generateConfig(CONFIGTYPE.DIRECTIONALLIGHT, {
      color: "rgb(255, 255, 255)",
      position: {
        x: 10,
        y: 40,
        z: -20,
      },
      intensity: 1000 * 4 * Math.PI,
    });

    const geometry = generateConfig(
      CONFIGTYPE.LOADGEOMETRY,
      Object.assign(Object.values(resourceConfig["/three.obj"].geometry)[0], {
        rotation: {
          x: Math.PI / 2,
          y: -(Math.PI / 180) * 30,
        },
        position: {
          x: 0.13,
          y: -0.14,
        },
        scale: {
          x: 80,
          y: 80,
          z: 80,
        },
      })
    );

    const material = generateConfig(CONFIGTYPE.MESHSTANDARDMATERIAL, {
      color: "white",
      metalness: 1,
      roughness: 0,
      envMapIntensity: 0.8,
    });

    const threeMesh = generateConfig(CONFIGTYPE.MESH, {
      geometry: geometry.vid,
      material: material.vid,
    });

    const visGeometry = generateConfig(
      CONFIGTYPE.LOADGEOMETRY,
      Object.assign(Object.values(resourceConfig["/vis.obj"].geometry)[0], {
        scale: {
          x: 6,
          y: 6,
          z: 6,
        },
      })
    );

    const visColorTexture = generateConfig(CONFIGTYPE.IMAGETEXTURE, {
      url: "/colorMap.png",
    });

    const visMaterial = generateConfig(CONFIGTYPE.MESHSTANDARDMATERIAL, {
      map: visColorTexture.vid,
      metalness: 1,
      roughness: 0,
      transparent: true,
      opacity: 0.8,
    });

    const visMesh = generateConfig(CONFIGTYPE.MESH, {
      geometry: visGeometry.vid,
      material: visMaterial.vid,
    });

    generateConfig(CONFIGTYPE.SCRIPTANIMATION, {
      target: threeMesh.vid,
      attribute: ".rotation.z",
      script: AniScriptLibrary.generateConfig("linearTime", {
        multiply: 0.2,
      }),
    });

    generateConfig(CONFIGTYPE.SCRIPTANIMATION, {
      target: visMesh.vid,
      attribute: ".rotation.y",
      script: AniScriptLibrary.generateConfig("linearTime", {
        multiply: 0.7,
      }),
    });
  });

window.onload = () => {
  const dom = document.getElementById("app");
  engine.setDom(dom).setSize().play();

  document.getElementById("save").onclick = () => {
    const blob = new Blob([engine.toJSON()], {
      type: "text/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    a.download = "vis.json";
    a.click();
  };
};
