const canvasSketch = require('canvas-sketch');

const settings = {
  duration: 3,
  dimensions: [ 2048, 2048 ],
  scaleToView: true,
  playbackRate: 'throttle',
  animate: true,
  fps: 24
};

const division = ({ width, height }) => {

  const spaceBetween = 50;
  const segmentSize = 20;

  const lines = [];
  for (let i = 0; i < height; i += spaceBetween) {
    const line = [];
    for (let j = 0; j < width; j += segmentSize) {
      const variance = getVariance(j);
      const random = Math.random() * variance / 3 * -1;
      const point = { x: j, y: i + random, color: `hsl(${Math.random() * 360}, 100%, 50%)` };
      line.push(point);
    }
    lines.push(line);
  }

  function getVariance (x) {
    const distanceToCenter = Math.abs(x - width / 2);
    return Math.max(width / 2 - 600 - distanceToCenter, 0);
  }

  return ({ context: ctx, width, height }) => {
    ctx.clearRect(0, 0, width, height);
    ctx.canvas.style.background = 'black';

    for (let i = 4; i < lines.length - 1; i++) {
      const line = lines[i];
      ctx.beginPath();
      ctx.moveTo(line[0].x, line[0].y);
      for (let j = 0; j < line.length - 2; j++) {
        const point = line[j];
        const variance = getVariance(point.x);
        point.y = point.y + (Math.random() - 0.5) * variance / 100;
        ctx.lineWidth = 5;
        ctx.strokeStyle = point.color
        const xc = (lines[i][j].x + lines[i][j + 1].x) / 2;
        const yc = (lines[i][j].y + lines[i][j + 1].y) / 2;
        ctx.quadraticCurveTo(lines[i][j].x, lines[i][j].y, xc, yc);
      }
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fill();
      ctx.restore();
      ctx.stroke();
    }
  };
};

canvasSketch(division, settings);
