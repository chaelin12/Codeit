import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/FormButton";

const EditComment = ({ isOpen, onClose, commentId, postId }) => {
  const [commentData, setCommentData] = useState(null);
  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // 댓글 데이터 불러오기
    const fetchCommentData = async () => {
      try {
        const response = await axios.get(`/api/comments/${commentId}`);
        const data = response.data;

        setCommentData(data);
        setNickname(data.nickname);
        setContent(data.content);
      } catch (error) {
        console.error("Error fetching comment data:", error);
        setErrorMessage("댓글 정보를 불러오는 중 오류가 발생했습니다.");
      }
    };

    if (commentId && isOpen) {
      fetchCommentData();
    }
  }, [commentId, isOpen]);

  const handleSave = async () => {
    if (!commentData) return; // If commentData is not loaded, do nothing

    const updatedComment = {
      nickname,
      content,
      password,
    };

    try {
      const response = await axios.put(
        `/api/comments/${commentId}`,
        updatedComment
      );

      if (response.status === 200) {
        navigate(`/postdetail/${postId}`);
        onClose(); // 성공적으로 업데이트 후 모달을 닫음
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 400) {
          setErrorMessage("잘못된 요청입니다.");
        } else if (error.response.status === 403) {
          setErrorMessage("비밀번호가 틀렸습니다.");
        } else if (error.response.status === 404) {
          setErrorMessage("댓글을 찾을 수 없습니다.");
        } else {
          setErrorMessage("댓글을 업데이트하는 중 오류가 발생했습니다.");
        }
      } else {
        console.error("Error updating comment:", error);
        setErrorMessage("서버 요청 중 오류가 발생했습니다.");
      }
    }
  };

  if (!isOpen) return null; // 모달이 열리지 않았을 때는 렌더링하지 않음

  return (
    <div className="comment-modal-overlay" onClick={onClose}>
      <div
        className="comment-modal-content"
        onClick={(e) => e.stopPropagation()} // 모달 외부 클릭 시 닫기 방지
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
              onChange={(e) => setNickname(e.target.value)} // onChange 핸들러 추가
            />
          </label>
          <label>
            댓글
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)} // onChange 핸들러 추가
            />
          </label>
          <label>
            비밀번호
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)} // onChange 핸들러 추가
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
