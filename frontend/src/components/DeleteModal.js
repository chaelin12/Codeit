import React, { useState } from "react";
import "./DeleteModal.css";

const DeleteModal = ({ onClose, onDelete }) => {
  const [password, setPassword] = useState("");

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleDelete = () => {
    // Here, you can add password validation logic
    onDelete(password);
  };

  return (
    <div className="delete-modal-overlay">
      <div className="delete-modal">
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
        <button className="delete-button" onClick={handleDelete}>
          삭제하기
        </button>
      </div>
    </div>
  );
};

export default DeleteModal;
