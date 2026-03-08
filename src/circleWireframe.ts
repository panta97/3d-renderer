import { Vector, Wireframe } from "./math";

const radius = 5;
const heightStep = 1;
const angleStep = (15 * Math.PI) / 180;

const vectorArr = [];

let heights = 0;

for (let h = 0; h <= radius * 2; h += heightStep) {
  const relativeHeight = radius - h;
  for (let deg = 0; deg <= Math.PI * 2; deg += angleStep) {
    const relativeRadius = Math.sqrt(
      radius * radius - relativeHeight * relativeHeight
    );
    const x = relativeRadius * Math.cos(deg);
    const y = relativeRadius * Math.sin(deg);
    const z = relativeHeight;
    vectorArr.push(new Vector(x, y, z));
  }
  heights++;
}

const angles = vectorArr.length / heights;

const edges = [];

for (let i = 0; i < heights; i++) {
  for (let j = 0; j < angles; j++) {
    const index = i * angles + j;

    if (j === angles - 1) {
      edges.push([index, i * angles + 0]);
    } else {
      edges.push([index, index + 1]);
    }

    if (i !== heights - 1) {
      edges.push([index, index + angles]);
    }
  }
}

const circleWireframe = new Wireframe(vectorArr, edges, new Vector(0, 0, 0), [
  new Vector(1, 0, 0),
  new Vector(0, 1, 0),
  new Vector(0, 0, 1),
]);

export default circleWireframe;
