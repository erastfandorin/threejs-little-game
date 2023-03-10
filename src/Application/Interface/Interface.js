import { gsap } from "gsap";
import Application from "../Application.js";
import { debounce } from "../helpers/utilFunctions.js";

export default class Interface {
  constructor() {
    this.application = new Application();
    this.time = this.application.time;
    this.cameras = this.application.cameras;
    this.config = this.application.config;
    this.debug = this.application.debug;
    this.controls = this.application.controls;
    this.scene = this.application.scene;
    this.sizes = this.application.sizes;
    this.resources = this.application.resources;

    this.$overlay = document.querySelector(".overlay");
    this.$loadingBarElement = document.querySelector(".loading-bar");
    this.$loadingCount = document.querySelector(".loading-count");
    this.$instructionHeadline = document.querySelector(".blocker__headline");
    this.$blocker = document.querySelector(".blocker");
    this.$instructions = document.querySelector(".blocker__instructions");

    this.isGameOnPause = false;

    this.setInterface();
    this.setLoader();

    this.toggleInterface = debounce(this.toggleInterface, 300);

    this.update();
  }

  setInterface() {
    if (this.debug.active) {
      this.$overlay.style.background = "transparent";
    }
  }

  toggleInterface() {
    if (this.$blocker.classList.contains("blocker--hide")) {
      this.openMenu();
    } else {
      this.closeMenu();
    }
  }
  openMenu() {
    this.$blocker.classList.remove("blocker--hide");
    this.cameras.pointControls.unlock();
    this.isGameOnPause = true;
  }
  closeMenu() {
    this.$blocker.classList.add("blocker--hide");
    if (this.cameras.activeCamera !== this.cameras.threePersonViewCamera) {
      this.cameras.pointControls.lock();
    }
    this.isGameOnPause = false;
  }

  resetLoader() {
    this.$overlay.style.opacity = 1;
    this.$overlay.style.display = "block";
    this.$loadingCount.style.display = "block";

    this.$instructionHeadline.style.opacity = "0";
    this.$loadingBarElement.classList.remove("ended");
  }

  setLoader() {
    let isLoaded = false;

    this.time.on("tick", () => {
      if (!isLoaded) {
        if (!this.resources.isSourceLoad) {
          this.$loadingBarElement.style.transform = `scaleX(${this.resources.loadingProgress})`;
          this.$loadingCount.textContent = Math.ceil(this.resources.loadingProgress * 100) + "%";
        } else {
          window.setTimeout(() => {
            gsap.to(this.$overlay, { duration: 1, opacity: 0, delay: 1 });
            gsap.to(this.$overlay, { duration: 1, display: "none", delay: 1 });
            gsap.to(this.$loadingCount, {
              duration: 0.5,
              display: "none",
              delay: 1,
            });
            gsap.to(this.$instructionHeadline, {
              duration: 1.5,
              opacity: "1",
              delay: 2,
            });

            this.$loadingBarElement.classList.add("ended");
            this.$loadingBarElement.style.transform = "";

            isLoaded = true;
          }, 500);
        }
      }
    });
  }

  update() {
    this.time.on("tick", () => {
      if (this.controls.keyStates["KeyQ"]) {
        this.toggleInterface();
      }
    });
  }
}
