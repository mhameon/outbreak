import { InvalidArgumentError } from '#shared/Errors'

export type HexColor = string
export type Gradient = [ HexColor, HexColor ] | [ HexColor, HexColor, HexColor ]
export type RgbColor = { r: number; g: number; b: number }

export const color = {
  hexToRgb: (hex: HexColor): RgbColor => {
    const rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!rgb) throw new InvalidArgumentError(`${hex} isn't a valid #RRGGBB color`)
    return {
      r: parseInt(rgb[1], 16),
      g: parseInt(rgb[2], 16),
      b: parseInt(rgb[3], 16)
    }
  },

  range: (percent: number, colors: Gradient): RgbColor => {
    let c1 = color.hexToRgb(colors[0])
    let c2 = color.hexToRgb(colors[1])
    let fade = percent

    // 3 colors for the heatmap? Need to adjust them
    if (colors[2]) {
      fade = fade * 2
      if (fade >= 1) {
        fade -= 1
        c1 = c2
        c2 = color.hexToRgb(colors[2])
      }
    }

    return {
      r: Math.floor(c1.r + ((c2.r - c1.r) * fade)),
      g: Math.floor(c1.g + ((c2.g - c1.g) * fade)),
      b: Math.floor(c1.b + ((c2.b - c1.b) * fade)),
    }
  }
} as const
