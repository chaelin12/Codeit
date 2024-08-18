import React from "react";
import Button from "../components/FormButton";
import "./Modal.css";

function Modal({ isOpen, onClose, title, message, onCreateGroup }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2 className="modal-title">{title}</h2>
        <p className="modal-message">{message}</p>
        <Button onClick={onCreateGroup}>확인</Button>
      </div>
    </div>
  );
}

export default Modal;
