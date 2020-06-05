const canvasSketch = require('canvas-sketch');

const settings = {
  duration: 3,
  dimensions: [1800, 1800],
  scaleToView: true,
  playbackRate: 'throttle',
  animate: true,
  fps: 24
};

const division2d = ({ width, height, context }) => {
  context.canvas.style.background = 'black';


  const nVectors = 1000;
  const f = 40;
  const dt = 0.1;
  let time = 0;

  const len = v => Math.sqrt(v.x ** 2 + v.y ** 2);
  const vx = p => Math.sin(p.x + p.y + time) * f;
  const vy = p => Math.cos(p.y + time) * f;

  let vectors = [];
  let sqrt = Math.sqrt(nVectors);
  let dx = width / sqrt;
  let dy = height / sqrt;
  for (let y = 0; y < height; y += dy) {
    for (let x = 0; x < height; x += dx) {
      vectors.push({ x, y });
    }
  }

  return ({ context: ctx, width, height }) => {
    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    for (let p of vectors) {
      const v = { x: vx(p), y : vy(p) };
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + v.x, p.y + v.y);
      ctx.strokeStyle = `hsl(${len(v) * 10}, 100%, 50%)`;
      ctx.stroke();
    }
    ctx.fill();

    time += dt;
  };
};

canvasSketch(division2d, settings);
