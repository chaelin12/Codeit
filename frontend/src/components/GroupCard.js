import React from "react";
import "./GroupCard.css";

function GroupCard({
  startDate,
  isPrivate,
  title,
  memories,
  likes,
  badge,
  imageUrl,
  introduction,
}) {
  const calculateDaysPassed = (startDate) => {
    const start = new Date(startDate);
    const now = new Date();
    const difference = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    return `D+${difference}`;
  };

  return (
    <div className="group-card">
      <div className="group-card-header">
        {imageUrl && (
          <img src={imageUrl} alt="group" className="group-card-image" />
        )}
        <div className="group-info">
          <div className="group-date">
            <span className="date">{calculateDaysPassed(startDate)}</span>
            <span className="separator"> | </span>
            <span className="private">{isPrivate ? "비공개" : "공개"}</span>
          </div>
          <div className="group-title">{title}</div>
          <div className="group-introduction">{introduction}</div>
        </div>
      </div>
      <div className="group-stats">
        {badge && <div className="group-badge">획득 배지 {badge}</div>}
        <span className="group-memories">추억 {memories}</span>
        <span className="group-likes">공감 {likes}</span>
      </div>
    </div>
  );
}

export default GroupCard;
