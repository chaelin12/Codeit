import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/FormButton";
import "./DeleteGroup.css";

const DeleteGroup = ({ onClose, groupId }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setError("");
  };

  const handleDelete = async () => {
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_USER}/api/groups/${groupId}`,
        {
          data: {
            password, // 비밀번호를 서버로 전송
          },
          withCredentials: true, // 자격 증명을 포함
        }
      );
      const data = response.data; // 서버에서 반환한 데이터

      if (response.ok) {
        navigate("/"); // 삭제 성공 시 PublicGroup 페이지로 이동
      } else if (response.status === 400) {
        setError(data.message || "잘못된 요청입니다."); // 서버에서의 오류 메시지를 표시
      } else if (response.status === 403) {
        setError(data.message || "비밀번호가 틀렸습니다."); // 비밀번호 오류 처리
      } else if (response.status === 404) {
        setError(data.message || "존재하지 않습니다."); // 그룹이 존재하지 않을 때 처리
      } else {
        setError("알 수 없는 오류가 발생했습니다. 다시 시도해주세요."); // 그 외의 오류 처리
      }
    } catch (error) {
      setError("서버와의 통신에 실패했습니다. 다시 시도해주세요."); // 네트워크 오류 처리
    }
  };

  return (
    <div className="delete-modal-overlay" onClick={onClose}>
      <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          ×
        </button>
        <h2>그룹 삭제</h2>
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
  );
};

export default DeleteGroup;
