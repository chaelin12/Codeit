import React from "react";
import "./PostCard.css"; // 스타일은 따로 지정

function PostCard({ post }) {
  return (
    <div className="post-card">
      <img src={post.imageUrl} alt={post.title} className="post-image" />
      <div className="post-content">
        <div className="post-header">
          <span className="nickname">{post.nickname}</span>
          <span className="public-status">
            {post.isPublic ? "공개" : "비공개"}
          </span>
        </div>
        <h2 className="post-title">{post.title}</h2>
        <p className="post-text">{post.content}</p>
        <div className="post-tags">
          {post.tags.map((tag, index) => (
            <span key={index} className="tag">
              #{tag}
            </span>
          ))}
        </div>
        <div className="post-footer">
          <span className="location">{post.location}</span>
          <span className="moment">{post.moment}</span>
        </div>
        <div className="post-stats">
          <span className="likes">🌟 {post.likes}</span>
          <span className="comments">💬 {post.comments}</span>
        </div>
      </div>
    </div>
  );
}

export default PostCard;
