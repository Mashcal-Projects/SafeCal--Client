import React from "react";
import "../Styling/loader.scss";

export  const LoaderComp = ( {className = ''}) => {
  return (
    <div className={`loader-overlay ${className}`}>
      <div className="loader-animation"></div>
    </div>
  );
};
