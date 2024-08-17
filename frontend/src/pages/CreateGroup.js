import React, { useState } from "react";
import "./CreateGroup.css";

function CreateGroup() {
  const [input, setInput] = useState({
    name: "",
    image: null,
    introduce: "",
    isPublic: false,
    password: "",
  });

  const { name, image, introduce, isPublic, password } = input;

  const onChange = (e) => {
    const { id, value, type, files } = e.target;
    const inputValue = type === "file" ? files[0] : value;

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
        />
      </div>
      <div className="form-group">
        <label>대표 이미지</label>
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

      <button className="submit-button" type="submit">
        만들기
      </button>
    </div>
  );
}

export default CreateGroup;
