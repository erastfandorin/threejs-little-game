import EventEmitter from "./EventEmitter.js";

export default class Time extends EventEmitter {
  constructor() {
    super();

    this.start = Date.now();
    this.current = this.start;
    this.elapsed = 0;
    this.delta = 16; // first frame time 16

    this.tick = this.tick.bind(this)

    window.requestAnimationFrame(this.tick);
  }

  tick() {
    const currentTime = Date.now();

    this.delta = currentTime - this.current;
    this.current = currentTime;
    this.elapsed = this.current - this.start;

    if (this.delta > 60) {
      this.delta = 60;
    }

    this.ticker = window.requestAnimationFrame(this.tick);

    this.trigger("tick");
  }
  stop() {
    window.cancelAnimationFrame(this.ticker);
  }
}
