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
  const [daysPassed, setDaysPassed] = useState(null);
  const navigate = useNavigate();

  const calculateDaysPassed = () => {
    if (!createdAt) {
      console.warn("createdAt is not provided.");
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
    calculateDaysPassed(); // Calculate on mount and when createdAt changes
  }, [createdAt]);

  const handleGroupCardClick = () => {
    navigate(`/GroupDetail/${id}`);
  };

  return (
    <div className="group-card" onClick={onClick || handleGroupCardClick}>
      <div className="group-card-header">
        {isPublic && imageUrl && (
          <img src={imageUrl} alt="group" className="group-card-image" />
        )}
        <div className="group-info">
          <div className="group-date">
            {daysPassed !== null && (
              <>
                <span className="date">D+{daysPassed}</span>
                <span className="separator"> | </span>
              </>
            )}
            <span className="group-card-public-status">
              {isPublic ? "공개" : "비공개"}
            </span>
          </div>
          <div className="group-title" onClick={handleGroupCardClick}>
            {name} {/* 항상 보이도록 수정 */}
          </div>
          {isPublic && <div className="group-introduction">{introduction}</div>}
        </div>
        <div className="group-stats">
          {isPublic && (
            <span className="group-badges">획득 배지 {badgeCount}</span>
          )}
          <span className="group-memories">추억 {postCount}</span>
          <span className="group-likes">공감 {likeCount}</span>
        </div>
      </div>
    </div>
  );
}

export default GroupCard;
