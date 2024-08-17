import React, { useState } from "react";
import "./ButtonGroup.css";

function ButtonGroup() {
  const [activeButton, setActiveButton] = useState(null);

  const handleButtonClick = (buttonType) => {
    setActiveButton(buttonType);
  };

  return (
    <div className="button-group">
      <button
        id="public-btn"
        className={activeButton === "public" ? "active" : ""}
        onClick={() => handleButtonClick("public")}
      >
        공개
      </button>
      <button
        id="private-btn"
        className={activeButton === "private" ? "active" : ""}
        onClick={() => handleButtonClick("private")}
      >
        비공개
      </button>
    </div>
  );
}

export default ButtonGroup;
