import './styles.css'
import { Image } from './image'
import JSZip from 'jszip'

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
  imgObject.update(myText, mySize, myFont, myTS)
  ctx.putImageData(imgObject.getImageData(), 0, 0)
}
let addToPreview = function(imgObject) {
  let preview = document.querySelector('.preview')
  preview.appendChild(imgObject.getImage())
  return false
}
let addToZip = () => {
  var zip = new JSZip()
  zip.file('nested/hello.txt', 'Hello World\n')
}
let clean = function() {
  let preview = document.querySelector('.preview')
  while (preview.firstChild) {
    preview.removeChild(preview.firstChild)
  }
}

let init = function() {
  canvas = <HTMLCanvasElement>document.querySelector('#display')
  canvas.width = 176
  canvas.height = 176
  ctx = canvas.getContext('2d')
  // ctx.transform(1,0.5,-0.5,1,30,10);

  // ctx.fillRect(0,0,150,75);
  let imgSize = 176
  let text = document.getElementById('text').value
  let size = document.getElementById('sizeId').value
  let font = document.getElementById('myfont').value
  let th = document.getElementById('threshold').value
  let test: Image = new Image(size, text, font)
  test.setThreshold(th)

  canvas.addEventListener('click', e => update(test))
  document
    .getElementById('sizeId')
    .addEventListener('change', e => update(test))
  document
    .getElementById('threshold')
    .addEventListener('change', e => update(test))
  document.getElementById('text').addEventListener('change', e => update(test))
  document.getElementById('myfont').addEventListener('blur', e => update(test))
  document
    .getElementById('plusBtn')
    .addEventListener('click', e => addToPreview(test))
  document.getElementById('cleanBtn').addEventListener('click', e => clean())
  update(test)
}

var ctx, canvas
init()
