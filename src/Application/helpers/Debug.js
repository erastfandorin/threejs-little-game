import * as dat from "lil-gui";
import Stats from "three/examples/jsm/libs/stats.module.js";
import Application from "../Application";

export default class Debug {
  constructor() {
    this.application = new Application();
    this.time = this.application.time
    this.active = window.location.hash === "#debug";

    if (this.active) {
      this.ui = new dat.GUI();
      this.setStats();
    }

  }

  setStats() {
    this.$debugBox = document.querySelector(".stats-box");

    this.stats = new Stats();
    // this.stats.showPanel(1);
    this.stats.domElement.style.position = "absolute";
    this.stats.domElement.style.top = "0px";
    this.$debugBox.appendChild(this.stats.domElement);

    this.time.on("tick", () => {
      this.stats.update();
    })
  }
}
