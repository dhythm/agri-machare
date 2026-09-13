/** Browser-side picture handling: shrink files into JPEG data URLs. */

function loadImage(source: File | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url =
      typeof source === 'string' ? source : URL.createObjectURL(source)
    const release = () => {
      if (typeof source !== 'string') URL.revokeObjectURL(url)
    }
    const image = new Image()
    image.onload = () => {
      release()
      resolve(image)
    }
    image.onerror = () => {
      release()
      reject(new Error('画像を読み込めませんでした。'))
    }
    image.src = url
  })
}

function drawScaled(image: HTMLImageElement, maxSide: number, quality: number) {
  const scale = Math.min(1, maxSide / Math.max(image.width, image.height))
  const width = Math.max(1, Math.round(image.width * scale))
  const height = Math.max(1, Math.round(image.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('画像を変換できませんでした。')
  context.drawImage(image, 0, 0, width, height)
  return canvas.toDataURL('image/jpeg', quality)
}

/** Shrink an existing data URL (used when an uploaded picture becomes the thumbnail). */
export async function resizeDataUrl(
  dataUrl: string,
  maxSide: number,
  quality = 0.82,
): Promise<string> {
  return drawScaled(await loadImage(dataUrl), maxSide, quality)
}

/** Scale the file so its longest side is `maxSide` and return a JPEG data URL. */
export async function resizeImage(
  file: File,
  maxSide: number,
  quality = 0.82,
): Promise<string> {
  return drawScaled(await loadImage(file), maxSide, quality)
}
