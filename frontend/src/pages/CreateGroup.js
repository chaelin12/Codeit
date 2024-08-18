import axios from "axios";
import React, { useState } from "react";
import Button from "../components/FormButton";
import Modal from "../components/Modal";
import "./CreateGroup.css";

function CreateGroup() {
  const [input, setInput] = useState({
    name: "",
    image: null,
    introduce: "",
    isPublic: false,
    password: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInfo, setModalInfo] = useState({ title: "", message: "" });

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 백엔드로 그룹 생성 요청 보내기
      const response = await axios.post("/api/groups", {
        name,
        image,
        introduce,
        isPublic,
        password,
      });

      // 백엔드 응답 상태에 따라 모달 표시
      if (response.status === 201) {
        // 그룹 생성 성공
        setModalInfo({
          title: "그룹 만들기 성공",
          message: "그룹이 성공적으로 등록되었습니다.",
        });
      } else {
        // 세션 만료 등 실패 처리
        setModalInfo({
          title: "그룹 만들기 실패",
          message: "그룹 등록에 실패했습니다.",
        });
      }
    } catch (error) {
      // 서버 오류 또는 네트워크 문제로 인한 실패 처리
      setModalInfo({
        title: "그룹 만들기 실패",
        message: "그룹 등록에 실패했습니다.",
      });
    } finally {
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
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
          />
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
