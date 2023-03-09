import * as THREE from "three";

export default class AudioManager {
  constructor() {
    this.setManager();
  }

  setManager() {
    this.listener = new THREE.AudioListener();
    this.audio = new THREE.Audio(this.listener);
    const file = "/audio/city-overview.mp3";

    if (/(iPad|iPhone|iPod)/g.test(navigator.userAgent)) {
      const loader = new THREE.AudioLoader();
      loader.load(file, function (buffer) {
        audio.setBuffer(buffer);
        audio.play();
      });
    } else {
      const mediaElement = new Audio(file);
      // // mediaElement.play();

      this.audio.setMediaElementSource(mediaElement);
      this.audio.play();
    }
  }
}
