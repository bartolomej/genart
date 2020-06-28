const canvasSketch = require('canvas-sketch');

const settings = {
  duration: 3,
  dimensions: [2048, 2048],
  scaleToView: true,
  playbackRate: 'throttle',
  animate: true,
  fps: 24
};

const division2d = ({ width, height, context }) => {
  context.canvas.style.background = 'black';

  let time = 0;
  const dTime = 0.1;
  const drawingPrecision = 8;
  const particleSize = 3;
  const nWaves = 15;

  /**
   * @description Calculates composed wave y value.
   * @param x - positional variable
   * @param i - wave index
   * @param s -
   * @param a - scale factor
   * @returns {number}
   */
  const wave = (x, i, s, a) => {
    let sum = 0;
    for (let c of waveComponents) {
      sum += c(x, i, s, a);
    }
    return sum / 2;
  }
  const waveComponents = [
    (x, i, s, a) => s * Math.sin(x / 100 + time + i) ,
    (x, i, s, a) => s * Math.sin(x / 200 + time + i),
    (x, i, s, a) => s * Math.sin(x / 300 + i) * a,
    (x, i, s, a) => s * Math.sin(x / 50 + time + i) * a,
  ]

  return ({ context: ctx, width, height }) => {
    ctx.clearRect(0, 0, width, height);

    ctx.beginPath();
    // start at index 1 to avoid rendering first wave as a line (multiplication with 0)
    for (let i = 1; i < nWaves + 1; i++) {
      for (let x = 0; x < width; x += drawingPrecision) {
        const middleF = (width / 2 - Math.abs(width / 2 - x)) / 10;
        const scale = i * 50 * Math.cos(time);
        const speed = middleF * Math.sin(time) / 30;
        const y = (height / 2) + wave(x, (i * Math.sin(time)) / 10, scale, speed);
        ctx.moveTo(x, y);
        ctx.arc(x, y, particleSize, 0, Math.PI * 2);
      }
    }
    ctx.fillStyle = 'white';
    ctx.fill();

    time += dTime;
  };
};

canvasSketch(division2d, settings);
