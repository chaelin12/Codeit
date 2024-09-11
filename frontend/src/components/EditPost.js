import axios from "axios";
import React, { useEffect, useState } from "react";
import Button from "../components/FormButton";
import "./EditPost.css"; // 스타일을 가져와서 사용

const EditPost = ({ isOpen, closeModal, postId, onSave }) => {
  const [post, setPost] = useState(null);
  const [nickname, setNickname] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [postPassword, setPostPassword] = useState("");
  const [tags, setTags] = useState([]);
  const [location, setLocation] = useState("");
  const [moment, setMoment] = useState("");
  const [image, setImage] = useState(null); // 새로운 이미지 파일
  const [currentImageUrl, setCurrentImageUrl] = useState(""); // 기존 이미지 URL
  const [isPublic, setIsPublic] = useState(true);

  // 모달이 열릴 때 postId에 해당하는 데이터 불러오기
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
        setCurrentImageUrl(data.imageUrl); // 기존 이미지 URL 설정
      } catch (error) {
        console.error("Error fetching post data:", error);
      }
    };

    if (postId && isOpen) {
      fetchPostData();
    }
  }, [postId, isOpen]);

  // 태그 처리
  const handleTagInput = (e) => {
    if (e.key === "Enter" && e.target.value.trim() !== "") {
      e.preventDefault();
      setTags([...tags, e.target.value.trim()]);
      e.target.value = ""; // 입력 필드 초기화
    }
  };

  const removeTag = (indexToRemove) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  // 입력 변경 처리
  const handleChange = (e) => {
    const { id, value, type, files } = e.target;
    if (type === "file") {
      setImage(files[0]); // 새로 선택된 이미지 파일
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

  // 수정된 내용 저장
  const handleSave = async () => {
    let imageUrl = currentImageUrl;

    try {
      // 새로운 이미지 파일이 선택된 경우 업로드
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

      await axios.put(`/api/posts/${postId}`, updatedPost);
      onSave(updatedPost); // 저장 후 콜백 호출
      closeModal(); // 모달 닫기
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="editpost-modal-overlay" onClick={closeModal}>
      <div
        className="editpost-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="editpost-modal-header">
          <h2>추억 수정하기</h2>
          <button className="close-btn" onClick={closeModal}>
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
                <label htmlFor="image" className="file-upload-button">
                  파일 선택
                </label>
                <input
                  type="file"
                  id="image"
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
              <label htmlFor="moment">추억의 순간</label>
              <input
                type="date"
                id="moment"
                value={moment}
                onChange={handleChange}
              />
            </div>

            <div className="editpost-form-group">
              <label>추억 공개 여부</label>
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
