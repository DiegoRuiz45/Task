import React from "react";
import "./Loader.css";

export default function Loader() {
  return (
    <div className="loader-wrapper" role="presentation">
      <div className="loader" role="status" aria-label="Cargando contenido">
        <div className="head"></div>
        <div className="flames">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="particle"></div>
          ))}
        </div>
        <div className="eye"></div>
        <div className="loading-text">
          Cargando<span className="dots"></span>
        </div>
      </div>
    </div>
  );
}
