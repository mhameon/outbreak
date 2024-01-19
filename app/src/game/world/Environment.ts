import * as THREE from 'three'

import { App } from '../engine/Engine'

export class Environment {
  sunLight!: THREE.DirectionalLight

  readonly debug = App().debug.addFolder(this)

  constructor () {
    this.setSunLight()
    // this.setEnvironmentMap()
  }

  setSunLight () {
    this.sunLight = new THREE.DirectionalLight('#ffffff', 4)
    this.sunLight.castShadow = true
    this.sunLight.shadow.camera.far = 15
    this.sunLight.shadow.mapSize.set(1024, 1024)
    this.sunLight.shadow.normalBias = 0.05
    this.sunLight.position.set(3.5, 2, -1.25)
    App().scene.add(this.sunLight)

    const spotLightHelper = new THREE.DirectionalLightHelper(this.sunLight)
    App().scene.add(spotLightHelper)

    if (this.debug) {
      const sunLightDebug = this.debug.addFolder('Sunlight')
      sunLightDebug
        .add(this.sunLight, 'intensity')
        .name('Intensity')
        .min(0)
        .max(10)
        .step(0.001)

      sunLightDebug
        .add(this.sunLight.position, 'x')
        .name('x')
        .min(-5)
        .max(5)
        .step(0.001)

      sunLightDebug
        .add(this.sunLight.position, 'y')
        .name('y')
        .min(-5)
        .max(5)
        .step(0.001)

      sunLightDebug
        .add(this.sunLight.position, 'z')
        .name('z')
        .min(-5)
        .max(5)
        .step(0.001)
    }
  }

  setEnvironmentMap () {
    //   this.environmentMap = {}
    //   this.environmentMap.intensity = 0.4
    //   this.environmentMap.texture = this.resources.items.environmentMapTexture
    //   this.environmentMap.texture.colorSpace = THREE.SRGBColorSpace
    //
    //   App().scene.environment = this.environmentMap.texture
    //
    //   this.environmentMap.updateMaterials = () => {
    //     App().scene.traverse((child) => {
    //       if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
    //         child.material.envMap = this.environmentMap.texture
    //         child.material.envMapIntensity = this.environmentMap.intensity
    //         child.material.needsUpdate = true
    //       }
    //     })
    //   }
    //   this.environmentMap.updateMaterials()
    //
    //   // Debug
    //   if (this.debug.active) {
    //     this.debugFolder
    //       .add(this.environmentMap, 'intensity')
    //       .name('envMapIntensity')
    //       .min(0)
    //       .max(4)
    //       .step(0.001)
    //       .onChange(this.environmentMap.updateMaterials)
    //   }
  }
}
