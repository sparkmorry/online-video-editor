self.importScripts('ffmpeg.js');

onmessage = function(e) {
  // console.log('ffmpeg_run', ffmpeg_run);
  var files = e.data;
  console.log(files);

  ffmpeg_run({
    arguments: ['-i', './input/' + files[0].name, 'out.mp4'],
    files: files,
  }, function(results) {
    console.log('result', results);
    self.postMessage(results[0].data, [results[0].data]);
  });
  return
  ffmpeg_run({
    arguments: ['-i', '/input/' + files[0].name, '-b:v', '64k', '-bufsize', '64k', '-vf', 'showinfo', '-strict', '-2', 'out.mp4'],
    files: files,
  }, function(results) {
    debugger
    console.log('result', results);
    self.postMessage(results[0].data, [results[0].data]);
  });

}