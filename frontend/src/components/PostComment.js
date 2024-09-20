import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/FormButton";
import "./PostComment.css"; // Updated CSS file
// fetchCommentData 함수 정의 (컴포넌트 내부 상태 접근)
const fetchCommentData = async () => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_USER}/comments/${commentId}`,
      {
        withCredentials: true, // 자격 증명이 필요할 경우 추가
      }
    );

    const data = response.data;

    // 상태 설정
    setNickname(data.nickname || "");
    setContent(data.content || "");
  } catch (error) {
    if (error.response && error.response.status === 404) {
      setErrorMessage("해당 댓글을 찾을 수 없습니다.");
    } else {
      console.error("Error fetching comment data:", error);
      setErrorMessage("댓글 정보를 불러오는 중 오류가 발생했습니다.");
    }
  }
};
const PostComment = ({ isOpen, onClose, postId, onSubmit }) => {
  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // To display error messages
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const commentData = {
      nickname,
      content,
      password,
    };

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_USER}/posts/${postId}/comments`,
        commentData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        navigate(-1);
        onClose();
        if (response.status === 400) {
          setErrorMessage("잘못된 요청입니다");
        } else {
          const errorMessage = await response.text(); // Get error message from response
          setErrorMessage(`Failed to submit comment: ${errorMessage}`);
        }
        throw new Error("Failed to submit comment");
      }

      const result = await response.json();

      // Call the callback to add the comment to the list
      onSubmit(result); // Changed to onSubmit
      fetchCommentData();
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
