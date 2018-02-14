import './styles.css'
import { Image } from './image'
import * as JSZip from 'jszip'

interface FormElements extends HTMLCollection {
  text: HTMLInputElement
  size: HTMLInputElement
  threshold: HTMLInputElement
  font: HTMLInputElement
}

let update = function(imgObject) {
  // console.log('update ' + imgObject.text)
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  let myText = <FormData>document.getElementById('text').value
  let mySize = <FormData>document.getElementById('sizeId').value
  let myFont = <FormData>document.getElementById('myfont').value
  let myTS = <FormData>document.getElementById('threshold').value
  let myColor = <FormData>document.querySelector('input#colorId').value
  imgObject.update(myText, mySize, myFont, myTS, myColor)
  myColor = imgObject.color
  ctx.putImageData(imgObject.getImageData(), 0, 0)
}
let addToPreview = function(imgObject) {
  let preview = document.querySelector('.preview')
  preview.appendChild(imgObject.getImage())
  return false
}
let makeZip = imgObject => {
  var zip = new JSZip()
  zip.file('images/example.json', '{}')
  const imgUrlencoded = imgObject.getImageSrc()
  const imgBase64Encoded = imgUrlencoded.split(',')[1]
  zip.file('images/test.png', imgBase64Encoded, { base64: true })
  zip
    .generateAsync({ type: 'base64', compression: 'STORE' })
    .then(function(base64) {
      location.href = 'data:application/zip;base64,' + base64
    })
}
let clean = function() {
  let preview = document.querySelector('.preview')
  while (preview.firstChild) {
    preview.removeChild(preview.firstChild)
  }
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
let showSize = imgObject => {
  console.log(imgObject.getImageSizes())
}
let init = function() {
  canvas = <HTMLCanvasElement>document.querySelector('#display')
  canvas.width = 176
  canvas.height = 176
  ctx = canvas.getContext('2d')
  // ctx.transform(1,0.5,-0.5,1,30,10);

  // ctx.fillRect(0,0,150,75);
  let imgSize = 176
  const params = settings()
  let test: Image = new Image(
    params.size,
    params.text,
    params.font,
    params.color
  )
  test.setThreshold(params.threshold)

  canvas.addEventListener('click', e => update(test))
  document
    .getElementById('sizeId')
    .addEventListener('change', e => update(test))
  document.getElementById('colorId').addEventListener('blur', e => update(test))
  document.getElementById('text').addEventListener('blur', e => update(test))
  document
    .getElementById('threshold')
    .addEventListener('change', e => update(test))
  document.getElementById('text').addEventListener('change', e => update(test))
  document.getElementById('myfont').addEventListener('blur', e => update(test))
  document
    .getElementById('plusBtn')
    .addEventListener('click', e => addToPreview(test))
  document.getElementById('cleanBtn').addEventListener('click', e => clean())
  document
    .getElementById('saveBtn')
    .addEventListener('click', e => makeZip(test))

  document
    .getElementById('sizesBtn')
    .addEventListener('click', e => showSize(test))
  update(test)
}

var ctx, canvas
init()
