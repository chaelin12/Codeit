import axios from "axios";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CalendarIcon from "../assets/pictures/calender.png";
import Button from "../components/FormButton";
import Modal from "../components/Modal";
import "./UploadPost.css";

function UploadPost() {
  const { groupId } = useParams();
  const navigate = useNavigate();

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

  const [tags, setTags] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    title: "",
    message: "",
    success: false,
  });
  const [redirectPath, setRedirectPath] = useState("/");

  const {
    nickname,
    title,
    content,
    postPassword,
    groupPassword,
    image,
    location,
    moment,
    isPublic,
  } = input;

  const onChange = (e) => {
    const { id, value, type, files } = e.target;
    const inputValue = type === "file" ? files[0] : value;
    setInput({ ...input, [id]: inputValue });
  };

  const handleToggle = () => {
    setInput({ ...input, isPublic: !input.isPublic });
  };

  const handleTagInput = (e) => {
    if (e.key === "Enter" && e.target.value.trim() !== "") {
      e.preventDefault();
      setTags([...tags, e.target.value.trim()]);
      setInput({ ...input, tags: "" });
    }
  };

  const removeTag = (indexToRemove) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
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
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        imageUrl = imageUploadResponse.data.imageUrl;
      }

      const formData = {
        nickname,
        title,
        content,
        postPassword,
        groupPassword,
        imageUrl,
        tags,
        location,
        moment,
        isPublic,
      };

      const response = await axios.post(
        `/api/groups/${groupId}/posts`,
        formData
      );

      // 추가된 콘솔 로그
      console.log("Response status:", response.status);
      console.log("Response data:", response.data);

      if (response.status === 200 || response.status === 201) {
        setModalInfo({
          title: "추억 올리기 성공",
          message: "추억이 성공적으로 등록되었습니다.",
          success: true, // 성공 모달
        });
        setRedirectPath(`/groupdetail/${groupId}`); // 그룹 상세 페이지로 이동
      } else {
        throw new Error("추억 등록에 실패했습니다.");
      }
    } catch (error) {
      // 에러 정보 출력
      console.error("Error:", error);

      setModalInfo({
        title: "추억 올리기 실패",
        message: error.response?.data?.message || "추억 등록에 실패했습니다.",
        success: false, // 실패 모달
      });
      setRedirectPath("/uploadPost"); // 현재 페이지 유지
    } finally {
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    if (modalInfo.success) {
      navigate(`/groupdetail/${groupId}`); // 성공 시 그룹 상세 페이지로 이동
    } else {
      setIsModalOpen(false); // 실패 시 모달 닫고 현재 페이지 유지
    }
  };

  const openDatePicker = () => {
    const dateInput = document.getElementById("moment");
    if (dateInput) {
      dateInput.showPicker();
    }
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
              value={nickname}
              onChange={onChange}
              placeholder="닉네임을 입력해 주세요"
            />
          </div>
          <div className="form-group">
            <label>제목</label>
            <input
              type="text"
              id="title"
              value={title}
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
            <label>본문</label>
            <textarea
              id="content"
              value={content}
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
              onKeyDown={handleTagInput}
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
              value={location}
              onChange={onChange}
              placeholder="장소를 입력해 주세요"
            />
          </div>
          <div className="form-group">
            <label>추억의 순간</label>
            <div className="date-input-wrapper">
              <input
                type="date"
                id="moment"
                value={moment}
                onChange={onChange}
                placeholder="YYYY-MM-DD"
                className={!moment ? "placeholder" : ""}
              />
              <img
                src={CalendarIcon}
                alt="Calendar Icon"
                className="calendar-icon"
                onClick={openDatePicker}
              />
            </div>
          </div>
          <div className="form-group">
            <label>추억 공개 선택</label>
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
              id="postPassword"
              value={postPassword}
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
