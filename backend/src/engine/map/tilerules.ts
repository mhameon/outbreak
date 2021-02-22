/**
 * Experiment to organize Tiles interactions
 *
 * Some tiles are mutually exclusives: they can't lives at the same coords, nor add/set in a WorldMap.
 * Examples:
 * - Block vs. Walkable
 * - Fire vs. Water
 * ==> Exclusive Tiles
 *
 * Some tiles are additive: their "sum" produce something else. Order doesn't matter and produce same result. Generally
 * composed by 2 tiles, but can be more.
 * Examples:
 * - Water + Road = Bridge (same as Road + Water)
 * - Building + Level5 = a high building
 * - Forest + Fire = a burning forest
 * - Forest + Burned = a burned forest
 * - Burned + Iced + Building = a burned building under the snow
 * ==> Additive Tiles
 *
 * Some tiles can live alone, it's the default behaviour.
 * Examples: a Building remains a Building, Water remains Water, etc.
 * ==> Lone Tiles (or simply Tile?)
 *
 * Some tiles must live with another tiles, it has no meaning to be alone at Coords.
 * Examples: Level2, Burned, Block, Walkable
 * ==> Sidekick Tiles
 * Note: Sidekick tiles are not necessary compatible with all tiles (Ex: Burned + Water) and should be declared as exclusive
 *
 * A WorldMap store Tiles at Coords, we want
 * - Disallow add/set exclusive tiles (nor store)
 * - Be able to easily recognize additive tiles and know their result (to render it, not store it)
 */
import { Tile, RenderTile, Tileset } from '@engine/types'
import { SidekickTileLonelyUsageError } from '@engine/map/WorldMapErrors'

type Tilerules = {
  exclusions: Array<Array<Tile>>
  sidekicks: Array<Tile>
  additives: Array<{ and: Array<Tile>; gives: RenderTile }>
}

export const tilerules: Tilerules = {
  exclusions: [
    [ Tile.Walkable, Tile.Block ],
    [ Tile.Fire, Tile.Water ],
    [ Tile.Building, Tile.Water ],
    [ Tile.Burned, Tile.Water ],
    [ Tile.Burned, Tile.Fire ]
  ],
  sidekicks: [
    Tile.Level1, Tile.Level2, Tile.Level3, Tile.Level4, Tile.Level5,
    Tile.Burned
  ],
  additives: [
    { and: [ Tile.Water, Tile.Road ], gives: RenderTile.Bridge },
    { and: [ Tile.Building, Tile.Level1 ], gives: RenderTile.BuildingL1 },
    { and: [ Tile.Building, Tile.Level2 ], gives: RenderTile.BuildingL2 },
    { and: [ Tile.Building, Tile.Level3 ], gives: RenderTile.BuildingL3 },
    { and: [ Tile.Building, Tile.Level4 ], gives: RenderTile.BuildingL4 },
    { and: [ Tile.Building, Tile.Level5 ], gives: RenderTile.BuildingL5 },
  ]
}

/**
 * Returns a sanitized Tileset by removing mutually exclusives tiles.
 * @throws {SidekickTileLonelyUsageError}
 */
export function getSanitizedTileset (tiles: Tile | Tile[], withoutLonelySidekickTile = false): Tileset {
  const tileset: Tileset = new Set(([] as Tile[]).concat(tiles))

  tilerules.exclusions.forEach(excluded => {
    if (excluded.every(tile => tileset.has(tile))) {
      excluded.forEach(tile => tileset.delete(tile))
    }
  })

  const tilesetCopy: Tileset = new Set(...[ tileset ])
  tilerules.additives.forEach(({ and, gives }) => {
    if (and.every(tile => tileset.has(tile))) {
      // gives contains "found" RenderTile
      and.forEach(tile => tilesetCopy.delete(tile))
    }
  })

  if (withoutLonelySidekickTile) {
    tilerules.sidekicks.forEach(sidekick => {
      if (tilesetCopy.has(sidekick)) {
        throw new SidekickTileLonelyUsageError(sidekick, tilesetCopy)
      }
    })
  }

  return tileset
}


