import React from "react";
import "./PostCard.css";

const PostCard = ({
  id,
  nickname,
  title,
  content,
  imageUrl,
  tags,
  location,
  moment,
  likes,
  comments,
  isPublic,
}) => {
  return (
    <div className="post-card">
      <img src={imageUrl} alt={title} className="post-card-image" />
      <div className="post-card-content">
        <h3 className="post-card-title">{title}</h3>
        <p className="post-card-moment">{moment}</p>
        <p className="post-card-location">{location}</p>
        <p className="post-card-content-preview">{content}</p>
        <div className="post-card-info">
          <span className="post-card-nickname">@{nickname}</span>
          <span className="post-card-likes">❤️ {likes}</span>
          <span className="post-card-comments">💬 {comments}</span>
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
};

export default PostCard;
