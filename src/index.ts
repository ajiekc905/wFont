import './styles.css'
import { Image } from './image'
import { settings } from './settings'
import { makeZip } from './save'
enum TypeAlign {
  Original = 1,
  Left,
  Center,
  Right,
}

interface FormElements extends HTMLCollection {
  text: HTMLInputElement
  size: HTMLInputElement
  threshold: HTMLInputElement
  font: HTMLInputElement
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

  sizeId.addEventListener('change', e => update(test))
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
  document.getElementById('saveBtn').addEventListener('click', e => {
    let tickAlignBtn = document.querySelector('input[name="alignBtn"]:checked')
      .value
    makeZip(test, tickAlignBtn)
  })

  minusSizeBtn.addEventListener('click', e => {
    sizeId.stepDown()
    document.getElementById('sizeShow').innerText = sizeId.value
    update(test)
  })
  plusSizeBtn.addEventListener('click', e => {
    sizeId.stepUp()
    document.getElementById('sizeShow').innerText = sizeId.value
    update(test)
  })
  update(test)
}

var ctx, canvas
let justShowIt = document.getElementById('justShowIt')
let tickTheSameWidth = document.getElementById('tickTheSameWidth')
let minusSizeBtn = document.getElementById('minusSizeBtn')
let plusSizeBtn = document.getElementById('plusSizeBtn')

let sizeId = document.getElementById('sizeId')
init()
