export let settings = () => {
  return {
    text: document.getElementById('text').value,
    size: document.getElementById('sizeId').value,
    font: document.getElementById('myfont').value,
    threshold: document.getElementById('threshold').value,
    color: document.getElementById('colorId').value,
  }
}
