import React, { useEffect, useState } from "react";
import "./GroupCard.css";

function GroupCard({
  name,
  imageUrl,
  likeCount,
  badgeCount,
  postCount,
  createdAt,
  introduction,
}) {
  const [daysPassed, setDaysPassed] = useState(0);

  const calculateDaysPassed = () => {
    if (!createdAt) {
      console.error("createdAt is not provided or is invalid.");
      return;
    }

    const start = new Date(createdAt);
    if (isNaN(start.getTime())) {
      console.error("Invalid createdAt date:", createdAt);
      return;
    }

    const now = new Date();
    const difference = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    setDaysPassed(difference);
  };

  useEffect(() => {
    calculateDaysPassed(); // 초기 계산

    const intervalId = setInterval(() => {
      calculateDaysPassed();
    }, 1000); // 1초마다 호출

    // 컴포넌트 언마운트 시 interval 정리
    return () => clearInterval(intervalId);
  }, [createdAt]);

  return (
    <div className="group-card">
      <div className="group-card-header">
        {imageUrl && (
          <img src={imageUrl} alt="group" className="group-card-image" />
        )}
        <div className="group-info">
          <div className="group-date">
            <span className="date">D+{daysPassed}</span>
            <span className="separator"> | </span>
            <span className="public">공개</span>
          </div>
          <div className="group-title">{name}</div>
          <div className="group-introduction">{introduction}</div>
        </div>
      </div>
      <div className="group-stats">
        <span className="group-badge">획득 배지 {badgeCount}</span>
        <span className="group-memories">추억 {postCount}</span>
        <span className="group-likes">공감 {likeCount}</span>
      </div>
    </div>
  );
}

export default GroupCard;
