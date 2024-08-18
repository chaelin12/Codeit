import React from "react";
import "./ButtonGroup.css";

function ButtonGroup({ activeButton, onPublicClick, onPrivateClick }) {
  return (
    <div className="button-group">
      <button
        id="public-btn"
        className={activeButton === "public" ? "active" : ""}
        onClick={onPublicClick} // 부모 컴포넌트에서 관리하는 onPublicClick 핸들러 호출
      >
        공개
      </button>
      <button
        id="private-btn"
        className={activeButton === "private" ? "active" : ""}
        onClick={onPrivateClick} // 부모 컴포넌트에서 관리하는 onPrivateClick 핸들러 호출
      >
        비공개
      </button>
    </div>
  );
}

export default ButtonGroup;
