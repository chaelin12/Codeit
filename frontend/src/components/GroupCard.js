import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import flower from "../assets/pictures/flower.png";
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
    calculateDaysPassed();
  }, [createdAt]);

  const handleGroupCardClick = () => {
    if (isPublic) {
      navigate(`/GroupDetail/${id}`);
    } else {
      navigate(`/AccessPrivate/${id}`);
    }
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
            {name}
          </div>
          {isPublic && <div className="group-introduction">{introduction}</div>}
        </div>

        <div className="group-stats">
          {isPublic && (
            <div className="group-stats-item">
              <span className="label">획득 배지</span>
              <span className="count">{badgeCount}</span>
            </div>
          )}
          <div className="group-stats-item">
            <span className="label">추억</span>
            <span className="count">{postCount}</span>
          </div>
          <div className="group-stats-item">
            <span className="label">공감</span>
            <span className="count">
              <img src={flower} alt="like-icon" />
              {likeCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GroupCard;
