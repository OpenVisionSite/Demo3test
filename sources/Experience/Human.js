import * as THREE from "three";
import Experience from "./Experience.js";
import { HDRCubeTextureLoader } from "three/examples/jsm/loaders/HDRCubeTextureLoader.js";

export default class Human {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.renderer = this.experience.renderer.instance;
    this.time = this.experience.time;
    this.resources = this.experience.resources;
    this.setHuman();
  }

  setHuman() {
    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.pmremGenerator.compileEquirectangularShader();

    this.envMap = this.pmremGenerator.fromEquirectangular(
      this.resources.items.envMap
    ).texture;
    this.pmremGenerator.dispose();

    this.m = new THREE.MeshStandardMaterial({
      metalness: 1,
      roughness: 0.128,
    });
    this.m.envMap = this.envMap;

    this.m.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = { value: 0 };

      shader.fragmentShader =
        `
        uniform float uTime;
        mat4 rotationMatrix(vec3 axis, float angle) {
            axis = normalize(axis);
            float s = sin(angle);
            float c = cos(angle);
            float oc = 1.0 - c;
            
            return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                        oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                        oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                        0.0,                                0.0,                                0.0,                                1.0);
        }

        vec3 rotate(vec3 v, vec3 axis, float angle) {
          mat4 m = rotationMatrix(axis, angle);
          return (m * vec4(v, 1.0)).xyz;
        }
      ` + shader.fragmentShader;

      shader.fragmentShader = shader.fragmentShader.replace(
        `#include <envmap_physical_pars_fragment>`,
        `
        #if defined( USE_ENVMAP )
          vec3 getIBLIrradiance( const in vec3 normal ) {
            #if defined( ENVMAP_TYPE_CUBE_UV )
              vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
              vec4 envMapColor = textureCubeUV( envMap, worldNormal, 1.0 );
              return PI * envMapColor.rgb * envMapIntensity;
            #else
              return vec3( 0.0 );
            #endif
          }
          vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
            #if defined( ENVMAP_TYPE_CUBE_UV )
              vec3 reflectVec = reflect(  viewDir, normal );
              // Mixing the reflection with the normal is more accurate and keeps rough objects from gathering light from behind their tangent plane.
              reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
              reflectVec = inverseTransformDirection( reflectVec, viewMatrix );

              reflectVec = rotate(reflectVec, vec3(1.0, 2.3, 0.0), uTime * 0.05);

              vec4 envMapColor = textureCubeUV( envMap, reflectVec, roughness );
              return envMapColor.rgb * envMapIntensity;
            #else
              return vec3( 0.0 );
            #endif
          }
        #endif
      `
      );

      this.m.userData.shader = shader;
    };

    this.human = this.resources.items.human.scene.children[0];
    this.human.scale.set(0.1, 0.1, 0.1);
    this.human.geometry.center();
    this.human.position.y = -0.00;
    this.human.position.x = -0.0;
    this.human.geometry.rotateY(-Math.PI * 0.5);
    this.human.material = this.m;
    this.scene.add(this.human);
  }

  update() {
    if (this.m.userData.shader) {
      this.m.userData.shader.uniforms.uTime.value = this.time.elapsed * 0.01;
    }

    // rotate the human
    // this.human.rotation.y += 0.005;
  }
}
