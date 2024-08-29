import axios from "axios";
import React, { useState } from "react";
import "./EditModal.css"; // Import the modal styling CSS file

const EditModal = ({ isOpen, closeModal, groupDetail, onSave, groupId }) => {
  const [groupName, setGroupName] = useState(groupDetail.name);
  const [groupImage, setGroupImage] = useState(groupDetail.imageUrl);
  const [groupIntro, setGroupIntro] = useState(groupDetail.introduction);
  const [isPublic, setIsPublic] = useState(groupDetail.isPublic);
  const [editPassword, setEditPassword] = useState(""); // 새로운 변수명으로 변경
  const [errorMessage, setErrorMessage] = useState(""); // For displaying error messages

  const handleSave = async () => {
    try {
      // Prepare the updated group data
      const updatedGroup = {
        name: groupName,
        imageUrl: groupImage,
        introduction: groupIntro,
        isPublic,
      };

      // 서버에 업데이트 요청을 보내는 부분입니다.
      const response = await axios.put(`/api/groups/${groupId}`, updatedGroup, {
        headers: {
          "Content-Type": "application/json",
          Authorization: editPassword, // 헤더에 editPassword 값을 포함하여 서버로 보냅니다.
        },
      });

      // 성공적인 응답을 받으면 모달을 닫고 그룹을 갱신합니다.
      onSave(response.data);
      closeModal();
    } catch (error) {
      // 에러 상태에 따른 메시지 설정
      if (error.response.status === 400) {
        setErrorMessage("잘못된 요청입니다");
      } else if (error.response.status === 403) {
        setErrorMessage("비밀번호가 틀렸습니다");
      } else if (error.response.status === 404) {
        setErrorMessage("존재하지 않습니다");
      } else {
        setErrorMessage("알 수 없는 오류가 발생했습니다");
      }
    }
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
          <label>
            그룹명
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </label>
          <label>
            대표 이미지
            <div className="image-upload-container">
              <input
                type="text"
                className="image-placeholder"
                value={groupImage ? groupImage.split("/").pop() : ""}
                placeholder="파일을 선택해 주세요"
                readOnly
              />
              <p className="file-upload-button">
                파일 선택
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
              </p>
            </div>
          </label>
          <label>
            그룹 소개
            <textarea
              value={groupIntro}
              onChange={(e) => setGroupIntro(e.target.value)}
              placeholder="그룹을 소개해 주세요"
            ></textarea>
          </label>
          {/* 그룹 공개 선택 영역 */}
          <div className="public-toggle">
            <label>그룹 공개 선택</label>
            <div className="toggle-container">
              <p>공개</p>
              <div
                className={`toggle-switch ${isPublic ? "active" : ""}`}
                onClick={() => setIsPublic(!isPublic)}
              >
                <div className="switch-handle"></div>
              </div>
            </div>
          </div>
          {/* 수정 권한 인증 영역 */}
          <div className="auth-input">
            <label>수정 권한 인증</label>
            <input
              type="password"
              value={editPassword}
              onChange={(e) => setEditPassword(e.target.value)}
              placeholder="비밀번호를 입력해 주세요"
            />
          </div>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
        </div>
        <div className="modal-footer">
          <button className="save-btn" onClick={handleSave}>
            수정하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
