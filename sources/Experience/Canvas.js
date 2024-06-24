import * as THREE from 'three'
import Experience from './Experience.js'

import vertex from './Shader/canvas/vertex.glsl'
import fragment from './Shader/canvas/fragment.glsl'

export default class Canvas {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.config = this.experience.config

    this.setGeometry()
    this.setMaterial()
    this.setMesh()
  }

  setGeometry() {
    this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1)
  }

  setMaterial() {
    this.material = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment
    })
  }

  setMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.scene.add(this.mesh)
  }

  update() {}
}