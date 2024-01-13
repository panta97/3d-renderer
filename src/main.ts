import dat from "dat.gui";
import { Camera, Matrix4, Scene, Vector, Wireframe } from "./math";
import "./style.css";
import {
  getLocal2WorldMatrix,
  getWorld2LocalMatrix,
  getWorld2LocalRotMatrix,
} from "./transformations";

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
  [new Vector(1, 0, 0), new Vector(0, 1, 0), new Vector(0, 0, 1)]
);

const camera = new Camera(new Vector(0, 0, 0), [
  new Vector(1, 0, 0),
  new Vector(0, 1, 0),
  new Vector(0, 0, 1),
]);

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

const mulProjMatByZ = (
  projMat: Matrix4,
  wireframe: Wireframe,
  camera: Camera
) => {
  const l2wMat = getLocal2WorldMatrix(wireframe.origin);
  wireframe = wireframe.axesMulMat(l2wMat);

  // transform wireframe world coords to camera local coords
  const camWorld2LocalMat = getWorld2LocalMatrix(camera.origin);
  wireframe.verticesMulMat(camWorld2LocalMat);
  wireframe.axesMulMat(camWorld2LocalMat);
  wireframe.origin = camWorld2LocalMat.mulVec(wireframe.origin);

  // rotate wireframe world coords to camera local axes
  for (let i = 0; i < wireframe.vertices.length; i++) {
    const vertex = wireframe.vertices[i];
    wireframe.vertices[i] = getWorld2LocalRotMatrix(camera.axes, vertex);
  }
  for (let i = 0; i < wireframe.axes.length; i++) {
    const axis = wireframe.axes[i];
    wireframe.axes[i] = getWorld2LocalRotMatrix(camera.axes, axis);
  }
  wireframe.origin = getWorld2LocalRotMatrix(camera.axes, wireframe.origin);

  const vertices: Vector[] = [];
  for (let i = 0; i < wireframe.vertices.length; i++) {
    const vertex = wireframe.vertices[i];
    const vResult = projMat.mulVec(vertex);
    vResult.x /= vResult.w;
    vResult.y /= vResult.w;

    vertices.push(vResult);
  }

  for (let i = 0; i < wireframe.axes.length; i++) {
    const vResult = projMat.mulVec(wireframe.axes[i]);
    vResult.x /= vResult.w;
    vResult.y /= vResult.w;
    wireframe.axes[i] = vResult;
  }

  const origin = projMat.mulVec(wireframe.origin);
  origin.x /= origin.w;
  origin.y /= origin.w;

  wireframe.vertices = vertices;
  wireframe.origin = origin;

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
  camRotateX: 0,
  camRotateY: 0,
  camRotateZ: 0,
  camTranslateX: 0,
  camTranslateY: 0,
  camTranslateZ: 0,
  fov: 90,
};

const gui = new dat.GUI();

const render = (type: keyof typeof settings | "none") => {
  let trasnCube = cube;
  let transCamera = camera;

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
    case "camRotateX":
      transCamera = transCamera.rotate(settings.camRotateX, "x");
      break;
    case "camRotateY":
      transCamera = transCamera.rotate(settings.camRotateY, "y");
      break;
    case "camRotateZ":
      transCamera = transCamera.rotate(settings.camRotateZ, "z");
      break;
    case "camTranslateX":
      transCamera = transCamera.translate(settings.camTranslateX, "x");
      break;
    case "camTranslateY":
      transCamera = transCamera.translate(settings.camTranslateY, "y");
      break;
    case "camTranslateZ":
      transCamera = transCamera.translate(settings.camTranslateZ, "z");
      break;
  }

  const projMat = getProjectionMatrix(settings.fov);
  const projCube = mulProjMatByZ(
    projMat,
    trasnCube.clone(),
    transCamera.clone()
  );

  // const reactEvent = new CustomEvent("reactEvent", {
  //   detail: {
  //     vertices: trasnCube?.vertices,
  //   },
  // });
  // window.dispatchEvent(reactEvent);
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
gui
  .add(settings, "camRotateX")
  .min(0)
  .max(360)
  .onChange(() => render("camRotateX"));
gui
  .add(settings, "camRotateY")
  .min(0)
  .max(360)
  .onChange(() => render("camRotateY"));
gui
  .add(settings, "camRotateZ")
  .min(0)
  .max(360)
  .onChange(() => render("camRotateZ"));
gui
  .add(settings, "camTranslateX")
  .min(-10)
  .max(10)
  .onChange(() => render("camTranslateX"));
gui
  .add(settings, "camTranslateY")
  .min(-10)
  .max(10)
  .onChange(() => render("camTranslateY"));
gui
  .add(settings, "camTranslateZ")
  .min(-10)
  .max(10)
  .onChange(() => render("camTranslateZ"));
