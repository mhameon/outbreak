import * as THREE from 'three'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { GroundProjectedSkybox } from 'three/examples/jsm/objects/GroundProjectedSkybox.js'
import { Core } from '../engine/Core'
import { disposeRecursively } from 'game/engine/utils/dispose'

export class Environment extends Core {
  sunLight!: THREE.DirectionalLight
  // skybox?: GroundProjectedSkybox
  // skyboxTexture?: THREE.DataTexture

  constructor () {
    super()

    const fog = new THREE.Fog('#262837', 1, 300)
    this.scene.fog = fog
    this.scene.background = new THREE.Color('#262837')

    this.setSunLight()
    // this.setEnvironmentMap()

    // const rgbeLoader = new RGBELoader()
    // rgbeLoader.load('game/environmentMaps/canary_wharf_1k.hdr', (texture) => {
    //   this.skyboxTexture = texture
    //   this.skyboxTexture.mapping = THREE.EquirectangularReflectionMapping
    //
    //   // this.scene.environment = texture // used to simulate lightning
    //   // this.scene.background = texture // display skybox
    //   // this.scene.backgroundBlurriness = 0
    //   // this.debug?.add(this.scene, 'backgroundBlurriness').min(0).max(1).step(.001)
    //   // this.scene.backgroundIntensity = 1
    //   // this.debug?.add(this.scene, 'backgroundIntensity').min(0).max(10).step(.001)
    //
    //   this.skybox = new GroundProjectedSkybox(this.skyboxTexture)
    //   this.skybox.scale.setScalar(40)
    //   this.scene.add(this.skybox)
    // })
  }

  setSunLight () {
    this.sunLight = new THREE.DirectionalLight('#ffffff', 4)
    this.sunLight.castShadow = true
    this.sunLight.shadow.camera.far = 15
    this.sunLight.shadow.mapSize.set(1024, 1024)
    this.sunLight.shadow.normalBias = 0.05
    this.sunLight.position.set(3.5, 2, -1.25)
    this.scene.add(this.sunLight)

    // const spotLightHelper = new THREE.DirectionalLightHelper(this.sunLight)
    // this.scene.add(spotLightHelper)

    if (this.debug) {
      const sunLightDebug = this.debug.addFolder('Sunlight')
      sunLightDebug
        ?.add(this.sunLight, 'intensity')
        .name('Intensity')
        .min(0)
        .max(10)
        .step(0.001)

      sunLightDebug
        ?.add(this.sunLight.position, 'x')
        .name('x')
        .min(-5)
        .max(5)
        .step(0.001)

      sunLightDebug
        ?.add(this.sunLight.position, 'y')
        .name('y')
        .min(-5)
        .max(5)
        .step(0.001)

      sunLightDebug
        ?.add(this.sunLight.position, 'z')
        .name('z')
        .min(-5)
        .max(5)
        .step(0.001)
    }
  }

  destroy () {
    // disposeRecursively(this.skybox)
    // this.skyboxTexture?.dispose()
  }

  setEnvironmentMap () {
    //   this.environmentMap = {}
    //   this.environmentMap.intensity = 0.4
    //   this.environmentMap.texture = this.resources.items.environmentMapTexture
    //   this.environmentMap.texture.colorSpace = THREE.SRGBColorSpace
    //
    //   this.#scene.environment = this.environmentMap.texture
    //
    //   this.environmentMap.updateMaterials = () => {
    //     this.#scene.traverse((child) => {
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
