function vectorize (v) {
  if (v instanceof Vector) {
    return v;
  }
  if (v instanceof Array) {
    return new Vector(v[0], v[1]);
  }
  if (v instanceof Object) {
    return new Vector(v.x, v.y);
  }
  throw new Error('Invalid vector struct');
}

class Matrix {

  constructor (v0, v1) {
    this.v0 = vectorize(v0);
    this.v1 = vectorize(v1);
  }

  // immutable scalar multiplication
  scalarI (n) {
    return new Matrix(
      this.v0.scalarI(n),
      this.v1.scalarI(n)
    );
  }

  scalarM (n) {
    this.v0.scalarM(n);
    this.v1.scalarM(n);
  }

  transformI (v) {
    return this.v0.scalarI(v.x).addI(this.v1.scalarI(v.y));
  }

  inverseTransformI (v) {
    return this.inverseMatrix().transformI(v);
  }

  inverseMatrix () {
    return new Matrix(
      [this.v1.y, -this.v0.y],
      [-this.v1.x, this.v0.x]
    ).scalarI(
      1 / this.determinant()
    )
  }

  determinant () {
    return this.v0.x * this.v1.y - this.v1.x * this.v0.y;
  }

}

class Vector {

  constructor (x, y) {
    this.x = x;
    this.y = y;
  }

  // multiplies vector by a scalar value
  // mutable operation
  scalarM (n) {
    this.x *= n;
    this.y *= n;
  }

  // multiplies vector by a scalar value
  // immutable operation
  scalarI (n) {
    return new Vector(this.x * n, this.y * n);
  }

  addI (v) {
    return new Vector(this.x + v.x, this.y + v.y);
  }

  abs () {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }

  addM (v) {
    this.x += v.x;
    this.y += v.y;
  }

  normalize () {
    const f = Math.sqrt(2) / this.abs();
    return new Vector(this.x * f, this.y * f);
  }

  clone () {
    return new Vector(this.x, this.y);
  }

}

module.exports = {
  Vector,
  Matrix
}
