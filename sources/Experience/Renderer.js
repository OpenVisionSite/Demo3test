import * as THREE from "three";
import Experience from "./Experience.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { HoloEffect } from "./HoloEffect.js";

export default class Renderer {
  constructor(_options = {}) {
    this.experience = new Experience();
    this.config = this.experience.config;
    this.debug = this.experience.debug;
    this.stats = this.experience.stats;
    this.time = this.experience.time;
    this.sizes = this.experience.sizes;
    this.scene = this.experience.scene;
    this.camera = this.experience.camera;

    // Debug
    if (this.debug) {
      this.debugFolder = this.debug.addFolder("renderer");
    }

    this.usePostprocess = true;

    this.setInstance();
    this.setPostProcess();
  }

  setInstance() {
    this.clearColor = "#010101";

    // Renderer
    this.instance = new THREE.WebGLRenderer({
      alpha: false,
      antialias: true,
    });
    this.instance.domElement.style.position = "absolute";
    this.instance.domElement.style.top = 0;
    this.instance.domElement.style.left = 0;
    this.instance.domElement.style.width = "100%";
    this.instance.domElement.style.height = "100%";

    this.instance.setClearColor(this.clearColor, 1);
    this.instance.setSize(this.config.width, this.config.height);
    this.instance.setPixelRatio(this.config.pixelRatio);

    // this.instance.physicallyCorrectLights = true;
    // this.instance.gammaOutPut = true
    // this.instance.outputEncoding = THREE.sRGBEncoding;
    // this.instance.shadowMap.type = THREE.PCFSoftShadowMap
    // this.instance.shadowMap.enabled = false
    this.instance.toneMapping = THREE.ACESFilmicToneMapping;
    this.instance.toneMappingExposure = 1;

    this.context = this.instance.getContext();

    // Add stats panel
    if (this.stats) {
      this.stats.setRenderPanel(this.context);
    }

    // Debug
    if (this.debug) {
      this.debugFolder.addColor(this, "clearColor").onChange(() => {
        this.instance.setClearColor(this.clearColor);
      });

      this.debugFolder
        .add(this.instance, "toneMapping", {
          NoToneMapping: THREE.NoToneMapping,
          LinearToneMapping: THREE.LinearToneMapping,
          ReinhardToneMapping: THREE.ReinhardToneMapping,
          CineonToneMapping: THREE.CineonToneMapping,
          ACESFilmicToneMapping: THREE.ACESFilmicToneMapping,
        })
        .onChange(() => {
          this.scene.traverse((_child) => {
            if (_child instanceof THREE.Mesh)
              _child.material.needsUpdate = true;
          });
        });

      this.debugFolder.add(this.instance, "toneMappingExposure").min(0).max(10);
    }
  }

  setPostProcess() {
    this.postProcess = {};

    /**
     * Render pass
     */
    this.postProcess.renderPass = new RenderPass(
      this.scene,
      this.camera.instance
    );

    /**
     * Effect composer
     */
    this.renderTarget = new THREE.WebGLRenderTarget(
      this.config.width,
      this.config.height,
      {
        generateMipmaps: false,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBFormat,
        encoding: THREE.sRGBEncoding,
        samples: 2,
      }
    );
    this.postProcess.composer = new EffectComposer(
      this.instance,
      this.renderTarget
    );
    this.postProcess.composer.setSize(this.config.width, this.config.height);
    this.postProcess.composer.setPixelRatio(this.config.pixelRatio);

    this.postProcess.composer.addPass(this.postProcess.renderPass);

    // Bloom
    // arguments: strength, radius, threshold
    this.postProcess.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(this.config.width, this.config.height),
      1.5,
      0.8,
      0.05
    );

    this.postProcess.composer.addPass(this.postProcess.bloomPass);

    this.holoEffect = new ShaderPass(HoloEffect);
    this.holoEffect.uniforms.scale.value = 1;
    this.postProcess.composer.addPass(this.holoEffect);
  }

  resize() {
    // Instance
    this.instance.setSize(this.config.width, this.config.height);
    this.instance.setPixelRatio(this.config.pixelRatio);

    // Post process
    this.postProcess.composer.setSize(this.config.width, this.config.height);
    this.postProcess.composer.setPixelRatio(this.config.pixelRatio);
  }

  update() {
    if (this.stats) {
      this.stats.beforeRender();
    }

    if (this.usePostprocess) {
      this.postProcess.composer.render();

      this.holoEffect.uniforms.uTime.value = this.time.elapsed * 0.003; // 0.0025 correct
    } else {
      this.instance.render(this.scene, this.camera.instance);
    }

    if (this.stats) {
      this.stats.afterRender();
    }
  }

  destroy() {
    this.instance.renderLists.dispose();
    this.instance.dispose();
    this.renderTarget.dispose();
    this.postProcess.composer.renderTarget1.dispose();
    this.postProcess.composer.renderTarget2.dispose();
  }
}
