import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CalendarIcon from "../assets/pictures/calender.png";
import Button from "../components/FormButton";
import "./EditPost.css";

const EditPost = ({ isOpen, onClose, postId, groupId, onSave }) => {
  const [post, setPost] = useState(null);
  const [nickname, setNickname] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [postPassword, setPostPassword] = useState("");
  const [tags, setTags] = useState([]);
  const [location, setLocation] = useState("");
  const [moment, setMoment] = useState("");
  const [image, setImage] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate(); // react-router-dom의 navigate 훅

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        const response = await axios.get(`/api/posts/${postId}`);
        const data = response.data;

        setPost(data);
        setNickname(data.nickname);
        setTitle(data.title);
        setContent(data.content);
        setTags(data.tags || []);
        setLocation(data.location);
        setMoment(new Date(data.moment).toISOString().slice(0, 10));
        setIsPublic(data.isPublic);
        setCurrentImageUrl(data.imageUrl);
      } catch (error) {
        console.error("Error fetching post data:", error);
      }
    };

    if (postId && isOpen) {
      fetchPostData();
    }
  }, [postId, isOpen]);

  const triggerFileInput = () => {
    document.getElementById("file-input").click();
  };

  const handleTagInput = (e) => {
    if (e.key === "Enter" && e.target.value.trim() !== "") {
      e.preventDefault();
      setTags([...tags, e.target.value.trim()]);
      e.target.value = "";
    }
  };
  const openDatePicker = () => {
    const dateInput = document.getElementById("moment");
    if (dateInput) {
      dateInput.showPicker();
    }
  };
  const removeTag = (indexToRemove) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  const handleChange = (e) => {
    const { id, value, type, files } = e.target;
    if (type === "file") {
      setImage(files[0]);
    } else {
      switch (id) {
        case "nickname":
          setNickname(value);
          break;
        case "title":
          setTitle(value);
          break;
        case "content":
          setContent(value);
          break;
        case "location":
          setLocation(value);
          break;
        case "moment":
          setMoment(value);
          break;
        case "postPassword":
          setPostPassword(value);
          break;
        default:
          break;
      }
    }
  };

  const handleSave = async () => {
    let imageUrl = currentImageUrl;

    try {
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

      const updatedPost = {
        nickname,
        title,
        content,
        postPassword,
        tags,
        location,
        moment,
        imageUrl,
        isPublic,
      };

      const response = await axios.put(`/api/posts/${postId}`, updatedPost);

      if (response.status === 200) {
        // 수정 성공 시 groupId 사용하여 groupdetail 페이지로 이동
        navigate(`/groupdetail/${groupId}`);
        onClose();
      }
    } catch (error) {
      // 서버에서 받은 오류에 따라 메시지 출력
      if (error.response) {
        if (error.response.status === 400) {
          setErrorMessage("잘못된 요청입니다.");
        } else if (error.response.status === 403) {
          setErrorMessage("비밀번호가 틀렸습니다.");
        } else if (error.response.status === 404) {
          setErrorMessage("존재하지 않습니다.");
        } else {
          console.error("Failed to save the group data.");
          setErrorMessage("추억 정보를 저장하는 중 오류가 발생했습니다.");
        }
      } else {
        console.error("An error occurred while saving the group data:", error);
        setErrorMessage("서버 요청 중 오류가 발생했습니다.");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="editpost-modal-overlay" onClick={onClose}>
      <div
        className="editpost-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="editpost-modal-header">
          <h2>추억 수정하기</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="editpost-modal-body">
          <div className="editpost-left-section">
            <div className="editpost-form-group">
              <label htmlFor="nickname">닉네임</label>
              <input
                type="text"
                id="nickname"
                value={nickname}
                onChange={handleChange}
              />
            </div>

            <div className="editpost-form-group">
              <label htmlFor="title">제목</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={handleChange}
              />
            </div>

            <div className="editpost-form-group">
              <label htmlFor="image">이미지</label>
              <div className="editpost-image-upload-container">
                <input
                  type="text"
                  readOnly
                  value={
                    image
                      ? image.name
                      : currentImageUrl || "이미지를 선택하세요"
                  }
                  className="editpost-image-placeholder"
                />
                <p className="file-upload-button" onClick={triggerFileInput}>
                  파일 선택
                </p>
                <input
                  type="file"
                  id="file-input"
                  accept="image/*"
                  onChange={handleChange}
                  style={{ display: "none" }}
                />
              </div>
            </div>

            <div className="editpost-form-group">
              <label htmlFor="content">본문</label>
              <textarea
                id="content"
                value={content}
                onChange={handleChange}
                rows="5"
              />
            </div>
          </div>
          <div className="divider"></div>
          <div className="editpost-right-section">
            <div className="editpost-form-group">
              <label htmlFor="tags">태그</label>
              <input
                type="text"
                id="tags"
                onKeyDown={handleTagInput}
                placeholder="태그 입력 후 Enter"
              />
              <div className="editpost-tags-container">
                {tags.map((tag, index) => (
                  <div key={index} className="tag-item">
                    #{tag} <span onClick={() => removeTag(index)}>×</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="editpost-form-group">
              <label htmlFor="location">장소</label>
              <input
                type="text"
                id="location"
                value={location}
                onChange={handleChange}
                placeholder="장소"
              />
            </div>

            <div className="editpost-form-group">
              <label>추억의 순간</label>
              <div className="editpostdate-input-wrapper">
                <input
                  type="date"
                  id="moment"
                  value={moment}
                  onChange={handleChange}
                  placeholder="YYYY-MM-DD"
                  className={!moment ? "placeholder" : ""}
                />
                <img
                  src={CalendarIcon}
                  alt="Calendar Icon"
                  className="editpost-calendar-icon"
                  onClick={openDatePicker}
                />
              </div>
            </div>

            <div className="editpost-form-group">
              <label>추억 공개 선택</label>
              <div className="editpost-toggle-container">
                <p>공개</p>
                <div
                  className={`toggle-switch ${isPublic ? "active" : ""}`}
                  onClick={() => setIsPublic(!isPublic)}
                >
                  <div className="switch-handle"></div>
                </div>
              </div>
            </div>

            <div className="editpost-form-group">
              <label htmlFor="postPassword">수정 권한 인증</label>
              <input
                type="password"
                id="postPassword"
                value={postPassword}
                onChange={handleChange}
                placeholder="비밀번호를 입력해 주세요"
              />
            </div>
          </div>
        </div>
        <div className="editpost-modal-footer">
          <Button type="button" onClick={handleSave}>
            수정하기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditPost;
