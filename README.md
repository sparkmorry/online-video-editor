# online-video-editor
一个基于WebAssembly(wasm)的视频在线处理demo，使用Emscripten打包cpp文件成wasm文件提升视频处理效率，通过javascript加载并利用浏览器做一些输入输出操作（如canvas播放、webcam调用等）。前端使用rollup打包工具。
在线地址：https://sparkmorry.github.io/online-video-editor/public/index.html

## Getting started

`npm run build` 打包bundle

`npm start` 服务器[localhost:3000](http://localhost:3000).

`npm run watch` 实时更新调试bundle

`npm run dev` `npm start` + `npm run watch`.

## License

[MIT](LICENSE).
