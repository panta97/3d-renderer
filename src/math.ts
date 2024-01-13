import {
  getLocal2WorldMatrix,
  getWorld2LocalMatrix,
  makeRotationMatrix,
  makeScalingMatrix,
  makeTranslationMatrix,
} from "./transformations";
import { axisType } from "./types";
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
    const [x, y, z, w] = [
      this.arr[col],
      this.arr[col + 4],
      this.arr[col + 8],
      this.arr[col + 12],
    ];

    return new Vector(x, y, z, w);
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

  dotProd(v: Vector) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  mag() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }
}

export class Wireframe {
  vertices: Vector[];
  edges: number[][];
  origin: Vector;
  axes: Vector[];
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
    axes: Vector[]
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

  verticesMulMat(matrix: Matrix4) {
    const vertices: Vector[] = [];
    for (let i = 0; i < this.vertices.length; i++) {
      const vertex = this.vertices[i];
      vertices.push(matrix.mulVec(vertex));
    }
    this.vertices = vertices;
    return this;
  }

  axesMulMat(matrix: Matrix4) {
    const axes: Vector[] = [];
    for (let i = 0; i < this.axes.length; i++) {
      const axis = this.axes[i];
      axes.push(matrix.mulVec(axis));
    }
    this.axes = axes;
    return this;
  }

  rotate(angle: number, axis: axisType) {
    let deltaAngle = 0;
    let axisVector;
    switch (axis) {
      case "x":
        deltaAngle = angle - this.transformations.rotationX;
        this.transformations.rotationX = angle;
        axisVector = this.axes[0];
        break;
      case "y":
        deltaAngle = angle - this.transformations.rotationY;
        this.transformations.rotationY = angle;
        axisVector = this.axes[1];
        break;
      case "z":
        deltaAngle = angle - this.transformations.rotationZ;
        this.transformations.rotationZ = angle;
        axisVector = this.axes[2];
        break;
    }

    this.verticesMulMat(getWorld2LocalMatrix(this.origin));
    const rotMat = makeRotationMatrix(deltaAngle, axisVector);
    this.axesMulMat(rotMat);
    this.verticesMulMat(rotMat);
    this.verticesMulMat(getLocal2WorldMatrix(this.origin));

    return this;
  }

  translate(val: number, axis: axisType) {
    let deltaVal = 0;
    let axisVector;
    switch (axis) {
      case "x": {
        deltaVal = val - this.transformations.translationX;
        this.transformations.translationX = val;
        axisVector = this.axes[0];
        break;
      }
      case "y": {
        deltaVal = val - this.transformations.translationY;
        this.transformations.translationY = val;
        axisVector = this.axes[1];
        break;
      }
      case "z": {
        deltaVal = val - this.transformations.translationZ;
        this.transformations.translationZ = val;
        axisVector = this.axes[2];
        break;
      }
    }

    const transMat = makeTranslationMatrix(deltaVal, axisVector);
    this.origin = transMat.mulVec(this.origin);
    this.verticesMulMat(transMat);
    return this;
  }

  scale(val: number, axis: axisType) {
    let deltaVal = 0;
    let axisVector;
    switch (axis) {
      case "x": {
        deltaVal = val / this.transformations.scaleX;
        this.transformations.scaleX = val;
        axisVector = this.axes[0];
        break;
      }
      case "y": {
        deltaVal = val / this.transformations.scaleY;
        this.transformations.scaleY = val;
        axisVector = this.axes[1];
        break;
      }
      case "z": {
        deltaVal = val / this.transformations.scaleZ;
        this.transformations.scaleZ = val;
        axisVector = this.axes[2];
        break;
      }
    }

    this.verticesMulMat(getWorld2LocalMatrix(this.origin));
    const scaleMat = makeScalingMatrix(deltaVal, axisVector);
    this.verticesMulMat(scaleMat);
    this.verticesMulMat(getLocal2WorldMatrix(this.origin));

    return this;
  }
}

export class Camera {
  origin: Vector;
  axes: Vector[];

  transformations = {
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    translationX: 0,
    translationY: 0,
    translationZ: 0,
  };

  constructor(origin: Vector, axes: Vector[]) {
    this.origin = origin;
    this.axes = axes;
  }

  clone() {
    return new Camera(this.origin, this.axes);
  }

  axesMulMat(matrix: Matrix4) {
    const axes: Vector[] = [];
    for (let i = 0; i < this.axes.length; i++) {
      const axis = this.axes[i];
      axes.push(matrix.mulVec(axis));
    }
    this.axes = axes;
    return this;
  }

  rotate(angle: number, axis: axisType) {
    let deltaAngle = 0;
    let axisVector;
    switch (axis) {
      case "x":
        deltaAngle = angle - this.transformations.rotationX;
        this.transformations.rotationX = angle;
        axisVector = this.axes[0];
        break;
      case "y":
        deltaAngle = angle - this.transformations.rotationY;
        this.transformations.rotationY = angle;
        axisVector = this.axes[1];
        break;
      case "z":
        deltaAngle = angle - this.transformations.rotationZ;
        this.transformations.rotationZ = angle;
        axisVector = this.axes[2];
        break;
    }

    const rotMat = makeRotationMatrix(deltaAngle, axisVector);
    this.axesMulMat(rotMat);
    return this;
  }

  translate(val: number, axis: axisType) {
    let deltaVal = 0;
    let axisVector;
    switch (axis) {
      case "x": {
        deltaVal = val - this.transformations.translationX;
        this.transformations.translationX = val;
        axisVector = this.axes[0];
        break;
      }
      case "y": {
        deltaVal = val - this.transformations.translationY;
        this.transformations.translationY = val;
        axisVector = this.axes[1];
        break;
      }
      case "z": {
        deltaVal = val - this.transformations.translationZ;
        this.transformations.translationZ = val;
        axisVector = this.axes[2];
        break;
      }
    }

    const transMat = makeTranslationMatrix(deltaVal, axisVector);
    this.origin = transMat.mulVec(this.origin);
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

      const axisVector = wireframe.axes[i];
      ctx.moveTo(
        this.denormalize(wireframe.origin.x, "x"),
        this.denormalize(wireframe.origin.y, "y")
      );
      ctx.lineTo(
        this.denormalize(axisVector.x, "x"),
        this.denormalize(axisVector.y, "y")
      );
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
