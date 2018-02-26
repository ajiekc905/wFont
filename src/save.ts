import * as JSZip from 'jszip'
import { Image } from './image'
import { settings } from './settings'

export let makeZip = (imgObject, align) => {
  const preview = document.querySelector('.preview')
  const sizes = imgObject.getImageSizes()
  const params = settings()
  const textArr = params.text.split(' ')
  const startIndex = 10

  const reducer = (accumulator, currentValue) => {
    const currentImage: Image = new Image(
      currentValue,
      params.size,
      params.font,
      params.color,
      params.threshold
    )
    currentImage.draw()
    const returnX0 = Math.min(accumulator.x0, currentImage.cropX0)
    const returnX1 = Math.min(accumulator.x1, currentImage.cropX1)
    const returnWidth = Math.max(
      accumulator.width,
      currentImage.width -
        currentImage.cropCurrentX0 -
        currentImage.cropCurrentX1 +
        1
    )
    return { x0: returnX0, x1: returnX1, width: returnWidth }
  }
  var zip = new JSZip()
  const myForm = document.getElementById('myForm')
  // const align = myForm.elements.namedItem('alignBtn').value
  console.log(align)

  const imgSizes = imgObject.getImageSizes()
  const fontFolderName =
    params.font.replace(/[^A-Za-z0-9]/g, '_') +
    '_h' +
    imgSizes.height +
    '_t' +
    params.threshold
  const folder = zip.folder(fontFolderName)

  var monoWidth = tickTheSameWidth.checked
  let cropping
  if (monoWidth) {
    cropping = textArr.reduce(reducer, {
      x0: sizes.width,
      x1: sizes.width,
      width: 0,
    })
    // cropping.width = cropping.x1 - cropping.x0 + 1
    console.log(cropping)
  }
  textArr.forEach((textElement, index) => {
    // console.log(textElement)
    const currentImage: Image = new Image(
      textElement,
      params.size,
      params.font,
      params.color,
      params.threshold,
      align
    )
    // using vertical crop the same for all images
    if (monoWidth) {
      currentImage.setCanvasWidth(cropping.x0 + cropping.x1 + cropping.width)
      currentImage.draw(
        imgSizes.cropY0,
        imgSizes.cropY1,
        cropping.x0,
        cropping.x1
      )
    } else {
      currentImage.draw(imgSizes.cropY0, imgSizes.cropY1)
    }
    const htmlImg = currentImage.getImage()
    preview.appendChild(htmlImg)
    const imgBase64Encoded = currentImage.getBase64()
    const imageName = `${index + startIndex}.png`
    folder.file(imageName, imgBase64Encoded, { base64: true })
  })

  if (justShowIt.checked === false) {
    zip
      .generateAsync({ type: 'base64', compression: 'STORE' })
      .then(function(base64) {
        location.href = 'data:application/zip;base64,' + base64
      })
  }
}
