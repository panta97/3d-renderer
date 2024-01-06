import dat from "dat.gui";
import { Matrix4, Scene, Vector, Wireframe } from "./math";
import "./style.css";

const canvas = document.getElementById("plane")! as HTMLCanvasElement;

const cube = new Wireframe(
  [
    new Vector(1, 1, 3),
    new Vector(-1, 1, 3),
    new Vector(-1, -1, 3),
    new Vector(1, -1, 3),
    new Vector(1, 1, 5),
    new Vector(-1, 1, 5),
    new Vector(-1, -1, 5),
    new Vector(1, -1, 5),
  ],
  [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 4],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],
  ],
  new Vector(0, 0, 4),
  new Matrix4(
    [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ].flatMap((e) => e)
  )
);

const getProjectionMatrix = (fov: number) => {
  const fovRad = (fov * Math.PI) / 180;
  // fov = field of view angle
  const arr2d = [
    [1 / Math.tan(fovRad * 0.5), 0, 0, 0],
    [0, 1 / Math.tan(fovRad * 0.5), 0, 0],
    [0, 0, 1, 0],
    [0, 0, 1, 0], // store vector's original z value
  ];

  return new Matrix4(arr2d.flatMap((e) => e));
};

const mulProjMatByZ = (projMat: Matrix4, wireframe: Wireframe) => {
  const vertices: Vector[] = [];
  for (let i = 0; i < wireframe.vertices.length; i++) {
    const vertex = wireframe.vertices[i];
    const vResult = projMat.mulVec(vertex);
    vResult.x /= vResult.w;
    vResult.y /= vResult.w;

    vertices.push(vResult);
  }

  const l2wMat = wireframe.getLocal2WorldMat();

  let axes: Matrix4;
  const axesArr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  for (let i = 0; i < 3; i++) {
    const [x, y, z, w] = wireframe.axes.getCol(i);
    const axisVector = l2wMat.mulVec(new Vector(x, y, z, w));
    const vResult = projMat.mulVec(axisVector);
    vResult.x /= vResult.w;
    vResult.y /= vResult.w;
    axesArr[i] = vResult.x;
    axesArr[i + 4] = vResult.y;
    axesArr[i + 8] = vResult.z;
    axesArr[i + 12] = vResult.w;
  }
  axes = new Matrix4(axesArr);

  const origin = projMat.mulVec(wireframe.origin);
  origin.x /= origin.w;
  origin.y /= origin.w;

  wireframe.vertices = vertices;
  wireframe.origin = origin;
  wireframe.axes = axes;

  return wireframe;
};

const scene = new Scene(canvas);

const settings = {
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
  translateX: 0,
  translateY: 0,
  translateZ: 0,
  scaleX: 1,
  scaleY: 1,
  scaleZ: 1,
  fov: 90,
};

const gui = new dat.GUI();

const render = (type: keyof typeof settings | "none") => {
  let trasnCube = cube;

  switch (type) {
    case "rotateX":
      trasnCube = trasnCube.rotate(settings.rotateX, "x");
      break;
    case "rotateY":
      trasnCube = trasnCube.rotate(settings.rotateY, "y");
      break;
    case "rotateZ":
      trasnCube = trasnCube.rotate(settings.rotateZ, "z");
      break;
    case "translateX":
      trasnCube = trasnCube.translate(settings.translateX, "x");
      break;
    case "translateY":
      trasnCube = trasnCube.translate(settings.translateY, "y");
      break;
    case "translateZ":
      trasnCube = trasnCube.translate(settings.translateZ, "z");
      break;
    case "scaleX":
      trasnCube = trasnCube.scale(settings.scaleX, "x");
      break;
    case "scaleY":
      trasnCube = trasnCube.scale(settings.scaleY, "y");
      break;
    case "scaleZ":
      trasnCube = trasnCube.scale(settings.scaleZ, "z");
      break;
  }

  // trasnCube.axes.print();

  const projMat = getProjectionMatrix(settings.fov);
  const projCube = mulProjMatByZ(projMat, trasnCube.clone());

  const reactEvent = new CustomEvent("reactEvent", {
    detail: {
      vertices: trasnCube?.vertices,
      // axes: trasnCube?.axes,
    },
  });
  window.dispatchEvent(reactEvent);
  scene.render(projCube);
};

render("none");

gui
  .add(settings, "rotateX")
  .min(0)
  .max(360)
  .onChange(() => render("rotateX"));
gui
  .add(settings, "rotateY")
  .min(0)
  .max(360)
  .onChange(() => render("rotateY"));
gui
  .add(settings, "rotateZ")
  .min(0)
  .max(360)
  .onChange(() => render("rotateZ"));
gui
  .add(settings, "translateX")
  .min(-10)
  .max(10)
  .onChange(() => render("translateX"));
gui
  .add(settings, "translateY")
  .min(-10)
  .max(10)
  .onChange(() => render("translateY"));
gui
  .add(settings, "translateZ")
  .min(-10)
  .max(10)
  .onChange(() => render("translateZ"));
gui
  .add(settings, "scaleX")
  .min(0.1)
  .max(3)
  .onChange(() => render("scaleX"));
gui
  .add(settings, "scaleY")
  .min(0.1)
  .max(3)
  .onChange(() => render("scaleY"));
gui
  .add(settings, "scaleZ")
  .min(0.1)
  .max(3)
  .onChange(() => render("scaleZ"));
gui
  .add(settings, "fov")
  .min(15)
  .max(180)
  .onChange(() => render("none"));
