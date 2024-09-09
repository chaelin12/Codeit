import React from "react";
import { useNavigate } from "react-router-dom";
import bubble from "../assets/pictures/bubble.png";
import flower from "../assets/pictures/flower.png";
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
      <div className="post-card-header">
        <img src={imageUrl} alt={title} className="post-card-image" />
        <div className="post-info">
          <span className="post-card-nickname">{nickname} </span>
          <span className="separator"> | </span>
          <span className="post-card-public-status">
            {isPublic ? "공개" : "비공개"}
          </span>
        </div>
        <div className="post-card-title" onClick={handleTitleClick}>
          {title}
        </div>

        <div className="post-card-tags">
          {tags.map((tag, index) => (
            <span key={index} className="post-card-tag">
              #{tag}
            </span>
          ))}
        </div>
        <div className="post-card-more">
          <div className="post-card-time">
            <span className="post-card-location">{location}</span>
            <span className="Delimiter"> · </span>
            <span className="post-moment">
              {new Date(moment).toISOString().slice(2, 10).replace(/-/g, ".")}
            </span>
          </div>
          <div className="post-card-stats">
            <img src={flower}></img>
            <span className="post-card-likeCount"> {likeCount}</span>
            <img src={bubble}></img>
            <span className="post-card-commentCount">{commentCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
export default PostCard;
