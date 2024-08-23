import React from "react";
import "./GroupCard.css";

function GroupCard({
  name,
  imageUrl,
  isPublic,
  likeCount,
  badgeCount,
  postCount,
  createdAt,
  introduction,
}) {
  const formatDate = (dateString) => {
    if (!dateString) {
      console.error("startDate is not provided or is invalid.");
      return "Invalid Date";
    }

    // Date 객체로 변환
    const date = new Date(dateString);

    // 유효한 날짜인지 확인
    if (isNaN(date.getTime())) {
      console.error("Invalid date:", dateString);
      return "Invalid Date";
    }

    // "YYYY-MM-DD" 형식으로 변환
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const calculateDaysPassed = (createdAt) => {
    if (!createdAt) {
      console.error("createdAt is not provided or is invalid.");
      return "Invalid Date";
    }

    // Date 객체로 변환
    const start = new Date(createdAt);

    // 유효한 날짜인지 확인
    if (isNaN(start.getTime())) {
      console.error("Invalid createdAt date:", createdAt);
      return "Invalid Date";
    }

    // 현재 날짜와의 차이를 계산
    const now = new Date();
    const difference = Math.floor((now - start) / (1000 * 60 * 60 * 24));

    // D+N 형식으로 반환
    return `D+${difference}`;
  };

  // 디버깅을 위해 startDate를 콘솔에 출력
  console.log("startDate:", createdAt);

  return (
    <div className="group-card">
      <div className="group-card-header">
        {imageUrl && (
          <img src={imageUrl} alt="group" className="group-card-image" />
        )}
        <div className="group-info">
          <div className="group-date">
            <span className="date">{calculateDaysPassed(createdAt)}</span>
            <span className="separator"> | </span>
            <span className="public">{isPublic ? "비공개" : "공개"}</span>
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
