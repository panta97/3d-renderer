export const sharpCanvas = (canvas: HTMLCanvasElement) => {
  canvas.style.width = `${canvas.width}px`;
  canvas.style.height = `${canvas.height}px`;

  const dpi = window.devicePixelRatio + 1;
  canvas.width = canvas.width * dpi;
  canvas.height = canvas.height * dpi;

  canvas.getContext("2d")?.scale(dpi, dpi);
};
