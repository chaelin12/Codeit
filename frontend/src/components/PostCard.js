import React from "react";
import { useNavigate } from "react-router-dom";
import "./PostCard.css";

function PostCard({
  id,
  nickname,
  title,
  imageUrl,
  tags,
  location,
  moment,
  likeCount,
  commentCount,
  isPublic,
  createdAt,
}) {
  const navigate = useNavigate();

  const handleTitleClick = () => {
    navigate(`/PostDetail/${id}`); // 각 포스트의 id를 기반으로 이동
  };

  return (
    <div className="post-card">
      <img src={imageUrl} alt={title} className="post-card-image" />
      <div className="post-card-content">
        <div className="post-card-header">
          <span className="post-card-nickname">{nickname}</span>
          <span className="post-card-public-status">
            {isPublic ? "공개" : "비공개"}
          </span>
        </div>
        <h3 className="post-card-title" onClick={handleTitleClick}>
          {title}
        </h3>
        <p className="post-card-moment">{moment}</p>
        <p className="post-card-location">{location}</p>
        <span className="post-card-createdAt">{createdAt}</span>
        <div className="post-card-info">
          <span className="post-card-nickname">{nickname}</span>
          <span className="post-card-likeCount">❤️ {likeCount}</span>
          <span className="post-card-commentCount">💬 {commentCount}</span>
        </div>
        <div className="post-card-tags">
          {tags.map((tag, index) => (
            <span key={index} className="post-card-tag">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PostCard;
