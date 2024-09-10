import React from "react";

const DeletePostModal = ({ isOpen, onClose, postId, onDelete }) => {
  const handleDelete = async () => {
    try {
      // API call to delete post
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete post");
      }
      onDelete();
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>추억 삭제하기</h2>
        <p>정말로 이 추억을 삭제하시겠습니까?</p>
        <button onClick={handleDelete}>삭제하기</button>
        <button onClick={onClose}>취소</button>
      </div>
    </div>
  );
};

export default DeletePostModal;
