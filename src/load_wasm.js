var Module = {};
var script;
//to bind arguments in the right order
function bindLastArgs(func, ...boundArgs) {
  return function(...baseArgs) {
    return func(...baseArgs, ...boundArgs);
  }
}

export default function loadWASM() {
  return new Promise((resolve, reject) => {
    self.fetch('./webdsp_c.wasm')
      .then(response => response.arrayBuffer())
      .then(buffer => {
        Module.wasmBinary = buffer;
        // GLOBAL -- create custom event for complete glue script execution
        // Emscripten编译的函数如_grayScale，_malloc等会挂到全局环境下
        var script = document.createElement('script');
        script.onload = buildWam;
        // END GLOBAL
        script.src = './webdsp_c.js';
        document.body.appendChild(script);

        // 构建wam模块
        function buildWam() {
          console.log('Emscripten boilerplate loaded.');
          const wam = {};

          // filters
          wam['grayScale'] = function(pixelData) {
            // 获取像素数组长度
            const len = pixelData.length;
            // 开辟一块内存，返回地址
            const mem = _malloc(len);
            // 把像素数据放入这块内存mem
            HEAPU8.set(pixelData, mem);
            // 处理像素，源数据
            _grayScale(mem, len);
            // 从heap中拿出mem～mem+len（起始指针到位移len的数据）
            const filtered = HEAPU8.subarray(mem, mem + len);
            // 释放内存
            _free(mem);
            return filtered;
          };
          wam['brighten'] = function(pixelData, brightness = 25) {
            const len = pixelData.length;
            const mem = _malloc(len);
            HEAPU8.set(pixelData, mem);
            _brighten(mem, len, brightness);
            const filtered = HEAPU8.subarray(mem, mem + len);
            _free(mem);
            return filtered;
          };
          wam['invert'] = function(pixelData) {
            const len = pixelData.length;
            const mem = _malloc(len);
            HEAPU8.set(pixelData, mem);
            _invert(mem, len);
            const filtered = HEAPU8.subarray(mem, mem + len);
            _free(mem);
            return filtered;
          };
          wam['noise'] = function(pixelData) {
            const len = pixelData.length;
            const mem = _malloc(len * Float32Array.BYTES_PER_ELEMENT);
            HEAPF32.set(pixelData, mem / Float32Array.BYTES_PER_ELEMENT);
            _noise(mem, len);
            const filtered = HEAPF32.subarray(mem / Float32Array.BYTES_PER_ELEMENT, mem / Float32Array.BYTES_PER_ELEMENT + len);
            _free(mem);
            return filtered;
          };
          //MultiFilter Family of Functions
          wam['multiFilter'] = function(pixelData, width, filterType, mag, multiplier, adj) {
            const len = pixelData.length;
            const mem = _malloc(len);
            HEAPU8.set(pixelData, mem);
            _multiFilter(mem, len, width, filterType, mag, multiplier, adj);
            const filtered = HEAPU8.subarray(mem, mem + len);
            _free(mem);
            return filtered;
          };
          wam['multiFilterFloat'] = function(pixelData, width, filterType, mag, multiplier, adj) {
            const len = pixelData.length;
            const mem = _malloc(len * Float32Array.BYTES_PER_ELEMENT);
            HEAPF32.set(pixelData, mem / Float32Array.BYTES_PER_ELEMENT);
            _multiFilterFloat(mem, len, width, filterType, mag, multiplier, adj);
            const filtered = HEAPF32.subarray(mem / Float32Array.BYTES_PER_ELEMENT, mem / Float32Array.BYTES_PER_ELEMENT + len);
            _free(mem);
            return filtered;
          };
          //bindLastArgs is defined and hoisted from below the module load
          let mag = 127,
            mult = 2,
            adj = 4;
          let filt = wam['multiFilter'];
          let filtFloat = wam['multiFilterFloat'];
          wam['sunset'] = bindLastArgs(filt, 4, mag, mult, adj);
          wam['analogTV'] = bindLastArgs(filt, 7, mag, mult, adj);
          wam['emboss'] = bindLastArgs(filt, 1, mag, mult, adj);
          wam['urple'] = bindLastArgs(filt, 2, mag, mult, adj);
          wam['forest'] = bindLastArgs(filtFloat, 5, mag, 3, 1);
          wam['romance'] = bindLastArgs(filtFloat, 8, mag, 3, 2);
          wam['hippo'] = bindLastArgs(filtFloat, 2, 80, 3, 2);
          wam['longhorn'] = bindLastArgs(filtFloat, 2, 27, 3, 2);
          wam['underground'] = bindLastArgs(filt, 8, mag, 1, 4);
          wam['rooster'] = bindLastArgs(filt, 8, 60, 1, 4);
          wam['moss'] = bindLastArgs(filtFloat, 1, mag, 1, 1);
          wam['mist'] = bindLastArgs(filt, 1, mag, 1, 1);
          wam['kaleidoscope'] = bindLastArgs(filt, 1, 124, 4, 3);
          wam['tingle'] = bindLastArgs(filtFloat, 1, 124, 4, 3);
          wam['bacteria'] = bindLastArgs(filt, 4, 0, 2, 4);
          wam['hulk'] = bindLastArgs(filt, 2, 10, 2, 4);
          wam['ghost'] = bindLastArgs(filt, 1, 5, 2, 4);
          wam['swamp'] = bindLastArgs(filtFloat, 1, 40, 2, 3);
          wam['twisted'] = bindLastArgs(filt, 1, 40, 2, 3);
          wam['security'] = bindLastArgs(filt, 1, 120, 1, 0);
          wam['robbery'] = bindLastArgs(filtFloat, 1, 120, 1, 0);
          //end filters from multiFilter family

          wam['sobelFilter'] = function(pixelData, width, height, invert = false) {
            const len = pixelData.length;
            const mem = _malloc(len);
            HEAPU8.set(pixelData, mem);
            _sobelFilter(mem, width, height, invert);
            const filtered = HEAPU8.subarray(mem, mem + len);
            _free(mem);
            return filtered;
          };
          //convFilter family of filters
          wam['convFilter'] = function(pixelData, width, height, kernel, divisor, bias = 0, count = 1) {
            const arLen = pixelData.length;
            const memData = _malloc(arLen * Float32Array.BYTES_PER_ELEMENT);
            HEAPF32.set(pixelData, memData / Float32Array.BYTES_PER_ELEMENT);
            const kerWidth = kernel[0].length;
            const kerHeight = kernel.length;
            const kerLen = kerWidth * kerHeight;
            const flatKernel = kernel.reduce((acc, cur) => acc.concat(cur));
            const memKernel = _malloc(kerLen * Float32Array.BYTES_PER_ELEMENT);
            HEAPF32.set(flatKernel, memKernel / Float32Array.BYTES_PER_ELEMENT);
            _convFilter(memData, width, height, memKernel, 3, 3, divisor, bias, count);
            const filtered = HEAPF32.subarray(memData / Float32Array.BYTES_PER_ELEMENT, memData / Float32Array.BYTES_PER_ELEMENT + arLen);
            _free(memData);
            _free(memKernel);
            return filtered;
          }
          //defining kernel and other parameters before each function definition
          let kernel = [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
            divisor = 9,
            bias = 0,
            count = 1;
          let conv = wam['convFilter'];
          wam['blur'] = bindLastArgs(conv, kernel, divisor, bias, 3);
          kernel = [[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]], divisor = 1;
          wam['strongSharpen'] = bindLastArgs(conv, kernel, divisor);
          kernel = [[0, -1, 0], [-1, 5, -1], [0, -1, 0]], divisor = 2;
          wam['sharpen'] = bindLastArgs(conv, kernel, divisor);
          kernel = [[1, -1, -1], [-1, 8, -1], [-1, -1, 1]], divisor = 3;
          wam['clarity'] = bindLastArgs(conv, kernel, divisor);
          kernel = [[-1, -1, 1], [-1, 14, -1], [1, -1, -1]], divisor = 3;
          wam['goodMorning'] = bindLastArgs(conv, kernel, divisor);
          kernel = [[4, -1, -1], [-1, 4, -1], [0, -1, 4]], divisor = 3;
          wam['acid'] = bindLastArgs(conv, kernel, divisor);
          kernel = [[0, 0, -1], [-1, 12, -1], [0, -1, -1]], divisor = 2;
          wam['dewdrops'] = bindLastArgs(conv, kernel, divisor);
          kernel = [[-1, -1, 4], [-1, 9, -1], [0, -1, 0]], divisor = 2;
          wam['destruction'] = bindLastArgs(conv, kernel, divisor);
          //end convFilter family of filters
          // for (let prop in wam) {
          //   wam[prop] = createFilter(returnsOnceMallocedFilter(prop));
          // }
          resolve(wam);
        }
      });
  });
}