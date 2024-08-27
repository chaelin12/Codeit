import React, { useState } from "react";
import "./EditModal.css"; // Import the modal styling CSS file

const EditModal = ({ isOpen, closeModal, groupDetail, onSave, groupId }) => {
  const [groupName, setGroupName] = useState(groupDetail.name);
  const [groupImage, setGroupImage] = useState(groupDetail.imageUrl);
  const [groupIntro, setGroupIntro] = useState(groupDetail.introduction);
  const [isPublic, setIsPublic] = useState(groupDetail.isPublic);
  const [verifyPassword, setVerifyPassword] = useState(""); // Password input from the user
  const [errorMessage, setErrorMessage] = useState(""); // For displaying error messages

  const handleSave = async () => {
    // Prepare the updated group data
    const updatedGroup = {
      name: groupName,
      imageUrl: groupImage,
      introduction: groupIntro,
      isPublic,
    };

    try {
      // Verify the password first
      const passwordResponse = await fetch(
        `/api/groups/${groupId}/verify-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password: verifyPassword }), // Send the entered password for verification
        }
      );

      // 응답을 먼저 텍스트로 읽기
      const responseText = await passwordResponse.text();

      // JSON 파싱이 가능한지 확인
      let passwordData;
      try {
        passwordData = JSON.parse(responseText);
      } catch (err) {
        throw new Error("Invalid JSON response");
      }

      if (passwordResponse.ok && passwordData.isValid) {
        // If password is valid, proceed with updating the group information
        const updateResponse = await fetch(`/api/groups/${groupId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedGroup),
        });

        if (updateResponse.ok) {
          // Successfully updated, trigger onSave callback
          onSave(updatedGroup);
          closeModal();
        } else {
          console.error("Failed to save the group data.");
          setErrorMessage("그룹 정보를 저장하는 중 오류가 발생했습니다.");
        }
      } else {
        // If password is invalid, show an error message
        setErrorMessage("비밀번호가 일치하지 않습니다. 다시 시도해 주세요.");
      }
    } catch (error) {
      console.error(
        "An error occurred while verifying the password or saving the group data:",
        error
      );
      setErrorMessage("서버 요청 중 오류가 발생했습니다.");
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
              value={verifyPassword}
              onChange={(e) => setVerifyPassword(e.target.value)}
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
