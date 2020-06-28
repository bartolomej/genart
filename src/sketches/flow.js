const canvasSketch = require('canvas-sketch');

const settings = {
  duration: 3,
  dimensions: [2000, 2000],
  scaleToView: true,
  playbackRate: 'throttle',
  animate: true,
  fps: 24
};

const sketch = ({ width, height, context }) => {
  context.canvas.style.background = 'black';

  const nParticles = 400;
  const maxPathLength = 20;
  const thickness = 5;
  const drawDot = false;
  const dt = 0.1;
  const f = 6;

  const vx = (p, k = 1) => k * 20 * Math.sin(Math.cos(Math.sin(time * p.x * Math.random()))  * f);
  const vy = (p, k = 1) => k * 20 * Math.cos(Math.sin(Math.cos(time * p.y * Math.random())) * p.x  * f);

  let time = 0;
  let particles = [];

  let sqrt = Math.sqrt(nParticles);
  let dx = width / sqrt;
  let dy = height / sqrt;

  for (let y = 0; y < height; y += dy) {
    for (let x = 0; x < height; x += dx) {
      particles.push({ x, y, path: [] });
    }
  }

  return ({ context: ctx, width, height }) => {
    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();

    for (let p of particles) {
      if (drawDot) {
        ctx.moveTo(p.x, p.y);
        ctx.arc(p.x, p.y, thickness / 2, 0, Math.PI * 2);
      }
      p.x += vx(p, Math.sin(time) * Math.cos(time));
      p.y += vy(p, Math.cos(time));

      p.path.push({ x: p.x, y: p.y });
      drawPath(ctx, p.path);
      if (p.path.length >= maxPathLength) {
        p.path.splice(0, 1);
      }
    }
    ctx.fill();
    ctx.lineWidth = thickness;
    ctx.strokeStyle = 'white';
    ctx.stroke();

    time += dt;
  };

  function drawPath (ctx, path) {
    for (let i = 0; i < path.length - 1; i++) {
      const p0 = path[i];
      const p1 = path[i + 1];
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
    }
  }

};
canvasSketch(sketch, settings);
