import React, { useEffect, useState } from "react";
import Button from "../components/FormButton";

const EditComment = ({ isOpen, onClose, commentId }) => {
  const [commentData, setCommentData] = useState(null);
  const [nickname, setNickname] = useState("");
  const [comment, setComment] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isOpen) return; // Don't fetch data if the modal is not open

    const fetchCommentData = async () => {
      try {
        const response = await fetch(`/api/comments/${commentId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch comment data");
        }
        const data = await response.json();
        setCommentData(data);
        setNickname(data.nickname);
        setComment(data.content);
      } catch (error) {
        console.error("Error fetching comment data:", error);
        setErrorMessage("댓글 정보를 불러오는 중 오류가 발생했습니다.");
      }
    };

    fetchCommentData();
  }, [isOpen, commentId]);

  const handleSave = async () => {
    if (!commentData) return; // If commentData is not loaded, do nothing

    const updatedComment = {
      ...commentData,
      content: comment,
    };

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...updatedComment,
          password, // Include password for validation
        }),
      });

      if (response.ok) {
        onClose();
      } else if (response.status === 400) {
        setErrorMessage("잘못된 요청입니다.");
      } else if (response.status === 403) {
        setErrorMessage("비밀번호가 틀렸습니다.");
      } else if (response.status === 404) {
        setErrorMessage("존재하지 않습니다.");
      } else {
        setErrorMessage("댓글을 업데이트하는 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("Error updating comment:", error);
      setErrorMessage("서버 요청 중 오류가 발생했습니다.");
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
        <h2>댓글 수정</h2>
        <form onSubmit={(e) => e.preventDefault()}>
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
          <Button type="button" onClick={handleSave}>
            저장하기
          </Button>
        </form>
      </div>
    </div>
  );
};

export default EditComment;
