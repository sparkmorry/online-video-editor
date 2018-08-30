self.importScripts('ffmpeg.js');

onmessage = function(e) {
  var files = e.data;
  ffmpeg_run({
    arguments: ['-i', './input/' + files[0].name, 'out.mp4'],
    files: files,
  }, function(results) {
    console.log('result', results);
    self.postMessage(results[0].data, [results[0].data]);
  });
  return
}