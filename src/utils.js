function toByteRGB (color) {
  return {
    r: (color.getHex() & 0xff0000) >> 16,
    g: (color.getHex() & 0x00ff00) >> 8,
    b: (color.getHex() & 0x0000ff)
  };
}

function saveFile(blob, filename) {
  const link = document.createElement('a');
  link.style.display = 'none';
  document.body.appendChild(link);
  link.href = URL.createObjectURL(blob);
  link.download = filename || `${Date.now()}.txt`;
  link.click();
}

const shortenedFunctionStrings = `
  const cos = Math.cos;
  const sin = Math.sin;
  const pow = Math.pow;
  const sqrt = Math.sqrt;
`;

module.exports = {
  toByteRGB,
  saveFile,
  shortenedFunctionStrings
}
