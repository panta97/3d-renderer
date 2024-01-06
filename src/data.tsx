import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { Vector } from "./math";

const rootElement = document.getElementById("react-app");

const Stats = () => {
  const [vertices, setVertices] = useState<Vector[]>([]);

  useEffect(() => {
    window.addEventListener("reactEvent", (e: any) => {
      setVertices(e.detail.vertices);
    });
  }, []);

  return (
    <table>
      <thead>
        <tr>
          <th>x</th>
          <th>y</th>
          <th>z</th>
        </tr>
      </thead>
      <tbody>
        {vertices.map((v, idx) => (
          <tr key={idx}>
            <td>{v.x.toFixed(2)}</td>
            <td>{v.y.toFixed(2)}</td>
            <td>{v.z.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <Stats />
    </React.StrictMode>
  );
}
