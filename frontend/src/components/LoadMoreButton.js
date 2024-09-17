import React from "react";
import "./LoadMoreButton.css";

function LoadMoreButton({ onClick }) {
  return (
    <div className="load-more-container">
      <button id="load-more-btn" onClick={onClick}>
        더보기
      </button>
    </div>
  );
}

export default LoadMoreButton;
