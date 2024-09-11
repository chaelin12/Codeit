import React, { useState } from "react";
import Button from "../components/FormButton";
import "./PostComment.css"; // Updated CSS file

const PostComment = ({ isOpen, onClose, postId, postDetails = {} }) => {
  const [nickname, setNickname] = useState("");
  const [comment, setComment] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Default values in case postDetails is not properly passed
    const {
      title = "",
      imageUrl = "",
      tags = [],
      location = "",
      moment = new Date().toISOString().split("T")[0], // Default to today's date
      isPublic = true,
    } = postDetails;

    const commentData = {
      nickname,
      title,
      content: comment,
      postPassword: password,
      imageUrl,
      tags,
      location,
      moment,
      isPublic,
    };

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(commentData),
      });

      if (!response.ok) {
        const errorMessage = await response.text(); // Get error message from response
        throw new Error(`Failed to submit comment: ${errorMessage}`);
      }

      const result = await response.json();
      console.log("Comment submitted:", result);
      onClose(); // Close the modal after successful submission
    } catch (error) {
      console.error("Error submitting comment:", error.message);
    }
  };

  if (!isOpen) return null; // Don't render the modal if it's not open

  return (
    <div className="comment-modal-overlay" onClick={onClose}>
      <div
        className="comment-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button className="modal-close-button" onClick={onClose}>
          &times;
        </button>
        <h2>댓글 등록</h2>
        <form onSubmit={handleSubmit}>
          <label>
            닉네임
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임을 입력해 주세요."
              required
            />
          </label>
          <label>
            댓글
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="댓글을 입력해 주세요."
              required
            />
          </label>
          <label>
            비밀번호
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력해 주세요."
              required
            />
          </label>
          <Button type="button" onClick={handleSubmit}>
            등록하기
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PostComment;
