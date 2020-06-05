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

  const nCurves = 10;
  const nPoints = 50;
  const lineWidth = 1;
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
      for (let i = 0; i < curve.length - 1; i++) {
        ctx.moveTo(curve[i].x, curve[i].y);
        ctx.lineTo(curve[i + 1].x, curve[i + 1].y);
        curve[i].x += randomMove();
        curve[i].y += randomMove();
      }
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = curve[0].color;
      ctx.stroke();
    }
  };
};

canvasSketch(division2d, settings);
