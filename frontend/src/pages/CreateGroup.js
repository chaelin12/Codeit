import React, { useState } from "react";
import Button from "../components/FormButton";
import "./CreateGroup.css";

function CreateGroup() {
  const [input, setInput] = useState({
    name: "",
    image: null,
    introduce: "",
    isPublic: false,
    password: "",
  });

  const [errors, setErrors] = useState({
    name: "",
  });

  const { name, image, introduce, isPublic, password } = input;

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
  };

  const handleToggle = () => {
    setInput({
      ...input,
      isPublic: !isPublic,
    });
  };

  return (
    <div className="create-group-container">
      <div className="title">
        <h1>그룹 만들기</h1>
      </div>
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
          <label htmlFor="image-upload" className="file-upload-button">
            파일 선택
          </label>
          <input
            type="file"
            id="image-upload"
            onChange={onChange}
            style={{ display: "none" }}
          />
        </div>
      </div>
      <div className="form-group">
        <label>그룹 소개</label>
        <textarea
          id="introduce"
          value={introduce}
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
    </div>
  );
}

export default CreateGroup;
