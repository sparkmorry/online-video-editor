self.importScripts('ffmpegx265.js');

onmessage = function(e) {
  // console.log('ffmpeg_run', ffmpeg_run);
  var files = e.data;
  console.log(files);

  // ffmpeg -i input -c:v libx265 -crf 28 -c:a aac -b:a 128k output.mp4
  // arguments: ['-i', './input/' + files[0].name, '-c:v', 'libx265', '-crf', '28', '-c:a', 'aac', '-b:a', '128k', 'out.mp4'],
  ffmpeg_run({
    arguments: ['-i', './input/' + files[0].name, '-r', '1', '-f', 'image2', 'image-%05d.jpeg'],
    files: files,
  }, function(results) {
    console.log('result', results);
    self.postMessage(results);
  });
}