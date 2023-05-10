## Generative Art Experiments

These experiments utilize a helpful library called [canvas-sketch](https://github.com/mattdesl/canvas-sketch).

```bash
# Start a new sketch from the Three.js template
npx canvas-sketch-cli --new --template=three

# Run existing sketch
npx canvas-sketch-cli sketch.js --open --hot

# Build a sketch
npx canvas-sketch-cli src/sketches/<sketch-name>.js --dir public/sketches --build --source-map=false
```
