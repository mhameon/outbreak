import { Tile, RenderTile, Tileset } from '#engine/types'
import { UnknownRenderTile } from '#engine/map/WorldMapErrors'
import { toSet, toArray, deleteInSet } from '#shared/helpers'
import { OneOrMany } from '#shared/types'

/**
 * Tiles Rules
 *
 * Most of the tiles can live alone.
 * Examples: Building, Water, Forest...
 * ==> We call them simply "Tile"
 *
 * Some tiles are mutually exclusives: they can't lives at the same coords, nor add/set in a WorldMap.
 * Examples:
 * - Block vs. Walkable
 * - Burning vs. Water
 * ==> We call them "Exclusions"
 *
 * Some tiles must live with another tile(s), it's a nonsense to use them alone.
 * Examples: Level2, Burned, Block, Walkable
 * ==> We call them "Sidekick"
 *
 * Note: Sidekick tiles are not necessary compatible with all tiles (Ex: Burning + Water)
 *       and should be declared in Exclusions
 *
 * "Classical" Tiles and Sidekicks can be "merged" to produce a `RenderTile`.
 * Examples:
 * - Water + Road = Bridge
 * - Building + Level5 = a high building
 * - Forest + Fire = a burning forest (flaming)
 * - Forest + Burned = a burned forest (ashes)
 * - Burned + Iced + Building = a burned building under the snow
 * Order doesn't matter and produce the same result. Generally composed by 2 tiles, but can be more.
 * ==> We call them "Rendering"
 */

type Tilerules = {
  exclusions: Array<Array<Tile>>
  properties: Array<Tile>
  sidekicks: Array<Tile>
  rendering: Array<{ and: Array<Tile>; gives: RenderTile }>
}

export const tilerules: Tilerules = {
  exclusions: [
    // Must be declared descending
    [ Tile.Walkable, Tile.Block ],
    [ Tile.Building, Tile.Water ],
    [ Tile.Burning, Tile.Water ],
    [ Tile.Burned, Tile.Water ],
    [ Tile.Burned, Tile.Burning ]
  ],
  properties: [
    Tile.Block,
    Tile.TemporaryBlock,
    Tile.Walkable
  ],
  sidekicks: [
    Tile.Level1, Tile.Level2, Tile.Level3, Tile.Level4, Tile.Level5,
    Tile.Burning,
    Tile.Burned,
  ],
  rendering: [
    // Must be declared descending
    // { and: [ Tile.Road, Tile.Grass ], gives: RenderTile.Road },
    // { and: [ Tile.Road, Tile.Building ], gives: RenderTile.Road },

    { and: [ Tile.Burning, Tile.Building, Tile.Level1 ], gives: RenderTile.BurningBuildingL1 },
    { and: [ Tile.Burning, Tile.Building, Tile.Level2 ], gives: RenderTile.BurningBuildingL2 },
    { and: [ Tile.Burning, Tile.Building, Tile.Level3 ], gives: RenderTile.BurningBuildingL3 },
    { and: [ Tile.Burning, Tile.Building, Tile.Level4 ], gives: RenderTile.BurningBuildingL4 },
    { and: [ Tile.Burning, Tile.Building, Tile.Level5 ], gives: RenderTile.BurningBuildingL5 },
    { and: [ Tile.Burned, Tile.Building, Tile.Level1 ], gives: RenderTile.BurnedBuildingL1 },
    { and: [ Tile.Burned, Tile.Building, Tile.Level2 ], gives: RenderTile.BurnedBuildingL2 },
    { and: [ Tile.Burned, Tile.Building, Tile.Level3 ], gives: RenderTile.BurnedBuildingL3 },
    { and: [ Tile.Burned, Tile.Building, Tile.Level4 ], gives: RenderTile.BurnedBuildingL4 },
    { and: [ Tile.Burned, Tile.Building, Tile.Level5 ], gives: RenderTile.BurnedBuildingL5 },
    // ---
    { and: [ Tile.Water, Tile.Road ], gives: RenderTile.Bridge },
    { and: [ Tile.Building, Tile.Level1 ], gives: RenderTile.BuildingL1 },
    { and: [ Tile.Building, Tile.Level2 ], gives: RenderTile.BuildingL2 },
    { and: [ Tile.Building, Tile.Level3 ], gives: RenderTile.BuildingL3 },
    { and: [ Tile.Building, Tile.Level4 ], gives: RenderTile.BuildingL4 },
    { and: [ Tile.Building, Tile.Level5 ], gives: RenderTile.BuildingL5 },
    { and: [ Tile.Burning, Tile.Grass ], gives: RenderTile.BurningGrass },
    //{ and: [ Tile.Burning, Tile.Walkable ], gives: RenderTile.BurningGrass }, // default
    { and: [ Tile.Burning, Tile.Forest ], gives: RenderTile.BurningForest },
    { and: [ Tile.Burning, Tile.Road ], gives: RenderTile.BurningRoad },
    { and: [ Tile.Burned, Tile.Grass ], gives: RenderTile.BurnedGrass },
    { and: [ Tile.Burned, Tile.Forest ], gives: RenderTile.BurnedForest },
    { and: [ Tile.Burned, Tile.Road ], gives: RenderTile.BurnedRoad },
  ]
}

// Experiment. tilerules.renderings alternative (but write the parser is pain in the ass right now)
// type Renderable = { with: Tile; gives: RenderTile; and?: Array<Renderable> }
// type RenderingV2 = Array<[ Tile, Array<Renderable> ]>
// export const renderingV2: RenderingV2 = [
//   [
//     Tile.Water, [
//       { with: Tile.Road, gives: RenderTile.Bridge }]
//   ],
//   [
//     Tile.Burning, [
//       { with: Tile.Walkable, gives: RenderTile.BurningGrass },
//       { with: Tile.Grass, gives: RenderTile.BurnedGrass },
//       { with: Tile.Forest, gives: RenderTile.BurningForest },
//       { with: Tile.Road, gives: RenderTile.BurningRoad }]
//   ],
//   [
//     Tile.Building, [{
//       with: Tile.Level1, gives: RenderTile.BuildingL1, and: [
//         { with: Tile.Burning, gives: RenderTile.BurningBuildingL1 },
//         { with: Tile.Burned, gives: RenderTile.BurnedBuildingL1 }
//       ],
//     }, {
//       with: Tile.Level2, gives: RenderTile.BuildingL2, and: [
//         { with: Tile.Burning, gives: RenderTile.BurningBuildingL2 },
//         { with: Tile.Burned, gives: RenderTile.BurnedBuildingL2 }
//       ],
//     }, {
//       with: Tile.Level3, gives: RenderTile.BuildingL3, and: [
//         { with: Tile.Burning, gives: RenderTile.BurningBuildingL3 },
//         { with: Tile.Burned, gives: RenderTile.BurnedBuildingL3 }
//       ],
//     }, {
//       with: Tile.Level4, gives: RenderTile.BuildingL4, and: [
//         { with: Tile.Burning, gives: RenderTile.BurningBuildingL4 },
//         { with: Tile.Burned, gives: RenderTile.BurnedBuildingL4 }
//       ],
//     }, {
//       with: Tile.Level5, gives: RenderTile.BuildingL5, and: [
//         { with: Tile.Burning, gives: RenderTile.BurningBuildingL5 },
//         { with: Tile.Burned, gives: RenderTile.BurnedBuildingL5 }
//       ],
//     }]
//   ],
// ]


/**
 * Returns a sanitized Tileset by removing mutually exclusives tiles.
 * When `removeOrphanSidekickTiles` is true, the function sanitize lone sidekick tiles too.
 */
export function getSanitizedTileset (tiles: OneOrMany<Tile>, removeOrphanSidekickTiles = false): Tileset {
  const tileset = toSet<Tile>(tiles)
  tilerules.exclusions.forEach(excluded => {
    if (excluded.every(tile => tileset.has(tile))) {
      excluded.forEach(tile => tileset.delete(tile))
    }
  })
  if (removeOrphanSidekickTiles) {
    const tilesetCopy = new Set(tileset)
    tilerules.rendering.forEach(({ and }) => {
      if (and.every(tile => tileset.has(tile))) {
        // `gives` key contains the found RenderTile
        and.forEach(tile => tilesetCopy.delete(tile))
      }
    })
    tilerules.sidekicks.forEach(sidekick => {
      if (tilesetCopy.has(sidekick)) {
        tileset.delete(sidekick)
      }
    })
  }

  return tileset
}

export function addSanitizedTileset (tiles: OneOrMany<Tile>, toExisting: OneOrMany<Tile>): Tileset {
  const tileset = toSet<Tile>(tiles)
  const existing = toSet<Tile>(toExisting)
  tilerules.exclusions.forEach(excluded => {
    if (excluded.every(tile => tileset.has(tile))) {
      excluded.forEach(tile => tileset.delete(tile))
    }
  })
  existing.forEach(exists => {
    if (tileset.has(exists)) {
      tileset.delete(exists)
    }
  })

  const unusedTiles = new Set(tileset)
  tilerules.rendering.forEach(({ and }) => {
    if (and.every(tile => tileset.has(tile))) {
      and.forEach(tile => unusedTiles.delete(tile))
    }
  })

  tilerules.sidekicks.forEach(sidekick => {
    if (!unusedTiles.has(sidekick)) {
      unusedTiles.delete(sidekick)
    }
  })

  return deleteInSet<Tileset>(tileset, unusedTiles)
}

/**
 * Compute tiles rules to find the `RenderTile` matching with `tiles` argument
 * @throws UnknownRenderTile when no `RenderTile` is found
 */
export function getRenderTile (tiles: OneOrMany<Tile>): RenderTile {
  const tilesArray = toArray<Tile>(tiles).filter(tile => !tilerules.properties.includes(tile))

  // There is a standalone Tile corresponding to a RenderTile ?
  if (tilesArray.length === 1) {
    const tileName = Tile[tilesArray[0]] as unknown as number
    if (RenderTile[tileName] !== undefined) {
      return RenderTile[tileName] as unknown as RenderTile
    }
  }

  // There is a RenderTile corresponding to a `tilerules.rendering` definition ?
  const found = tilerules.rendering.find(({ and }) => and.every(tile => tilesArray.includes(tile)))
  if (found) {
    return found.gives
  }

  throw new UnknownRenderTile(tilesArray)
}
