import React from "react";
import "./GroupCard.css";

function GroupCard({ date, isPrivate, title, memories, likes }) {
  return (
    <div className="group-card">
      <div className="group-info">
        <div className="group-date">
          {date} | {isPrivate ? "비공개" : "공개"}
        </div>
        <div className="group-title">{title}</div>
      </div>
      <div className="group-stats">
        <span className="group-memories">추억 {memories}</span>
        <span className="group-likes">공감 {likes}</span>
      </div>
    </div>
  );
}

export default GroupCard;
