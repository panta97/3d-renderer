import { Matrix4, Vector } from "./math";

export const getRotationXMatrix = (angleDeg: number) => {
  const rad = (angleDeg * Math.PI) / 180;
  const arr2d = [
    [1, 0, 0, 0],
    [0, Math.cos(rad), -Math.sin(rad), 0],
    [0, Math.sin(rad), Math.cos(rad), 0],
    [0, 0, 0, 1],
  ];
  return new Matrix4(arr2d.flatMap((e) => e));
};

export const getRotationYMatrix = (angleDeg: number) => {
  const rad = (angleDeg * Math.PI) / 180;
  const arr2d = [
    [Math.cos(rad), 0, Math.sin(rad), 0],
    [0, 1, 0, 0],
    [-Math.sin(rad), 0, Math.cos(rad), 0],
    [0, 0, 0, 1],
  ];
  return new Matrix4(arr2d.flatMap((e) => e));
};

export const getRotationZMatrix = (angleDeg: number) => {
  const rad = (angleDeg * Math.PI) / 180;
  const arr2d = [
    [Math.cos(rad), -Math.sin(rad), 0, 0],
    [Math.sin(rad), Math.cos(rad), 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ];
  return new Matrix4(arr2d.flatMap((e) => e));
};

export const getTranslationXMatrix = (val: number) => {
  const arr2d = [
    [1, 0, 0, val],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ];
  return new Matrix4(arr2d.flatMap((e) => e));
};

export const getTranslationYMatrix = (val: number) => {
  const arr2d = [
    [1, 0, 0, 0],
    [0, 1, 0, val],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ];
  return new Matrix4(arr2d.flatMap((e) => e));
};

export const getTranslationZMatrix = (val: number) => {
  const arr2d = [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, val],
    [0, 0, 0, 1],
  ];
  return new Matrix4(arr2d.flatMap((e) => e));
};

export const getScaleXMatrix = (val: number) => {
  const arr2d = [
    [val, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ];
  return new Matrix4(arr2d.flatMap((e) => e));
};

export const getScaleYMatrix = (val: number) => {
  const arr2d = [
    [1, 0, 0, 0],
    [0, val, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ];
  return new Matrix4(arr2d.flatMap((e) => e));
};

export const getScaleZMatrix = (val: number) => {
  const arr2d = [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, val, 0],
    [0, 0, 0, 1],
  ];
  return new Matrix4(arr2d.flatMap((e) => e));
};

export const makeRotationMatrix = (angle: number, a: Vector) => {
  const angleRad = (angle * Math.PI) / 180;
  const c = Math.cos(angleRad);
  const s = Math.sin(angleRad);
  const d = 1 - c;

  const x = a.x * d;
  const y = a.y * d;
  const z = a.z * d;

  const axay = x * a.y;
  const axaz = x * a.z;
  const ayaz = y * a.z;

  const arr2d = [
    [c + x * a.x, axay - s * a.z, axaz + s * a.y, 0],
    [axay + s * a.z, c + y * a.y, ayaz - s * a.x, 0],
    [axaz - s * a.y, ayaz + s * a.x, c + z * a.z, 0],
    [0, 0, 0, 1],
  ];
  return new Matrix4(arr2d.flatMap((e) => e));
};

export const makeTranslationMatrix = (t: number, a: Vector) => {
  const arr2d = [
    [1, 0, 0, a.x * t],
    [0, 1, 0, a.y * t],
    [0, 0, 1, a.z * t],
    [0, 0, 0, 1],
  ];

  return new Matrix4(arr2d.flatMap((e) => e));
};

export const makeScalingMatrix = (s: number, a: Vector) => {
  const d = s - 1;

  const x = a.x * d;
  const y = a.y * d;
  const z = a.z * d;

  const arr2d = [
    [x * a.x + 1, x * a.y, x * a.z, 0],
    [y * a.x, y * a.y + 1, y * a.z, 0],
    [z * a.x, z * a.y, z * a.z + 1, 0],
    [0, 0, 0, 1],
  ];

  return new Matrix4(arr2d.flatMap((e) => e));
};
