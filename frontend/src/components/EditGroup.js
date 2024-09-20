import axios from "axios"; // Import axios for handling API requests
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/FormButton";
import "./EditGroup.css";

const EditGroup = ({ isOpen, closeModal, groupDetail, onSave, groupId }) => {
  const [groupName, setGroupName] = useState(groupDetail.name);
  const [groupImage, setGroupImage] = useState(groupDetail.imageUrl); // 기존 URL로 초기화
  const [newImageFile, setNewImageFile] = useState(null); // 새로 업로드할 파일 저장
  const [groupIntro, setGroupIntro] = useState(groupDetail.introduction);
  const [isPublic, setIsPublic] = useState(groupDetail.isPublic);
  const [groupPassword, setGroupPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const handleSave = async () => {
    try {
      let imageUrl = groupImage; // 기본적으로 기존 이미지 URL 사용

      // 이미지 파일이 선택된 경우 새로 업로드
      if (newImageFile) {
        const imageFormData = new FormData();
        imageFormData.append("image", newImageFile);

        const imageUploadResponse = await axios.post(
          `${process.env.REACT_APP_USER}/image`,
          imageFormData,
          {
            withCredentials: true,
          }
        );

        imageUrl = imageUploadResponse.data.imageUrl; // 새로 업로드된 이미지의 URL
      }

      // 업데이트할 그룹 데이터를 준비
      const updatedGroup = {
        name: groupName,
        imageUrl, // 업로드한 이미지 URL
        introduction: groupIntro,
        isPublic,
        password: groupPassword,
      };

      const updateResponse = await axios.put(
        `${process.env.REACT_APP_USER}/groups/${groupId}`,
        updatedGroup,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (updateResponse.status === 200) {
        await onSave(updatedGroup);
        closeModal();
        navigate(`/groupdetail/${groupId}`);
      } else if (updateResponse.status === 400) {
        setErrorMessage("잘못된 요청입니다.");
      } else if (updateResponse.status === 403) {
        setErrorMessage("비밀번호가 틀렸습니다.");
      } else if (updateResponse.status === 404) {
        setErrorMessage("존재하지 않습니다.");
      } else {
        console.error("Failed to save the group data.");
        setErrorMessage("그룹 정보를 저장하는 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("An error occurred while saving the group data:", error);
      setErrorMessage("서버 요청 중 오류가 발생했습니다.");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImageFile(file); // 새로 선택된 파일을 저장
      setGroupImage(URL.createObjectURL(file)); // 미리보기용 로컬 URL 생성
    }
  };

  // 파일 입력 클릭 이벤트 트리거
  const triggerFileInput = () => {
    document.getElementById("file-input").click();
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
                value={
                  newImageFile ? newImageFile.name : groupImage.split("/").pop()
                }
                placeholder="파일을 선택해 주세요"
                readOnly
              />
              <p className="file-upload-button" onClick={triggerFileInput}>
                파일 선택
              </p>
              <input
                type="file"
                id="file-input"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }} // 기본 파일 입력 숨김
              />
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
          <div className="auth-input">
            <label>수정 권한 인증</label>
            <input
              type="password"
              value={groupPassword}
              onChange={(e) => setGroupPassword(e.target.value)}
              placeholder="비밀번호를 입력해 주세요"
            />
          </div>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
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

export default EditGroup;
