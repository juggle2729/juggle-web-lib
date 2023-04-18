/**
 * 下载图片到本地
 * @param {*} src
 * @param {*} name
 */
 export function downloadImg(src, name) {
  const image = new Image();
  // 解决跨域 Canvas 污染问题
  image.setAttribute('crossOrigin', 'anonymous');
  image.onload = function () {
    var canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    var context = canvas.getContext('2d');
    context.drawImage(image, 0, 0, image.width, image.height);
    var url = canvas.toDataURL(); //得到图片的base64编码数据
    console.log(url);

    var a = document.createElement('a'); // 生成一个a元素
    var event = new MouseEvent('click'); // 创建一个单击事件
    a.download = name || 'photo'; // 设置图片名称
    a.href = url; // 将生成的URL设置为a.href属性
    a.dispatchEvent(event); // 触发a的单击事件
  };
  image.src = src;
}

function iframeLoad(iframe) {
  var src = (iframe.src) ? iframe.src : iframe.contentWindow.location.href;
  // document.body.appendChild(document.createElement("br"));
  // document.body.appendChild(document.createTextNode("IFAME 标记 src 值为 "+ src + " 的 onload 事件触发"));
}

function addEvent(eventName, element, fn) {
  if (element.attachEvent) element.attachEvent("on" + eventName, fn);
  else element.addEventListener(eventName, fn, false);
}
export function download(url) { 
  //获得id为downLoadListFrame的frame
  var divFrame = window.parent.document.getElementById("downLoadListFrame")
  //判断是否存在，如果存在先移除，再重新创建
  if (divFrame != null) {
    window.parent.document.body.removeChild(divFrame)
  }
  //重新创建
  var iframe = document.createElement('iframe');
  iframe.setAttribute("id", "downLoadListFrame");
  addEvent("load", iframe, function () {
    iframeLoad(iframe)
  });
  iframe.src = url
  // iframe.src= "about:blank";
  document.body.appendChild(iframe);
  setTimeout(function () {
    iframe.src = '';
    iframe.parentNode.removeChild(iframe);
  }, 5000)
}