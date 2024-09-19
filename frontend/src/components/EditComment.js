import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/FormButton";

const EditComment = ({ isOpen, onClose, commentId, postId, onSave }) => {
  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // Load comment data when modal opens
  useEffect(() => {
    console.log("commentId:", commentId); // Log the commentId for debugging

    const fetchCommentData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_USER}/api/comments/${commentId}`,
          {
            withCredentials: true, // 자격 증명이 필요할 경우 추가
          }
        );

        const data = response.data;

        // Populate fields with fetched comment data
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

    if (commentId && isOpen) {
      fetchCommentData();
    }
  }, [commentId, isOpen]);

  // Handle Save
  const handleSave = async () => {
    if (!nickname || !content || !password) {
      setErrorMessage("모든 필드를 입력해 주세요.");
      return;
    }

    const updatedComment = { nickname, content, password };

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_USER}/api/comments/${commentId}`,
        updatedComment,
        {
          withCredentials: true, // 자격 증명이 필요할 경우 추가
        }
      );

      if (response.status === 200) {
        onSave(updatedComment); // Callback after successful update
        navigate(`/postdetail/${postId}`);
        onClose(); // Close modal after saving
      }
    } catch (error) {
      if (error.response) {
        const { status } = error.response;
        if (status === 400) {
          setErrorMessage("잘못된 요청입니다.");
        } else if (status === 403) {
          setErrorMessage("비밀번호가 틀렸습니다.");
        } else if (status === 404) {
          setErrorMessage("댓글을 찾을 수 없습니다.");
        } else {
          setErrorMessage("댓글을 업데이트하는 중 오류가 발생했습니다.");
        }
      } else {
        setErrorMessage("서버 요청 중 오류가 발생했습니다.");
      }
    }
  };

  if (!isOpen) return null; // Do not render if modal is not open

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
        <h2>댓글 수정</h2>
        <form onSubmit={(e) => e.preventDefault()}>
          <label>
            닉네임
            <input
              type="text"
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </label>
          <label>
            댓글
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
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
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <Button type="button" onClick={handleSave}>
            저장하기
          </Button>
        </form>
      </div>
    </div>
  );
};

export default EditComment;
