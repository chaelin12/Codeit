import axios from "axios";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CalendarIcon from "../assets/pictures/calender.png"; // 이미지 파일 가져오기
import Button from "../components/FormButton";
import Modal from "../components/Modal";
import "./UploadPost.css";

function UploadPost() {
  const { groupId } = useParams(); // useParams 훅을 사용해 groupId 가져오기
  const [input, setInput] = useState({
    nickname: "",
    title: "",
    content: "",
    postPassword: "",
    groupPassword: "",
    image: null,
    tags: "",
    location: "",
    moment: "",
    isPublic: true,
  });

  const [tags, setTags] = useState([]); // 태그 배열 상태 관리
  const [isDateSelected, setIsDateSelected] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInfo, setModalInfo] = useState({ title: "", message: "" });
  const [redirectPath, setRedirectPath] = useState("/");
  const navigate = useNavigate();

  const onChange = (e) => {
    const { id, value, type, files } = e.target;
    const inputValue = type === "file" ? files[0] : value;

    if (id === "moment") {
      setIsDateSelected(value !== ""); // 날짜가 선택되었는지 확인
    }

    setInput({ ...input, [id]: inputValue });
  };

  const handleToggle = () => {
    setInput({ ...input, isPublic: !input.isPublic });
  };

  const handleTagInput = (e) => {
    if (e.key === "Enter" && e.target.value.trim() !== "") {
      e.preventDefault();
      setTags([...tags, e.target.value.trim()]); // 새로운 태그를 배열에 추가
      setInput({ ...input, tags: "" }); // 입력창 비우기
    }
  };

  const removeTag = (indexToRemove) => {
    setTags(tags.filter((_, index) => index !== indexToRemove)); // 해당 인덱스의 태그 삭제
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = "";
      if (input.image) {
        const imageFormData = new FormData();
        imageFormData.append("image", input.image);

        const imageUploadResponse = await axios.post(
          "/api/image",
          imageFormData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        imageUrl = imageUploadResponse.data.imageUrl;
        console.log("Uploaded Image URL:", imageUrl);
      }

      const formData = {
        nickname: input.nickname,
        title: input.title,
        content: input.content,
        postPassword: input.postPassword,
        groupPassword: input.groupPassword,
        imageUrl: imageUrl,
        tags: tags, // 태그 배열 전송
        location: input.location,
        moment: input.moment,
        isPublic: input.isPublic,
      };

      const response = await axios.post(
        `/api/groups/${groupId}/posts`,
        formData
      );

      if (response.status === 201) {
        setModalInfo({
          title: "추억 올리기 성공",
          message: "추억이 성공적으로 등록되었습니다.",
        });
        setRedirectPath("/GroupDetail");
      } else {
        setModalInfo({
          title: "추억 올리기 실패",
          message: "추억 등록에 실패했습니다.",
        });
        setRedirectPath("/UploadPost");
      }
    } catch (error) {
      console.error("Error:", error.response || error.message);
      setModalInfo({
        title: "추억 올리기 실패",
        message: error.response?.data?.message || "추억 등록에 실패했습니다.",
      });
      setRedirectPath("/UploadPost");
    } finally {
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    navigate(redirectPath);
  };

  return (
    <div className="upload-post-container">
      <div className="title">
        <h1>추억 올리기</h1>
      </div>
      <div className="form-container">
        <div className="left-section">
          <div className="form-group">
            <label>닉네임</label>
            <input
              type="text"
              id="nickname"
              value={input.nickname}
              onChange={onChange}
              placeholder="닉네임을 입력해 주세요"
            />
          </div>
          <div className="form-group">
            <label>제목</label>
            <input
              type="text"
              id="title"
              value={input.title}
              onChange={onChange}
              placeholder="제목을 입력해 주세요"
            />
          </div>
          <div className="form-group">
            <label>이미지</label>
            <div className="form-group-image">
              <input
                type="text"
                placeholder="파일을 선택해 주세요"
                readOnly
                value={input.image ? input.image.name : ""}
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
            <label>본문</label>
            <textarea
              id="content"
              value={input.content}
              onChange={onChange}
              placeholder="본문 내용을 입력해 주세요"
              rows="5"
            />
          </div>
        </div>

        <div className="divider"></div>

        <div className="right-section">
          <div className="form-group">
            <label>태그</label>
            <input
              type="text"
              id="tags"
              value={input.tags}
              onChange={onChange}
              onKeyDown={handleTagInput} // Enter 키를 감지
              placeholder="태그 입력 후 Enter"
            />
            <div className="tags-container">
              {tags.map((tag, index) => (
                <div className="tag-item" key={index}>
                  #{tag} <span onClick={() => removeTag(index)}>×</span>
                </div>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>장소</label>
            <input
              type="text"
              id="location"
              value={input.location}
              onChange={onChange}
              placeholder="장소를 입력해 주세요"
            />
          </div>
          <div className="form-group">
            <label>추억의 순간</label>
            <div className="date-input-wrapper">
              <input
                type="text"
                id="moment"
                value={input.moment}
                onChange={onChange}
                onFocus={(e) => {
                  e.target.type = "date"; // 타입을 date로 설정하여 날짜 선택기 표시
                  e.target.showPicker();
                }}
                onBlur={(e) => {
                  if (!input.moment) {
                    e.target.type = "text"; // 값이 없을 때 텍스트 필드로 전환
                  }
                }}
                placeholder="YYYY-MM-DD"
                className={`memory-date-input ${
                  isDateSelected ? "active" : ""
                }`}
              />
              <img
                src={CalendarIcon} // 수정된 이미지 경로 사용
                alt="Calendar Icon"
                className="calendar-icon"
              />
            </div>
          </div>
          <div className="form-group">
            <label>추억 공개 선택</label>
            <div className="toggle-container">
              <p>공개</p>
              <div
                className={`toggle-switch ${input.isPublic ? "active" : ""}`}
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
              id="postPassword"
              value={input.postPassword}
              onChange={onChange}
              placeholder="비밀번호를 입력해 주세요"
            />
          </div>
        </div>
      </div>
      <Button type="submit" onClick={handleSubmit}>
        올리기
      </Button>
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={modalInfo.title}
        message={modalInfo.message}
      />
    </div>
  );
}

export default UploadPost;
