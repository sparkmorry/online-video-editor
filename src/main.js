import loadWASM from './load_wasm.js';
var wam,
  video,
  gStream,
  frameNum;
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');

function openWebcam() {
  navigator.mediaDevices.getUserMedia({
    video: true
  }).then((stream) => {
    gStream = stream; // 保留MediaStream实例
    video = document.createElement('video');
    video.autoplay = true;
    video.srcObject = stream;
    video.addEventListener("loadeddata", function() {
      canvas.setAttribute('height', video.videoHeight);
      canvas.setAttribute('width', video.videoWidth);
      draw();
    });
  }).catch(function(err) {
    media = 'video';
    console.log(err.name);
  });
}
function stopWebcam() {
  gStream.getTracks().forEach(track => track.stop());
  clearInterval(timer);
}

var lastCalledTime;
var fps = 0;
function draw() {
  if (video.paused) return false;
  context.drawImage(video, 0, 0);
  var pixels = context.getImageData(0, 0, video.videoWidth, video.videoHeight);
  pixels.data.set(wam.grayScale(pixels.data));
  context.putImageData(pixels, 0, 0);
  frameNum = requestAnimationFrame(draw);
  if (!lastCalledTime) {
    lastCalledTime = performance.now();
    fps = 0;
    return;
  }
  let delta = (performance.now() - lastCalledTime) / 1000;
  lastCalledTime = performance.now();
  fps = 1 / delta;
}

function filter() {
  var pixels = context.getImageData(0, 0, video.videoWidth, video.videoHeight);
  pixels.data.set(wam.grayScale(pixels.data));
  context.putImageData(pixels, 0, 0);
}

var frameNumDom = document.getElementById('frameNum');
function showFPS() {
  frameNumDom.innerHTML = parseInt(fps);
}
var timer = setInterval(showFPS, 1000);

// 加载wasm
loadWASM().then(module => {
  wam = module;
});
// 加载摄像头图像
document.getElementById('open').addEventListener('click', openWebcam);
document.getElementById('close').addEventListener('click', stopWebcam);


