export default {
  name: 'phone',
  mounted: handle,
};

function handle(el) {
  el.onkeypress = (event) => {
    return (/[\d]/.test(String.fromCharCode(event.keyCode || event.which))) || event.which === 8;
  };
  let $inp = findEle(el, 'input')
  el.$inp = $inp
  $inp.handle = function () {
    let val = $inp.value
    $inp.value = val.replace(/[^\d]/g, '').toString().substring(0, 11)
    trigger($inp, 'input')
  }
  $inp.addEventListener('keyup', $inp.handle)
}

let findEle = (parent, type) => {
  return parent.tagName.toLowerCase() === type ? parent : parent.querySelector(type)
}

const trigger = (el, type) => {
  const e = document.createEvent('HTMLEvents')
  e.initEvent(type, true, true)
  setTimeout(() => {
    el.dispatchEvent(e)
  }, 10)
}