import axios from "axios";
import React, { useState } from "react";
import Button from "../components/FormButton";

const DeleteComment = ({ isOpen, onClose, commentId, postId, onDelete }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setError("");
  };

  const handleDelete = async () => {
    try {
      // 사용자 토큰이 필요한 경우 가져옵니다. (예시: localStorage에서 가져오기)
      const token = localStorage.getItem("authToken"); // 인증 토큰이 필요할 경우 추가

      const response = await axios.delete(
        `${process.env.REACT_APP_USER}/comments/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // 인증 토큰을 헤더에 추가
          },
          data: {
            password, // 비밀번호를 data에 추가
          },
          withCredentials: true, // 자격 증명을 포함
        }
      );
      const data = response.data; // 서버에서 반환한 데이터를 받아옵니다.

      if (updateResponse.status === 200) {
        onDelete(commentId); // 삭제 성공 시 전달받은 commentId를 삭제 처리
        onClose(); // 모달 닫기
      } else if (response.status === 400) {
        setError(data.message || "잘못된 요청입니다."); // 서버에서의 오류 메시지를 표시
      } else if (response.status === 403) {
        setError(data.message || "비밀번호가 틀렸거나 권한이 없습니다."); // 비밀번호 오류 처리
      } else if (response.status === 404) {
        setError(data.message || "존재하지 않는 댓글입니다."); // 댓글이 존재하지 않을 때 처리
      } else {
        setError("알 수 없는 오류가 발생했습니다. 다시 시도해주세요."); // 그 외의 오류 처리
      }
    } catch (error) {
      setError("서버와의 통신에 실패했습니다. 다시 시도해주세요."); // 네트워크 오류 처리
    }
  };

  return (
    isOpen && (
      <div className="delete-modal-overlay" onClick={onClose}>
        <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
          <h2>댓글 삭제</h2>
          <div className="input-group">
            <label htmlFor="password">삭제 권한 인증</label>
            <input
              type="password"
              id="password"
              placeholder="비밀번호를 입력해 주세요"
              value={password}
              onChange={handlePasswordChange}
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <Button className="delete-button" onClick={handleDelete}>
            삭제하기
          </Button>
        </div>
      </div>
    )
  );
};

export default DeleteComment;
