import React, { useState } from "react";
import Button from "../components/FormButton";
import "./PostComment.css"; // Updated CSS file

const PostComment = ({ isOpen, onClose, postId, onAddComment }) => {
  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // To display error messages

  const handleSubmit = async (e) => {
    e.preventDefault();

    const commentData = {
      nickname,
      content,
      password,
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
        if (response.status === 400) {
          setErrorMessage("잘못된 요청입니다");
        } else {
          const errorMessage = await response.text(); // Get error message from response
          setErrorMessage(`Failed to submit comment: ${errorMessage}`);
        }
        throw new Error("Failed to submit comment");
      }

      const result = await response.json();
      console.log("Comment submitted:", result);

      // Call the callback to add the comment to the list
      onAddComment(result);
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
        {errorMessage && <p className="error-message">{errorMessage}</p>}
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
              value={content}
              onChange={(e) => setContent(e.target.value)}
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
          <Button type="submit">등록하기</Button>
        </form>
      </div>
    </div>
  );
};

export default PostComment;
