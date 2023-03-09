import "./style.css";
import Application from "./Application/Application.js";
import config from "./config.js";

const application = new Application({
  $canvas: document.querySelector("canvas.webgl"),
  config: config,
});
