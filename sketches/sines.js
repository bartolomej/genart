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
  const drawingPrecision = 10;
  const particleSize = 3;
  const nWaves = 10;

  const wave = (x, i, s, a) => a * Math.sin((x + i * s) / 100 + time);

  return ({ context: ctx, width, height }) => {
    ctx.clearRect(0, 0, width, height);

    ctx.beginPath();
    for (let i = 0; i < nWaves; i++) {
      for (let x = 0; x < width; x += drawingPrecision) {
        const middleF = (width / 2 - Math.abs(width / 2 - x)) / 10;
        const y = (height / 2) + wave(x, i, i * 10 * Math.cos(time), i * middleF * Math.sin(time));
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
