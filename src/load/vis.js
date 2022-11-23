import {
  DisplayEngineSupport,
  generateConfig,
  JSONHandler,
  Template,
} from "vis-three";

const engine = new DisplayEngineSupport();

fetch("/config/vis.json")
  .then((response) => response.json())
  .then((config) => {
    engine
      .loadConfigAsync(
        Template.handler(JSONHandler.clone(config), (config) =>
          generateConfig(config.type, config)
        )
      )
      .then(() => {
        engine.setScene(config.scene[0].vid);
        engine.setCamera(config.camera[0].vid);
      });
  });

window.onload = () => {
  const dom = document.getElementById("app");
  engine.setDom(dom).setSize().play();
};
