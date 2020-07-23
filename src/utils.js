function toByteRGB (color) {
  return {
    r: (color.getHex() & 0xff0000) >> 16,
    g: (color.getHex() & 0x00ff00) >> 8,
    b: (color.getHex() & 0x0000ff)
  };
}

const shortenedFunctionStrings = `
  const cos = Math.cos;
  const sin = Math.sin;
  const pow = Math.pow;
  const sqrt = Math.sqrt;
`;

module.exports = {
  toByteRGB,
  shortenedFunctionStrings
}
