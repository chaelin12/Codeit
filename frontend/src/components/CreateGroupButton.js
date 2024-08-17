// CreateGroupButton.js
import React from "react";
import "./CreateGroupButton.css";

function CreateGroupButton({ onClick }) {
  return (
    <button className="create-group-button" onClick={onClick}>
      그룹 만들기
    </button>
  );
}

export default CreateGroupButton;
