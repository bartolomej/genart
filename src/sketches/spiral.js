const canvasSketch = require('canvas-sketch');

const settings = {
  duration: 3,
  dimensions: [2048, 2048],
  scaleToView: true,
  playbackRate: 'throttle',
  animate: true,
  fps: 50
};

const sketch = ({ width, height, context }) => {
  context.canvas.style.background = 'black';

  const nPoints = 120;
  const trailLength = 15;
  const spacingFactor = 8;
  const pointSize = 8;
  const start = { x: width / 2, y: height / 2 }
  const dTime = 0.025;
  const randomness = 0;
  let time = 0;

  const color = () => `hsl(40, ${Math.sin(time * 2 + 15.7) * 100}%, ${Math.cos(time * 2) * 40 + 60}%)`;
  const spacing = () => Math.cos(time) * spacingFactor;
  const a = () => Math.pow(Math.sin(time), 2);
  const posX = i => start.x + Math.cos(i + time + a()) * spacing() * i;
  const posY = i => start.x + Math.sin(i + time + a()) * spacing() * i;

  const points = [];
  for (let i = 0; i < nPoints; i++) {
    points.push({ x: posX(0), y: posY(0), trail: [] });
  }

  return ({ context: ctx, width, height }) => {
    ctx.clearRect(0, 0, width, height);

    ctx.beginPath();
    for (let i = 0; i < points.length; i++) {
      let { x, y, trail } = points[i];
      ctx.moveTo(x, y);
      ctx.arc(x, y, pointSize, 0, Math.PI * 2);

      for (let j = 0; j < trail.length; j++) {
        let { x, y } = trail[j];
        ctx.moveTo(x, y);
        ctx.arc(x, y, pointSize * (j / trail.length), 0, Math.PI * 2);
      }

      trail.push(Object.assign({}, { x, y }));
      if (trail.length > trailLength) {
        trail.splice(0, 1);
      }

      const rand = () => ((Math.random() - 0.5) * Math.sin(time)) * randomness;

      points[i].x = posX(i) + rand();
      points[i].y = posY(i) + rand();
    }
    ctx.fillStyle = color();
    ctx.fill();

    time += dTime;
  };
};

canvasSketch(sketch, settings);
