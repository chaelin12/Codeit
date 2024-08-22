import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/FormButton";
import Modal from "../components/Modal";
import "./CreateGroup.css";

function CreateGroup() {
  const [input, setInput] = useState({
    name: "",
    image: null,
    introduction: "",
    isPublic: false,
    password: "",
  });

  const [errors, setErrors] = useState({
    name: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInfo, setModalInfo] = useState({ title: "", message: "" });

  const { name, image, introduction, isPublic, password } = input;

  const navigate = useNavigate();

  const validateName = (value) => {
    const validNamePattern = /^[a-zA-Z0-9!@#$%^_가-힣ㄱ-하-ㅣ ]*$/;
    return validNamePattern.test(value);
  };

  const onChange = (e) => {
    const { id, value, type, files } = e.target;
    const inputValue = type === "file" ? files[0] : value;

    if (id === "name") {
      const isValid = validateName(inputValue);
      setErrors({
        ...errors,
        name: isValid ? "" : "특수문자는 !@#$%^_만 사용하실 수 있습니다.",
      });
    }

    setInput({
      ...input,
      [id]: inputValue,
    });

    console.log(`Field ID: ${id}, Value:`, inputValue);
  };

  const handleToggle = () => {
    setInput({
      ...input,
      isPublic: !isPublic,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let imageUrl = "";
      if (image) {
        const imageFormData = new FormData();
        imageFormData.append("image", image);

        const imageUploadResponse = await axios.post(
          "/api/image",
          imageFormData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        imageUrl = imageUploadResponse.data.url; // 서버에서 반환한 이미지 URL
      }

      const formData = {
        name,
        imageUrl,
        introduction,
        isPublic,
        password,
      };

      const response = await axios.post("/api/groups", formData);

      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      // 백엔드 응답 상태에 따라 모달 표시
      if (response.status === 201) {
        setModalInfo({
          title: "그룹 만들기 성공",
          message: "그룹이 성공적으로 등록되었습니다.",
        });
        setRedirectPath("/");
      } else {
        setModalInfo({
          title: "그룹 만들기 실패",
          message: "그룹 등록에 실패했습니다.",
        });
        setRedirectPath("/createGroup");
      }
    } catch (error) {
      console.error("Error:", error.response || error.message);

      setModalInfo({
        title: "그룹 만들기 실패",
        message: error.response?.data?.message || "그룹 등록에 실패했습니다.",
      });
      setRedirectPath("/createGroup");
    } finally {
      setIsModalOpen(true);
    }
  };

  const [redirectPath, setRedirectPath] = useState("/");

  const handleCloseModal = () => {
    navigate(redirectPath); // 모달이 닫힐 때 지정된 경로로 리다이렉트
    setIsModalOpen(false);
  };

  return (
    <div className="create-group-container">
      <div className="title1">
        <h1>그룹 만들기</h1>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>그룹명</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={onChange}
            placeholder="그룹명을 입력하세요"
            className={errors.name ? "error-border" : ""}
          />
          {errors.name && <p className="error-message">{errors.name}</p>}
        </div>
        <div className="form-group">
          <label>대표 이미지</label>
          <div className="form-group-image">
            <input
              type="text"
              placeholder="파일을 선택해 주세요"
              readOnly
              value={image ? image.name : ""}
              className="image-placeholder"
            />
            <label htmlFor="image" className="file-upload-button">
              파일 선택
            </label>
            <input
              type="file"
              id="image"
              onChange={onChange}
              style={{ display: "none" }}
            />
          </div>
        </div>
        <div className="form-group">
          <label>그룹 소개</label>
          <textarea
            id="introduction"
            value={introduction}
            onChange={onChange}
            placeholder="그룹을 소개해 주세요"
            rows="5"
          />
        </div>
        <div className="form-group">
          <label>그룹 공개 선택</label>
          <div className="toggle-container">
            <p>공개</p>
            <div
              className={`toggle-switch ${isPublic ? "active" : ""}`}
              onClick={handleToggle}
            >
              <div className="switch-handle"></div>
            </div>
          </div>
        </div>
        <div className="form-group">
          <label>비밀번호</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={onChange}
            placeholder="비밀번호를 입력해 주세요"
          />
        </div>
        <Button type="submit">만들기</Button>
      </form>
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={modalInfo.title}
        message={modalInfo.message}
      />
    </div>
  );
}

export default CreateGroup;
