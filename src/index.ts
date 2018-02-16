import './styles.css'
import { Image } from './image'
import * as JSZip from 'jszip'

interface FormElements extends HTMLCollection {
  text: HTMLInputElement
  size: HTMLInputElement
  threshold: HTMLInputElement
  font: HTMLInputElement
}
let settings = () => {
  return {
    text: document.getElementById('text').value,
    size: document.getElementById('sizeId').value,
    font: document.getElementById('myfont').value,
    threshold: document.getElementById('threshold').value,
    color: document.getElementById('colorId').value,
  }
}

let update = imgObject => {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  const params = settings()

  imgObject.update(
    params.text,
    params.size,
    params.font,
    params.color,
    params.threshold
  )
  document.querySelector('#font-height').textContent = imgObject.crop()
  document.querySelector('input#colorId').value = imgObject.color
  ctx.putImageData(imgObject.getImageData(), 0, 0)
}
let addToPreview = imgObject => {
  let preview = document.querySelector('.preview')
  preview.appendChild(imgObject.getImage())
  return false
}
let makeZip = imgObject => {
  const preview = document.querySelector('.preview')
  const sizes = imgObject.getImageSizes()
  const params = settings()
  const textArr = params.text.split(' ')
  const startIndex = 10

  var zip = new JSZip()
  const imgSizes = imgObject.getImageSizes()
  const fontFolderName =
    params.font.replace(/[^A-Za-z0-9]/g, '_') +
    '_h' +
    imgSizes.height +
    '_t' +
    params.threshold
  const folder = zip.folder(fontFolderName)
  textArr.forEach((textElement, index) => {
    // console.log(textElement)
    const currentImage: Image = new Image(
      textElement,
      params.size,
      params.font,
      params.color,
      params.threshold
    )
    // using vertical crop the same for all images
    currentImage.draw(imgSizes.cropY0, imgSizes.cropY1)
    const htmlImg = currentImage.getImage()
    preview.appendChild(htmlImg)
    const imgBase64Encoded = currentImage.getBase64()
    const imageName = `${index + startIndex}_${textElement}.png`
    folder.file(imageName, imgBase64Encoded, { base64: true })
  })

  zip
    .generateAsync({ type: 'base64', compression: 'STORE' })
    .then(function(base64) {
      location.href = 'data:application/zip;base64,' + base64
    })
}
let clean = () => {
  let preview = document.querySelector('.preview')
  while (preview.firstChild) {
    preview.removeChild(preview.firstChild)
  }
}
let init = () => {
  canvas = <HTMLCanvasElement>document.querySelector('#display')
  canvas.width = 176
  canvas.height = 176
  ctx = canvas.getContext('2d')
  // ctx.transform(1,0.5,-0.5,1,30,10);

  const params = settings()
  let test: Image = new Image(
    params.text,
    params.size,
    params.font,
    params.color,
    params.threshold
  )

  document
    .getElementById('sizeId')
    .addEventListener('change', e => update(test))
  document.getElementById('colorId').addEventListener('blur', e => update(test))
  document.getElementById('text').addEventListener('blur', e => update(test))
  document
    .getElementById('threshold')
    .addEventListener('change', e => update(test))
  document.getElementById('text').addEventListener('change', e => update(test))
  document.getElementById('text').addEventListener('keyup', e => update(test))
  document
    .getElementById('myfont')
    .addEventListener('change', e => update(test))
  document
    .getElementById('plusBtn')
    .addEventListener('click', e => addToPreview(test))
  document.getElementById('cleanBtn').addEventListener('click', e => clean())
  document
    .getElementById('saveBtn')
    .addEventListener('click', e => makeZip(test))

  update(test)
}

var ctx, canvas
init()
