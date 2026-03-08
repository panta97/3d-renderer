const radius = 5;
const step = 0.5;
const angleStep = (5 * Math.PI) / 180;

// 0 -> 5
// 1 -> 4
// 2 -> 3
// 3 -> 2

const vectorArr = [];

for (let h = 0; h <= radius * 2; h += step) {
  const relativeHeight = radius - h;
  for (let deg = 0; deg < Math.PI * 2; deg += angleStep) {
    const relativeRadius = Math.sqrt(
      radius * radius - relativeHeight * relativeHeight
    );
    const x = relativeRadius * Math.cos(deg);
    const y = relativeRadius * Math.sin(deg);
    const z = relativeHeight;
    vectorArr.push([x, y, z]);
  }
}

const angles = Math.round((Math.PI * 2) / angleStep) + 1;
const heights = Math.round((radius * 2) / step) + 1;

const edges = [];
// console.log({ m });
// console.log({ heights });

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

console.log(vectorArr.length);
