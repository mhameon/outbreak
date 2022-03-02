import { Coords, Direction, DirectionClockwise } from '#engine/types'

/**
 * @param origin Coords
 * @param angle in degrees, 0° point to north, clockwise
 * @param distance in number of tiles from origin
 */
export function calculateDestination (origin: Coords, angle: number, distance = 1): Coords {
  const radian = Math.PI / 2 - (angle * Math.PI / 180)
  return {
    x: origin.x + Math.round(distance * Math.cos(radian)),
    y: origin.y - Math.round(distance * Math.sin(radian)),
  }
}

/**
 * @return Angle in degrees (0-360), always > 0
 */
export function calculateAngleInDegrees (origin: Coords, to: Coords): number {
  const angleInRadians = Math.atan2(to.y - origin.y, to.x - origin.x) + 0.5 * Math.PI
  return (angleInRadians >= 0 ? angleInRadians : (2 * Math.PI + angleInRadians)) * 180 / Math.PI
}

export function calculateDirection (origin: Coords, to: Coords): Direction {
  return closestDirection(calculateAngleInDegrees(origin, to))
}

export function closestDirection (degrees: number): Direction {
  const direction = Math.floor(Math.abs(degrees) / 45) + (Math.abs(degrees) % 45 >= 22.5 ? 1 : 0)
  return DirectionClockwise[direction >= 8 ? 0 : direction]
}


// http://members.chello.at/~easyfilter/bresenham.html
function lineWidth (from: Coords, to: Coords, width: number): Array<Coords> {
  width *= .9

  let { x: x0, y: y0 } = from
  const { x: x1, y: y1 } = to

  const pixels = []
  const dx = Math.abs(x1 - x0)
  const sx = x0 < x1 ? 1 : -1
  const dy = Math.abs(y1 - y0)
  const sy = y0 < y1 ? 1 : -1
  let err = dx - dy
  let e2, x2, y2 /* error display e_xy */
  const ed = dx + dy == 0 ? 1 : Math.sqrt(dx * dx + dy * dy)

  const seuil = 96

  for (width = (width + 1) / 2; ;) { /* pixel loop */
    //setPixelColor(x0,y0,Math.max(0,255*(abs(err-dx+dy)/ed-width+1)))
    if (Math.max(0, 255 * (Math.abs(err - dx + dy) / ed - width + 1)) <= seuil) {
      pixels.push({ x: x0, y: y0 })
    }
    e2 = err
    x2 = x0
    if (2 * e2 >= -dx) { /* x step */
      for (e2 += dy, y2 = y0; e2 < ed * width && (y1 != y2 || dx > dy); e2 += dx)
        //setPixelColor(x0, y2 += sy, Math.max(0,255*(abs(e2)/ed-width+1)))
        if (Math.max(0, 255 * (Math.abs(e2) / ed - width + 1)) <= seuil) {
          pixels.push({ x: x0, y: y2 += sy })
        }
      if (x0 == x1) break
      e2 = err
      err -= dy
      x0 += sx
    }
    if (2 * e2 <= dy) { /* y step */
      for (e2 = dx - e2; e2 < ed * width && (x1 != x2 || dx < dy); e2 += dy)
        //setPixelColor(x2 += sx, y0, Math.max(0,255*(abs(e2)/ed-width+1)))
        if (Math.max(0, 255 * (Math.abs(e2) / ed - width + 1)) <= seuil) {
          pixels.push({ x: x2 += sx, y: y0 })
        }
      if (y0 == y1) break
      err += dx
      y0 += sy
    }
  }
  return pixels
}

// http://members.chello.at/~easyfilter/bresenham.html
export function line (from: Coords, to: Coords, width = 1): Array<Coords> {
  if (width > 1) {
    return lineWidth(from, to, width)
  }

  let { x, y } = from
  const { x: x1, y: y1 } = to

  const pixels: Array<Coords> = []

  const dx = Math.abs(x1 - x)
  const dy = -Math.abs(y1 - y)
  const sx = (x < x1) ? 1 : -1
  const sy = (y < y1) ? 1 : -1
  let err = dx + dy

  // eslint-disable-next-line no-constant-condition
  while (true) {
    pixels.push({ x, y })

    if (x === x1 && y === y1) break

    const e2 = 2 * err
    if (e2 >= dy) {
      err += dy
      x += sx
    }
    if (e2 <= dx) {
      err += dx
      y += sy
    }
  }

  return pixels
}
