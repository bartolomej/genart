const canvasSketch = require('canvas-sketch');

const settings = {
  duration: 3,
  dimensions: [1024, 1024],
  scaleToView: true,
  playbackRate: 'throttle',
  animate: true,
  fps: 24
};

const sketch = ({ width, height, context }) => {
  context.canvas.style.background = 'black';

  const nPoints = 50;
  const trailLength = 25;
  const dP = 8;
  const pointSize = 4;
  const start = { x: width / 2, y: height / 2 }
  const dTime = 0.04;
  const randomness = 30;
  let time = 0;

  const posX = i => start.x + Math.cos(i + time) * dP * i;
  const posY = i => start.x + Math.sin(i + time) * dP * i;

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

      const rand = () => ((Math.random() - 0.5) * Math.sin(time / 0.6)) * randomness;

      points[i].x = posX(i) + rand();
      points[i].y = posY(i) + rand();
    }
    ctx.fillStyle = 'white';
    ctx.fill();

    time += dTime;
  };
};

canvasSketch(sketch, settings);
