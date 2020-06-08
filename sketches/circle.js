const canvasSketch = require('canvas-sketch');

const settings = {
  duration: 3,
  dimensions: [1024, 1024],
  scaleToView: true,
  playbackRate: 'throttle',
  animate: true,
  fps: 24
};

const division2d = ({ width, height, context }) => {
  context.canvas.style.background = 'black';

  const nCircles = 10;

  const circles = [];
  for (let i = 0; i < nCircles; i++) {
    circles.push({
      center: { x: width / 2, y: height / 2},
      radius: i * 50
    });
  }

  return ({ context: ctx, width, height }) => {
    ctx.clearRect(0, 0, width, height);

    ctx.beginPath();
    for (let i = 0; i < circles.length; i++) {
      const c = circles[i];
      ctx.moveTo(c.center.x + c.radius, c.center.y);
      ctx.arc(c.center.x, c.center.y, c.radius, 0, Math.PI * 2);
      const rand = () => (Math.random() - 0.5) * i;
      c.center.x += rand();
      c.center.y += rand();
    }
    ctx.strokeStyle = 'white';
    ctx.stroke();
  };
};

canvasSketch(division2d, settings);
