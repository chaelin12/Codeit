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

  // 계산 함수 정의
  const calculateDaysPassed = () => {
    if (!createdAt) {
      console.error("createdAt is not provided or is invalid.");
      return;
    }

    // Date 객체로 변환
    const start = new Date(createdAt);

    // 유효한 날짜인지 확인
    if (isNaN(start.getTime())) {
      console.error("Invalid createdAt date:", createdAt);
      return;
    }

    // 현재 날짜와의 차이를 계산
    const now = new Date();
    const difference = Math.floor((now - start) / (1000 * 60 * 60 * 24));

    // 상태 업데이트
    setDaysPassed(difference);
  };

  useEffect(() => {
    calculateDaysPassed(); // 컴포넌트 마운트 시 초기 계산

    // 다음 24시까지 남은 시간 계산
    const now = new Date();
    const nextMidnight = new Date();
    nextMidnight.setHours(24, 0, 0, 0);
    const timeUntilNextMidnight = nextMidnight - now;

    // 다음 24시에 맞춰 날짜 차이 재계산
    const intervalId = setTimeout(() => {
      calculateDaysPassed(); // 초기 계산
      setInterval(calculateDaysPassed, 1000 * 60 * 60 * 24); // 매일 계산
    }, timeUntilNextMidnight);

    // 컴포넌트 언마운트 시 interval 정리
    return () => clearTimeout(intervalId);
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
