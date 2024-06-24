import * as THREE from "three";
import Experience from "./Experience.js";
import Canvas from "./Canvas.js";
import Human from "./Human.js";

export default class World {
  constructor(_options) {
    this.experience = new Experience();
    this.config = this.experience.config;
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;

    this.resources.on("groupEnd", (_group) => {
      if (_group.name === "base") {
        this.setHuman();
      }
    });
  }

  setHuman() {
    this.human = new Human();
  }

  resize() {}

  update() {
    if (this.human) this.human.update();
  }

  destroy() {}
}
