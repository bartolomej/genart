const canvasSketch = require('canvas-sketch');
const Audio = require('../audio');

const settings = {
  duration: 3,
  dimensions: [2048, 2048],
  scaleToView: true,
  playbackRate: 'throttle',
  animate: true,
  fps: 24
};

const sketch = async ({ width, height, context }) => {
  context.canvas.style.background = 'black';

  const audio = new Audio();
  await audio.init();

  let time = 0;
  const dTime = 0.01;

  return ({ context: ctx, width, height }) => {
    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();

    const frequencyArray = audio.getFrequencyArray();

    const dx = width / frequencyArray.length;
    let x = 0;
    for (let f of frequencyArray) {
      ctx.moveTo(x, height);
      ctx.lineTo(x, height - (f * 10));
      x += dx;
    }
    ctx.lineWidth = dx;
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 10;
    ctx.stroke();

    time += dTime;
  };
};

canvasSketch(sketch, settings);
