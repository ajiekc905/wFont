import { isUndefined, isDate } from 'util'

enum TypeAlign {
  Original = 1,
  Left,
  Center,
  Right,
}
export class Image {
  // layers:any[]
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  text: string
  font: string
  fontFile: string
  size: number
  color: string
  width: number
  height: number
  threshold: number
  cropY0: number
  cropY1: number
  cropX0: number
  cropX1: number
  cropCurrentX0: number // real crop marks for this symbol. Used for Alignment purposes
  cropCurrentX1: number
  align: string

  // angle:
  constructor(
    text: string,
    size: number = 10,
    font: string,
    color: string,
    threshold: number = 220,
    align: string = 'Original'
  ) {
    // this.greeting = message;
    this.color = color
    this.size = size
    this.text = text
    this.font = font
    this.threshold = threshold
    this.align = align
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

  setCanvasWidth(width: number) {
    this.width = width
    this.canvas.width = width
    this.ctx = this.canvas.getContext('2d')
  }
  setCanvasSize(size: number) {
    this.size = size
    this.width = Math.floor(this.text.length * size )
    this.height = Math.floor(size * 1.2)
    this.canvas.width = this.width
    this.canvas.height = this.height
    this.ctx = this.canvas.getContext('2d')
    // normal, italic, or bold
    let fontStyle = 'bold'
    let font = `${fontStyle} ${this.size}px "${this.font}"`
    this.ctx.font = font
  }
  update(text: string, size: number, font: string, color?: string, ts: number) {
    let hex = (value: number) => ('0' + value.toString(16)).slice(-2)
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
    if (color) {
      let red = parseInt(color.slice(1, 3), 16)
      let green = parseInt(color.slice(3, 5), 16)
      let blue = parseInt(color.slice(5, 7), 16)
      const _threshold = 0x50
      red = red < _threshold ? 0 : 0xff
      green = green < _threshold ? 0 : 0xff
      blue = blue < _threshold ? 0 : 0xff
      const hexColor = '#' + hex(red) + hex(green) + hex(blue)
      // console.log(hexColor)
      this.color = hexColor
      // this.color = `rgb(${red},${green},${blue})`
    }

    this.width = Math.ceil(this.ctx.measureText(this.text).width)

    this.draw()
  }

  crop(_y0?: number, _y1?: number, _x0?: number, _x1?: number): number {
    if (
      _y0 !== undefined &&
      _y1 !== undefined &&
      _x0 !== undefined &&
      _x1 !== undefined
    ) {
      // this.cropY0 = _y0
      // this.cropY1 = _y1
      this.cropX0 = _x0
      this.cropX1 = _x1
      // if _x0 and _x1 defined, align type should be used
    }

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
      //
      y0 = y0 === undefined && !isEmpty ? y : y0
      y1 = y1 === undefined && !isEmpty ? y : y1
      y1 = y > y1 && !isEmpty ? y : y1
    }
    this.cropY0 = _y0 === undefined ? y0 : _y0
    this.cropY1 = _y1 === undefined ? y1 : _y1

    this.cropCurrentX0 = x0
    this.cropCurrentX1 = this.width - x1 - 1

    // this.cropCurrentX0 - crop for current symbol
    // _x0 crop mark for the all set, defines usually wider area
    const realWidth = this.width - this.cropCurrentX0 - this.cropCurrentX1 + 1
    const definedWidth = this.width - _x0 - _x1 + 1
    const freeSpace = definedWidth - realWidth + 1
    console.log(
      `realwidth:${realWidth}, defined:${definedWidth}, space:${freeSpace}`
    )

    if (_x1) {
      switch (this.align) {
        case 'Right':
          // console.log('right align')
          this.cropX0 = this.cropCurrentX0 - freeSpace
          this.cropX1 = this.cropCurrentX1

          break
        case 'Center':
          // console.log('center align')
          const halfSpace = freeSpace >> 1
          this.cropX0 = this.cropCurrentX0 - halfSpace
          this.cropX1 = this.cropCurrentX1 - halfSpace
          break
        case 'Left':
          console.log('left align')
          this.cropX0 = this.cropCurrentX0
          this.cropX1 = this.cropCurrentX1 - freeSpace
          // this.cropX0 = this.cropCurrentX0
          // this.cropX1 = this.cropCurrentX1
          break
        default:
          // console.log('original align')
          this.cropX0 = _x0
          this.cropX1 = _x1
          break
      }
    } else {
      this.cropX0 = this.cropCurrentX0
      this.cropX1 = this.cropCurrentX1
    }
    return y1 - y0 + 1
  }
  bip() {
    const setYellow = x => {
      imgData.data[x + 0] = 0xff // yellow opaque
      imgData.data[x + 1] = 0xff
      imgData.data[x + 2] = 0
      imgData.data[x + 3] = 0xff
    }
    const setCyan = x => {
      imgData.data[x + 0] = 0
      imgData.data[x + 1] = 0xff // cyan
      imgData.data[x + 2] = 0xff
      imgData.data[x + 3] = 0xff
    }

    let imgData = this.ctx.getImageData(0, 0, this.width, this.height)
    const width = this.width
    for (let i = 0, l = imgData.data.length; i < l; i += 4) {
      const tsp = imgData.data[i + 3]
      if (tsp < this.threshold && tsp > this.threshold >> 1) {
        const _before_x = i - 4 //prew pixel
        const _after_x = i + 4
        if (_after_x !== width && imgData.data[_after_x + 3] === 0) {
          setYellow(i)
        } else if (_after_x >= width) {
          setYellow(i)
        }
        if (_before_x !== 0 && imgData.data[_before_x + 3] === 0) {
          setCyan(i)
        } else if (_before_x < 0) {
          setCyan(i)
        }
      }
      imgData.data[i + 3] = imgData.data[i + 3] > this.threshold ? 0xff : 0
    }
    this.ctx.putImageData(imgData, 0, 0)
  }
  draw(_y0?: number, _y1?: number, _x0?: number, _x1?: number) {
    // import opentype from {'opentype'}
    // opentype.load

    this.ctx.clearRect(0, 0, this.width, this.height)
    // console.log(this.text)
    this.ctx.fillStyle = this.color
    let _font = `${this.size}px "${this.font}"`
    this.ctx.font = _font
    this.ctx.fillText(this.text, 0, this.size)
    this.bip()
    if (_y0 !== undefined && _y1 !== undefined) {
      if (_x0 !== undefined && _x1 !== undefined) {
        // console.log('width cropped for all the same')
        this.crop(_y0, _y1, _x0, _x1)
      } else {
        // console.log('width cropped for all differently')
        this.crop(_y0, _y1)
      }
    } else {
      this.crop()
    }
  }
  getImageSizes() {
    let width = this.width - this.cropX0 - this.cropX1
    let height = this.cropY1 - this.cropY0 + 1

    return {
      width: width,
      height: height,
      cropY0: this.cropY0,
      cropY1: this.cropY1,
    }
  }
  // getImageSrc(cropY0:number, cropY1:number)
  getImageSrc() {
    // console.log(
    //   `${this.text}: width ${this.width}, width2 ${this.width -
    //     this.cropX0 -
    //     this.cropX1}`
    // )
    let width = this.width - this.cropX0 - this.cropX1
    let _canvas = document.createElement('canvas')
    _canvas.width = width
    _canvas.height = this.cropY1 - this.cropY0 + 1
    _canvas.height = _canvas.height === 0 ? 1 : _canvas.height
    let _ctx = _canvas.getContext('2d')
    if (width) {
      _ctx.putImageData(
        this.ctx.getImageData(this.cropX0, this.cropY0, width, this.cropY1),
        0,
        0
      )
    }
    return _canvas.toDataURL()
  }

  getBase64(): string {
    const imgUrlencoded = this.getImageSrc()
    const imgBase64Encoded = imgUrlencoded.split(',')[1]
    return imgBase64Encoded
  }
  getImage() {
    let img = <HTMLImageElement>document.createElement('img')
    // img.src = this.canvas.toDataURL()
    img.src = this.getImageSrc()
    return img
  }
  getImageData() {
    return this.ctx.getImageData(0, 0, this.width, this.height)
  }
}
