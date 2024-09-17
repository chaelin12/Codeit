import React from "react";
import Button from "./FormButton";
import "./Modal.css";

function Modal({ isOpen, onClose, title, message, onConfirm = () => {} }) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(); // onConfirm 호출
    onClose(); // 모달을 닫습니다.
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2 className="modal-title">{title}</h2>
        <p className="modal-message">{message}</p>
        <Button onClick={handleConfirm}>확인</Button>
      </div>
    </div>
  );
}

export default Modal;
