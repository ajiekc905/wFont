export class Image {
  // layers:any[]
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  text: string
  font: string
  size: number
  color: string
  width: number
  height: number
  threshold: number
  cropY0: number
  cropY1: number
  cropX0: number
  cropX1: number

  // angle:
  constructor(size: number = 10, text: string, font: string) {
    // this.greeting = message;
    this.size = size
    this.text = text
    this.font = font
    this.canvas = document.createElement('canvas')
    this.setCanvasSize(size)
    this.draw()
  }
  setSize(size: number) {
    this.size = size
  }
  setThreshold(ts: number) {
    this.threshold = ts
  }
  setFont(font: string) {
    this.font = font
  }
  setText(text: string) {
    this.text = text
  }

  setCanvasSize(size: number) {
    this.size = size
    this.width = Math.floor(this.text.length * size * 0.9)
    this.height = Math.floor(size * 1.2)
    this.canvas.width = this.width
    this.canvas.height = this.height
    this.ctx = this.canvas.getContext('2d')
    // normal, italic, or bold
    let fontStyle = 'bold'
    let font = `${fontStyle} ${this.size}px "${this.font}"`
    this.ctx.font = font
  }
  update(text: string, size: number, font: string, ts: number) {
    if (text) {
      this.text = text
    }
    if (size) {
      this.setCanvasSize(size)
    }
    if (font) {
      this.font = font
      let _font = `${this.size}px "${this.font}"`
      this.ctx.font = _font
    }
    if (ts) {
      this.threshold = ts
    }

    this.width = Math.ceil(this.ctx.measureText(this.text).width)

    this.draw()
  }

  crop(): number {
    function checkImgLine(byte) {
      return byte === 0
    }
    function checkImgX(byte) {
      return byte !== 0
    }

    let imgData = this.ctx.getImageData(0, 0, this.width, this.height)
    // console.log(imgData)
    let y0, y1, x0, x1
    for (let y = 0; y < this.height; y += 1) {
      const startAddr = y * this.width * 4
      const endAddr = startAddr + this.width * 4
      const thisLine = imgData.data.slice(startAddr, endAddr)
      const isEmpty = thisLine.every(checkImgLine)
      let xPos, xPosEnd
      thisLine.forEach((byte, index) => {
        if (byte !== 0) {
          xPos = xPos === undefined ? index >> 2 : xPos
          xPosEnd = index >> 2
        }
      })
      x0 = x0 === undefined ? xPos : x0
      x1 = x1 === undefined ? xPosEnd : x1
      x0 = xPos < x0 ? xPos : x0
      x1 = xPosEnd > x1 ? xPosEnd : x1

      y0 = y0 === undefined && !isEmpty ? y : y0
      y1 = y1 === undefined && !isEmpty ? y : y1
      y1 = y > y1 && !isEmpty ? y : y1
    }
    this.cropY0 = y0
    this.cropY1 = y1
    this.cropX0 = x0
    this.cropX1 = this.width - x1 - 1
    // console.log(`start: ${y0}, end:${y1}`)
    // console.log(`x0: ${x0}   x1: ${this.width - x1}`)

    return y1 - y0
  }
  bip() {
    let imgData = this.ctx.getImageData(0, 0, this.width, this.height)
    for (let i = 0, l = imgData.data.length; i < l; i += 4) {
      imgData.data[i + 3] = imgData.data[i + 3] > this.threshold ? 0xff : 0
    }
    this.ctx.putImageData(imgData, 0, 0)
  }
  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height)
    this.ctx.fillStyle = 'red'
    this.ctx.fillText(this.text, 0, this.size)
    this.bip()
    this.crop()
  }
  getImage() {
    // let width = this.ctx.measureText(this.text).width - this.cropX0- (this.cropX1>>1)
    let width = this.width - this.cropX0 - this.cropX1
    let _canvas = document.createElement('canvas')
    _canvas.width = width
    _canvas.height = this.cropY1 - this.cropY0 + 1
    let _ctx = _canvas.getContext('2d')
    // _ctx.putImageData(this.ctx.getImageData(0, 0, width, this.height), 0, 0)
    _ctx.putImageData(
      this.ctx.getImageData(this.cropX0, this.cropY0, width, this.cropY1),
      0,
      0
    )
    let img = <HTMLImageElement>document.createElement('img')
    img.src = _canvas.toDataURL()
    // console.log(img.src)
    // img.width = this.width
    // img.height = this.height
    return img
  }
  getImageData() {
    return this.ctx.getImageData(0, 0, this.width, this.height)
  }
}
