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

  const nCurves = 20;
  const nPoints = 10;
  const lineWidth = 2;
  const randomMove = () => (Math.random() - 0.5) * 10;

  const curves = [];
  for (let i = 0; i < nCurves; i++) {
    let curve = [];
    for (let j = 0; j < nPoints; j++) {
      curve.push({
        x: Math.random() * width,
        y: Math.random() * height,
        color: `hsl(${Math.random() * 360}, 100%, 50%)`,
      });
    }
    curves.push(curve);
  }

  return ({ context: ctx, width, height }) => {
    ctx.clearRect(0, 0, width, height);

    for (let curve of curves) {
      ctx.beginPath();
      ctx.moveTo(curve[0].x, curve[0].y);
      for (let i = 0; i < curve.length - 1; i++) {
        const cx = (curve[i].x + curve[i + 1].x) / 2;
        const cy = (curve[i].y + curve[i + 1].y) / 2;
        const x = curve[i].x;
        const y = curve[i].y;
        ctx.quadraticCurveTo(x, y, cx, cy);
        curve[i].x += randomMove();
        curve[i].y += randomMove();
      }
      ctx.moveTo(curve[curve.length - 1].x, curve[curve.length - 1].y);
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = curve[0].color;
      ctx.stroke();
    }
  };
};

canvasSketch(division2d, settings);
