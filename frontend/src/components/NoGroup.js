import React from "react";
import NoGroupImage from "../assets/pictures/nogroup.png";
import FormButton from "./FormButton";
import "./NoGroup.css";

function NoGroup({ onCreateGroup, type }) {
  // Determine the text based on the type prop
  const groupTypeText = type === "private" ? "비공개" : "공개";

  return (
    <div className="no-group-container">
      <img
        src={NoGroupImage}
        alt={`등록된 ${groupTypeText} 그룹이 없습니다.`}
        className="no-group-image"
      />
      <p className="no-group-text">등록된 {groupTypeText} 그룹이 없습니다.</p>
      <p className="no-group-subtext">가장 먼저 그룹을 만들어보세요!</p>
      <FormButton onClick={onCreateGroup}>그룹 만들기</FormButton>
    </div>
  );
}

export default NoGroup;
