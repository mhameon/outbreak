import { Material, Mesh, Object3D } from 'three'
import { log } from './common'
import { forEachPropertyOf, isObject } from './object'

const isDisposableTexture = (material: unknown): material is Material => isObject(material) && material instanceof Material && !!material.dispose

/**
 * Try to dispose a Three.js `node`
 */
export function disposeRecursively (node: any) {
  if (!node) return

  if (Array.isArray(node?.children)) {
    node.children.forEach(disposeRecursively)
  }

  if (node?.dispose) {
    log('dispose', node)
    node.dispose()
  } else {
    log(node)
  }

  if (node.geometry) {
    log('  |- dispose', node.geometry)
    node.geometry.dispose()
  }

  if (node.material) {
    const materials: any[] = [].concat(node.material)
    for (const material of materials) {
      log('  |- dispose', material)
      node.material.dispose()
      forEachPropertyOf(node.material, isDisposableTexture, call => call.dispose())
      if (material.uniforms) {
        for (const uniform of Object.values(material.uniforms)) {
          if (uniform) {
            const texture = (uniform as any).value // could be an array?
            if (texture.dispose) {
              log('     |- dispose ', texture)
              texture.dispose()
            }
          }
        }
      }
    }
  }
}
