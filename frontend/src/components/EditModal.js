import React, { useState } from "react";
import "./EditModal.css"; // 모달 스타일을 위한 CSS 파일 import
import Button from "./FormButton";

const EditModal = ({ isOpen, closeModal, groupDetail, onSave }) => {
  const [groupName, setGroupName] = useState(groupDetail.name);
  const [groupImage, setGroupImage] = useState(groupDetail.imageUrl);
  const [groupIntro, setGroupIntro] = useState(groupDetail.introduction);
  const [isPublic, setIsPublic] = useState(groupDetail.isPublic);
  const [password, setPassword] = useState("");

  const handleSave = () => {
    // 그룹 정보 저장 로직 추가
    onSave({
      name: groupName,
      imageUrl: groupImage,
      introduction: groupIntro,
      isPublic,
    });
    closeModal();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setGroupImage(URL.createObjectURL(file));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="edit-modal-overlay" onClick={closeModal}>
      <div className="edit-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>그룹 정보 수정</h2>
          <button className="close-btn" onClick={closeModal}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          <div>
            그룹명
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>
          <div className="form-group form-group-image"></div>
          <label>대표 이미지</label>
          <div className="image-upload-container">
            <input
              type="text"
              className="image-placeholder"
              value={groupImage ? groupImage.split("/").pop() : ""}
              placeholder="파일을 선택해 주세요"
              readOnly
            />
            <label className="file-upload-button">
              파일 선택
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
            </label>
          </div>
          <label>
            그룹 소개
            <textarea
              value={groupIntro}
              onChange={(e) => setGroupIntro(e.target.value)}
              placeholder="그룹을 소개해 주세요"
            ></textarea>
          </label>
          <label className="form-group toggle-container">
            <p>그룹 공개 선택</p>
            <div
              className={`toggle-switch ${isPublic ? "active" : ""}`}
              onClick={() => setIsPublic(!isPublic)}
            >
              <div className="switch-handle"></div>
            </div>
            A<label className="switch-handle"></label>
            수정 권한 인증
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력해 주세요"
            />
          </label>
        </div>
        <div className="modal-footer">
          <Button className="save-btn" onClick={handleSave}>
            수정하기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
