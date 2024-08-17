import React from "react";
import "./Button.css"; // 버튼에 적용할 스타일

function Button({ onClick, type = "button", children }) {
  return (
    <button className="submit-button" type={type} onClick={onClick}>
      {children}
    </button>
  );
}

export default Button;
