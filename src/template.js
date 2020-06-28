const canvasSketch = require('canvas-sketch');

const settings = {
  duration: 3,
  dimensions: [2048, 2048],
  scaleToView: true,
  playbackRate: 'throttle',
  animate: true,
  fps: 24
};

const sketch = ({ width, height, context }) => {
  context.canvas.style.background = 'black';

  let time = 0;
  const dTime = 0.01;

  return ({ context: ctx, width, height }) => {
    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();

    const r = Math.pow(Math.sin(time), 2) * 100;
    ctx.arc(width / 2, height / 2, r, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();

    time += dTime;
  };
};

canvasSketch(sketch, settings);
