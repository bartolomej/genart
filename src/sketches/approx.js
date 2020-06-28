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
  const dTime = 0.1;
  const startI = 2;
  const lineWidth = 3;
  const minPlotApproxDiff = 300;
  const nGraphs = 10;
  const sin = x => Math.sin(x * 0.005) * 50;

  const nSteps = () => Math.sin(time / 5) ** 2 * minPlotApproxDiff;
  const func = (x, a) => (
    sin(x) +
    sin(3 * x) +
    sin((sin(time) / 10) * 3 * x) +
    -sin(1 / 2 * x)
  ) * Math.sin(time) * a * 0.6;

  return ({ context: ctx, width, height }) => {
    ctx.clearRect(0, 0, width, height);
    const middle = height / 2;

    ctx.beginPath();
    // ctx.moveTo(width, height);
    ctx.lineTo(0, height);
    ctx.lineTo(0, middle + func(0));
    const diff = width / nSteps();
    for (let x = 0; x < width; x += diff) {
      for (let i = startI; i < nGraphs + startI; i++) {
        const y0 = middle + func(x, i);
        const y1 = middle + func(x + diff, i);
        ctx.moveTo(x, y0);
        ctx.lineTo(x + diff, y1);
      }
    }
    // ctx.lineTo(width, height);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = 'white';
    ctx.fillStyle = 'white';
    ctx.stroke();
    ctx.fill();

    time += dTime;
  };
};

canvasSketch(sketch, settings);
