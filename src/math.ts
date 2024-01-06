import {
  makeRotationMatrix,
  makeScalingMatrix,
  makeTranslationMatrix,
} from "./transformations";
import { sharpCanvas } from "./utils";

export class Matrix4 {
  arr: number[];

  constructor(arr: number[]) {
    if (arr.length !== 16) throw new Error("incorrect matrix size");
    this.arr = arr;
  }

  mulVec(vector: Vector) {
    // column-major mul
    const vectorArr: number[] = [];

    for (let i = 0; i < 4; i++) {
      const rowIdx = i * 4;
      vectorArr.push(
        this.arr[rowIdx] * vector.x +
          this.arr[rowIdx + 1] * vector.y +
          this.arr[rowIdx + 2] * vector.z +
          this.arr[rowIdx + 3] * vector.w
      );
    }

    const [x, y, z, w] = vectorArr;
    return new Vector(x, y, z, w);
  }

  mulMat(matrix: Matrix4) {
    const matrixArr: number[] = [];

    for (let i = 0; i < 4; i++) {
      const rowIdx = i * 4;
      for (let j = 0; j < 4; j++) {
        matrixArr.push(
          this.arr[rowIdx] * matrix.arr[j] +
            this.arr[rowIdx + 1] * matrix.arr[j + 4] +
            this.arr[rowIdx + 2] * matrix.arr[j + 8] +
            this.arr[rowIdx + 3] * matrix.arr[j + 12]
        );
      }
    }

    return new Matrix4(matrixArr);
  }

  isIdentity() {
    let isIdentity = true;
    mainLoop: for (let i = 0; i < 4; i++) {
      const rowIdx = i * 4;
      for (let j = 0; j < 4; j++) {
        if (i === j) {
          if (this.arr[rowIdx + j] !== 1) {
            isIdentity = false;
            break mainLoop;
          }
        } else {
          if (this.arr[rowIdx + j] !== 0) {
            isIdentity = false;
            break mainLoop;
          }
        }
      }
    }
    return isIdentity;
  }

  getCol(col: number) {
    // col start from zero like arrays
    return [
      this.arr[col],
      this.arr[col + 4],
      this.arr[col + 8],
      this.arr[col + 12],
    ];
  }

  print() {
    const arr2d: string[][] = [];
    for (let i = 0; i < 4; i++) {
      arr2d.push([
        this.arr[i * 4].toFixed(2),
        this.arr[i * 4 + 1].toFixed(2),
        this.arr[i * 4 + 2].toFixed(2),
        this.arr[i * 4 + 3].toFixed(2),
      ]);
    }
    console.table(arr2d);
  }
}

export class Vector {
  x: number;
  y: number;
  z: number;
  w: number;

  constructor(x: number, y: number, z: number, w?: number) {
    this.x = x;
    this.y = y;
    this.z = z;
    if (w) {
      this.w = w;
    } else {
      this.w = 1;
    }
  }

  getCoords() {
    return [this.x, this.y, this.z, this.w];
  }
}

export class Wireframe {
  vertices: Vector[];
  edges: number[][];
  origin: Vector;
  axes: Matrix4;
  transformations = {
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    translationX: 0,
    translationY: 0,
    translationZ: 0,
    scaleX: 1,
    scaleY: 1,
    scaleZ: 1,
  };

  constructor(
    vertices: Vector[],
    edges: number[][],
    origin: Vector,
    axes: Matrix4
  ) {
    this.vertices = vertices;
    this.edges = edges;
    this.origin = origin;
    this.axes = axes;
  }

  clone() {
    const wireframe = new Wireframe(
      this.vertices,
      this.edges,
      this.origin,
      this.axes
    );
    wireframe.transformations = wireframe.transformations;
    return wireframe;
  }

  mulMat(matrix: Matrix4) {
    const vertices: Vector[] = [];
    for (let i = 0; i < this.vertices.length; i++) {
      const vertex = this.vertices[i];
      vertices.push(matrix.mulVec(vertex));
    }
    this.vertices = vertices;
    return this;
  }

  getWorld2LocalMat() {
    const arr2d = [
      [1, 0, 0, this.origin.x * -1],
      [0, 1, 0, this.origin.y * -1],
      [0, 0, 1, this.origin.z * -1],
      [0, 0, 0, 1],
    ];
    const w2lMat = new Matrix4(arr2d.flatMap((e) => e));
    return w2lMat;
  }

  getLocal2WorldMat() {
    const arr2d = [
      [1, 0, 0, this.origin.x],
      [0, 1, 0, this.origin.y],
      [0, 0, 1, this.origin.z],
      [0, 0, 0, 1],
    ];
    const l2wMat = new Matrix4(arr2d.flatMap((e) => e));
    return l2wMat;
  }

  world2local() {
    return this.mulMat(this.getWorld2LocalMat());
  }

  local2world() {
    return this.mulMat(this.getLocal2WorldMat());
  }

  getAxis(axis: "x" | "y" | "z") {
    let [x, y, z, w] = [0, 0, 0, 0];
    if (axis === "x") {
      [x, y, z, w] = this.axes.getCol(0);
    } else if (axis === "y") {
      [x, y, z, w] = this.axes.getCol(1);
    } else if (axis === "z") {
      [x, y, z, w] = this.axes.getCol(2);
    }
    return new Vector(x, y, z, w);
  }

  rotate(angle: number, axis: "x" | "y" | "z") {
    let deltaAngle = 0;
    switch (axis) {
      case "x":
        deltaAngle = angle - this.transformations.rotationX;
        this.transformations.rotationX = angle;
        break;
      case "y":
        deltaAngle = angle - this.transformations.rotationY;
        this.transformations.rotationY = angle;
        break;
      case "z":
        deltaAngle = angle - this.transformations.rotationZ;
        this.transformations.rotationZ = angle;
        break;
    }
    this.world2local();

    const axisVector = this.getAxis(axis);
    const rotMat = makeRotationMatrix(deltaAngle, axisVector);
    this.axes = rotMat.mulMat(this.axes);
    this.mulMat(rotMat);
    this.local2world();

    return this;
  }

  translate(val: number, axis: "x" | "y" | "z") {
    let deltaVal = 0;
    switch (axis) {
      case "x": {
        deltaVal = val - this.transformations.translationX;
        this.transformations.translationX = val;
        break;
      }
      case "y": {
        deltaVal = val - this.transformations.translationY;
        this.transformations.translationY = val;
        break;
      }
      case "z": {
        deltaVal = val - this.transformations.translationZ;
        this.transformations.translationZ = val;
        break;
      }
    }

    const axisVector = this.getAxis(axis);
    const transMat = makeTranslationMatrix(deltaVal, axisVector);
    this.origin = transMat.mulVec(this.origin);
    this.mulMat(transMat);
    return this;
  }

  scale(val: number, axis: "x" | "y" | "z") {
    let deltaVal = 0;
    switch (axis) {
      case "x": {
        deltaVal = val / this.transformations.scaleX;
        this.transformations.scaleX = val;
        break;
      }
      case "y": {
        deltaVal = val / this.transformations.scaleY;
        this.transformations.scaleY = val;
        break;
      }
      case "z": {
        deltaVal = val / this.transformations.scaleZ;
        this.transformations.scaleZ = val;
        break;
      }
    }

    this.world2local();
    const axisVector = this.getAxis(axis);
    const scaleMat = makeScalingMatrix(deltaVal, axisVector);
    this.mulMat(scaleMat);
    this.local2world();

    return this;
  }
}

export class Scene {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.width = canvas.width;
    this.height = canvas.height;
    sharpCanvas(this.canvas);
    this.ctx = canvas.getContext("2d")!;
  }

  private denormalize(val: number, axis: "x" | "y") {
    const length = axis === "x" ? this.width : this.height;

    if (axis === "x") {
      return (length * (val + 1)) / 2;
    } else {
      return this.height - (length * (val + 1)) / 2;
    }
  }

  render(wireframe: Wireframe) {
    const edges = wireframe.edges;
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.strokeStyle =
        "rgb(" +
        (i === 0 ? "255" : "0") +
        "," +
        (i === 1 ? "255" : "0") +
        "," +
        (i === 2 ? "255" : "0") +
        ")";

      const [x, y] = wireframe.axes.getCol(i);
      ctx.moveTo(
        this.denormalize(wireframe.origin.x, "x"),
        this.denormalize(wireframe.origin.y, "y")
      );
      ctx.lineTo(this.denormalize(x, "x"), this.denormalize(y, "y"));
      ctx.stroke();
    }

    ctx.beginPath;
    ctx.strokeStyle = "black";
    for (let i = 0; i < edges.length; i++) {
      const [p1, p2] = edges[i];

      const v1 = wireframe.vertices[p1];
      const v2 = wireframe.vertices[p2];

      ctx.moveTo(this.denormalize(v1.x, "x"), this.denormalize(v1.y, "y"));
      ctx.lineTo(this.denormalize(v2.x, "x"), this.denormalize(v2.y, "y"));
    }
    ctx.stroke();
  }
}
