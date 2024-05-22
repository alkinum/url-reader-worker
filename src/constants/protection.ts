export const PROTECTION_OPTIONS = {
  canvasRgba: [3, 1, -2, 2], // all these numbers can be from -5 to 5
  webglData: {
    '3379': 16384, // 16384, 32768
    '3386': {
      '0': 8192, // 8192, 16384, 32768
      '1': 32768, // 8192, 16384, 32768
    },
    '3410': 2, // 2, 4, 8, 16
    '3411': 4, // 2, 4, 8, 16
    '3412': 16, // 2, 4, 8, 16
    '3413': 4, // 2, 4, 8, 16
    '7938': 'WebGL 1.0 (OpenGL Chromium)', // "WebGL 1.0", "WebGL 1.0 (OpenGL)", "WebGL 1.0 (OpenGL Chromium)"
    '33901': {
      '0': 1,
      '1': 1024, // 1, 1024, 2048, 4096, 8192
    },
    '33902': {
      '0': 1,
      '1': 4096, // 1, 1024, 2048, 4096, 8192
    },
    '34024': 32768, // 16384, 32768
    '34047': 8, // 2, 4, 8, 16
    '34076': 16384, //16384, 32768
    '34921': 16, // 2, 4, 8, 16
    '34930': 4, // 2, 4, 8, 16
    '35660': 2, // 2, 4, 8, 16
    '35661': 128, // 16, 32, 64, 128, 256
    '35724': 'WebGL GLSL ES', // "WebGL", "WebGL GLSL", "WebGL GLSL ES", "WebGL GLSL ES (OpenGL Chromium)"
    '36347': 4096, // 4096, 8192
    '36349': 8192, // 1024, 2048, 4096, 8192
    '37446': 'HD Graphics', // "Graphics", "HD Graphics", "Intel(R) HD Graphics"
  },
  fontFingerprint: {
    noise: 2, // -1, 0, 1, 2
    sign: 1, // -1, +1
  },
  audioFingerprint: {
    getChannelDataIndexRandom: Math.random(), // all values of Math.random() can be used
    getChannelDataResultRandom: Math.random(), // all values of Math.random() can be used
    createAnalyserIndexRandom: Math.random(), // all values of Math.random() can be used
    createAnalyserResultRandom: Math.random(), // all values of Math.random() can be used
  },
  webRTCProtect: true, // this option is used to disable or enable WebRTC disabling by destroying get user media
};
