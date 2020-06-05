const canvasSketch = require('canvas-sketch');

const settings = {
  duration: 3,
  dimensions: [2000, 2000],
  scaleToView: true,
  playbackRate: 'throttle',
  animate: true,
  fps: 24
};

const division2d = ({ width, height }) => {

  const nParticles = 1000;
  const particleSize = 3;
  const f = 10;

  const vx = p => Math.sin(p.x) * f;
  const vy = p => Math.cos(p.y) * f;

  let particles = [];
  let sqrt = Math.sqrt(nParticles);
  let dx = width / sqrt;
  let dy = height / sqrt;
  for (let y = 0; y < height; y += dy) {
    for (let x = 0; x < height; x += dx) {
      particles.push({ x, y });
    }
  }

  return ({ context: ctx, width, height }) => {
    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();

    for (let p of particles) {
      ctx.moveTo(p.x, p.y);
      ctx.arc(p.x, p.y, particleSize, 0, Math.PI * 2);
      p.x += vx(p);
      p.y += vy(p);
    }
    ctx.fill();
  };
};

canvasSketch(division2d, settings);
