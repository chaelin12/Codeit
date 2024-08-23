import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/FormButton";
import Modal from "../components/Modal";
import "./CreateGroup.css";

function CreateGroup() {
  const [input, setInput] = useState({
    name: "",
    image: null, // 이미지 파일
    introduction: "",
    isPublic: false,
    password: "",
  });

  const [errors, setErrors] = useState({
    name: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInfo, setModalInfo] = useState({ title: "", message: "" });
  const [redirectPath, setRedirectPath] = useState("/");

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

    // 입력값을 콘솔에 출력
    console.log(`Field ID: ${id}, Value:`, inputValue);
  };

  const handleToggle = () => {
    setInput({
      ...input,
      isPublic: !isPublic,
    });

    // 공개 여부를 콘솔에 출력
    console.log(`isPublic: ${!isPublic}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 제출된 모든 값을 콘솔에 출력
    console.log("Submitting form with data:", input);

    try {
      // 1. 이미지를 먼저 업로드하고 서버로부터 이미지 URL을 반환받음
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

        imageUrl = imageUploadResponse.data.imageUrl; // 서버에서 반환한 이미지 URL 사용
        console.log("Uploaded Image URL:", imageUrl);
      }

      // 2. 그룹 생성 요청
      const formData = {
        name,
        imageUrl,
        introduction,
        isPublic,
        password,
      };

      const response = await axios.post("/api/groups", formData);

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

  const handleCloseModal = () => {
    navigate(redirectPath);
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
