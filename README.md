## Generative Art Experiments

These experiments utilize a helpful library called [canvas-sketch](https://github.com/mattdesl/canvas-sketch).

```bash
# Start a new sketch from the Three.js template
canvas-sketch --new --template=three

# Run existing sketch
canvas-sketch sketch.js --open --hot

# Build a sketch
canvas-sketch src/sketches/sketch.js --dir public/sketches --build --html=public/sketch.html
```
