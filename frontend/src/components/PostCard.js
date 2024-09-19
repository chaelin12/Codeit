import axios from "axios"; // Axios to fetch the isPublic value
import React, { useEffect, useState } from "react";
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
  isPublic: initialIsPublic, // Initial value for isPublic
  createdAt,
}) {
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const navigate = useNavigate();

  // Fetch isPublic value from the API
  useEffect(() => {
    const fetchIsPublic = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_USER}/posts/${id}/is-public`,
          {
            withCredentials: true,
          }
        );

        setIsPublic(response.data.isPublic); // Update the state with the fetched value
      } catch (error) {
        console.error("Failed to fetch post visibility:", error);
      }
    };
    fetchIsPublic();
  }, [id]);

  const handleTitleClick = () => {
    if (isPublic) {
      navigate(`/PostDetail/${id}`);
    } else {
      navigate(`/accessPrivatepost/${id}`); // Redirect to AccessPrivate page for private posts
    }
  };

  return (
    <div className="post-card">
      <div className="post-card-header">
        {/* Conditionally render the image only if isPublic is true */}
        {isPublic && imageUrl && (
          <img src={imageUrl} alt={title} className="post-card-image" />
        )}

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

        {/* Conditionally render the tags only if isPublic is true */}
        {isPublic && (
          <div className="post-card-tags">
            {tags.map((tag, index) => (
              <span key={index} className="post-card-tag">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="post-card-more">
          {/* Conditionally render the location and moment only if isPublic is true */}
          {isPublic && (
            <div className="post-card-time">
              <span className="post-card-location">{location}</span>
              <span className="Delimiter"> · </span>
              <span className="post-moment">
                {new Date(moment).toISOString().slice(2, 10).replace(/-/g, ".")}
              </span>
            </div>
          )}

          <div className="post-card-stats">
            <img src={flower} alt="like-icon" />
            <span className="post-card-likeCount"> {likeCount}</span>
            <img src={bubble} alt="comment-icon" />
            <span className="post-card-commentCount">{commentCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostCard;
