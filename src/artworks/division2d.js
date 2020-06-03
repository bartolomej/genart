import Canvas from "../canvas";


export default function ({ root, segmentSize, spaceBetween, drawCurves = true }) {
  const canvas = new Canvas({
    root,
    name: 'division2d',
    background: 'black',
    showCaptureBtn: false
  });

  const ctx = canvas.ctx;
  const lines = [];

  for (let i = 0; i < canvas.height; i += spaceBetween) {
    const line = [];
    for (let j = 0; j < canvas.width; j += segmentSize) {
      const variance = getVariance(j);
      const random = Math.random() * variance / 3 * -1;
      const point = { x: j, y: i + random, color: `hsl(${Math.random() * 360}, 100%, 50%)` };
      line.push(point);
    }
    lines.push(line);
  }

  canvas.animate(() => {
    for (let i = 4; i < lines.length - 1; i++) {
      const line = lines[i];
      ctx.beginPath();
      ctx.moveTo(line[0].x, line[0].y);
      for (let j = 0; j < line.length - 2; j++) {
        const point = line[j];
        const variance = getVariance(point.x);
        const rand = Math.random() * variance / 200;
        point.y = point.y + chooseRand(-rand, rand);
        ctx.lineWidth = 5;
        ctx.strokeStyle = point.color
        if (drawCurves) {
          const xc = (lines[i][j].x + lines[i][j + 1].x) / 2;
          const yc = (lines[i][j].y + lines[i][j + 1].y) / 2;
          ctx.quadraticCurveTo(lines[i][j].x, lines[i][j].y, xc, yc);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      }
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fill();
      ctx.restore();
      ctx.stroke();
    }
  });

  function getVariance (x) {
    const distanceToCenter = Math.abs(x - canvas.width / 2);
    return Math.max(canvas.width / 2 - 600 - distanceToCenter, 0);
  }
}

function chooseRand (value1, value2) {
  if (Math.random() < 0.5) {
    return value1;
  } else {
    return value2;
  }
}
