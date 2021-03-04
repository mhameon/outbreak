import { Tile, Tiles, RenderTile, Tileset } from '@engine/types'
import { UnknownRenderTile } from '@engine/map/WorldMapErrors'
import { toTiles, toTileset } from '@engine/map/helpers'

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
 *       and should be declared as exclusive
 *
 * "Classical" Tiles and Sideckicks can be "merged" to produce a `RenderTile`.
 * Examples:
 * - Water + Road = Bridge (same as Road + Water)
 * - Building + Level5 = a high building
 * - Forest + Fire = a burning forest
 * - Forest + Burned = a burned forest
 * - Burned + Iced + Building = a burned building under the snow
 * Order doesn't matter and produce the same result. Generally composed by 2 tiles, but can be more.
 * ==> We call them "Rendering"
 */

type Tilerules = {
  exclusions: Array<Array<Tile>>
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
  sidekicks: [
    Tile.Level1, Tile.Level2, Tile.Level3, Tile.Level4, Tile.Level5,
    Tile.Burning,
    Tile.Burned,
    //Tile.Block, Tile.Walkable
  ],
  rendering: [
    // Must be declared descending
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
    { and: [ Tile.Water, Tile.Road ], gives: RenderTile.Bridge },
    { and: [ Tile.Building, Tile.Level1 ], gives: RenderTile.BuildingL1 },
    { and: [ Tile.Building, Tile.Level2 ], gives: RenderTile.BuildingL2 },
    { and: [ Tile.Building, Tile.Level3 ], gives: RenderTile.BuildingL3 },
    { and: [ Tile.Building, Tile.Level4 ], gives: RenderTile.BuildingL4 },
    { and: [ Tile.Building, Tile.Level5 ], gives: RenderTile.BuildingL5 },
    { and: [ Tile.Burning, Tile.Grass ], gives: RenderTile.BurningGrass },
    { and: [ Tile.Burning, Tile.Walkable ], gives: RenderTile.BurningGrass }, // default
    { and: [ Tile.Burning, Tile.Forest ], gives: RenderTile.BurningForest },
    { and: [ Tile.Burning, Tile.Road ], gives: RenderTile.BurningRoad },
    { and: [ Tile.Burned, Tile.Grass ], gives: RenderTile.BurnedGrass },
    { and: [ Tile.Burned, Tile.Forest ], gives: RenderTile.BurnedForest },
    { and: [ Tile.Burned, Tile.Road ], gives: RenderTile.BurnedRoad },
  ]
}

/**
 * Returns a sanitized Tileset by removing mutually exclusives tiles.
 * When `removeOrphanSidekickTiles` is true, the function sanitize lone sideckick tiles too.
 */
export function getSanitizedTileset (tiles: Tiles | Tileset, removeOrphanSidekickTiles = false): Tileset {
  const tileset = toTileset(tiles)
  tilerules.exclusions.forEach(excluded => {
    if (excluded.every(tile => tileset.has(tile))) {
      excluded.forEach(tile => tileset.delete(tile))
    }
  })
  if (removeOrphanSidekickTiles) {
    const tilesetCopy: Tileset = new Set(...[ tileset ])
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

/**
 * Compute tiles rules to find the `RenderTile` matching with `tiles` argument
 * @throws UnknownRenderTile when no `RenderTile` is found
 */
export function getRenderTile (tiles: Tiles): RenderTile {
  const tilesArray = toTiles(tiles)
  const found = tilerules.rendering.find(({ and }) => and.every(tile => tilesArray.includes(tile)))
  if (found) {
    return found.gives
  }
  if (tilesArray.length === 1) {
    // Don't know how to type "enum keys", `any` does the trick...
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tileName: any = Tile[tilesArray[0]]
    if (RenderTile[tileName] !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return RenderTile[tileName] as any
    }
  }
  throw new UnknownRenderTile(tilesArray)
}
