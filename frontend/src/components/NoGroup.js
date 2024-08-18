import React from "react";
import NoGroupImage from "../assets/pictures/nogroup.png";
import "./NoGroup.css";

function NoGroup({ onCreateGroup }) {
  return (
    <div className="no-group-container">
      <img
        src={NoGroupImage}
        alt="등록된 그룹이 없습니다."
        className="no-group-image"
      />
      <p className="no-group-text">등록된 공개 그룹이 없습니다.</p>
      <p className="no-group-subtext">가장 먼저 그룹을 만들어보세요!</p>
      <button className="create-group-button" onClick={onCreateGroup}>
        그룹 만들기
      </button>
    </div>
  );
}

export default NoGroup;
