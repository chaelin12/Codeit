import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./GroupCard.css";

function GroupCard({
  id,
  name,
  imageUrl,
  likeCount,
  badgeCount,
  postCount,
  createdAt,
  introduction,
  isPublic,
  onClick,
}) {
  const [daysPassed, setDaysPassed] = useState(0);
  const navigate = useNavigate();

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

  const handleGroupCardClick = () => {
    // 그룹 ID를 포함하여 GroupDetail 페이지로 이동
    navigate(`/GroupDetail/${id}`);
  };

  return (
    <div className="group-card" onClick={onClick}>
      <div className="group-card-header">
        {imageUrl && (
          <img src={imageUrl} alt="group" className="group-card-image" />
        )}
        <div className="group-info">
          <div className="group-date">
            <span className="date">D+{daysPassed}</span>
            <span className="separator"> | </span>
            <span className="post-card-public-status">
              {isPublic ? "공개" : "비공개"}
            </span>
          </div>
          <div className="group-title" onClick={() => handleGroupCardClick(id)}>
            {name}
          </div>
          <div className="group-introduction">{introduction}</div>
        </div>
        <div className="group-stats">
          <span className="group-badge">획득 배지 {badgeCount}</span>
          <span className="group-memories">추억 {postCount}</span>
          <span className="group-likes">공감 {likeCount}</span>
        </div>
      </div>
    </div>
  );
}

export default GroupCard;
