const canvasSketch = require('canvas-sketch');

const settings = {
  duration: 3,
  dimensions: [1024, 1024],
  scaleToView: true,
  playbackRate: 'throttle',
  animate: true,
  fps: 24
};

const division2d = ({ width, height }) => {

  let time = 0;

  const dt = 0.01;
  const magnify = 50;
  const spacing = 50;
  const lineWidth = 4;

  const vx = (x, y) => Math.sin(x + y + time) * magnify;
  const vy = (x, y) => Math.sin(x + time) * Math.cos(time) * magnify;

  return ({ context: ctx, width, height }) => {
    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();

    for (let y = 0; y < height; y += spacing) {
      for (let x = 0; x < width; x += spacing) {
        const v = { x: vx(x, y), y: vy(x, y) }
        ctx.moveTo(x, y);
        ctx.lineWidth = lineWidth;
        ctx.lineTo(x + v.x, y + v.y);
      }
    }
    ctx.stroke();
    time += dt;
  };
};

canvasSketch(division2d, settings);
