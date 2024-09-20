import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CalendarIcon from "../assets/pictures/calender.png";
import Button from "../components/FormButton";
import "./EditPost.css";

const EditPost = ({ isOpen, onClose, postId, groupId, onSave }) => {
  const [post, setPost] = useState(null); // Store the post data
  const [nickname, setNickname] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [postPassword, setPostPassword] = useState("");
  const [tags, setTags] = useState([]); // Array for tags
  const [location, setLocation] = useState("");
  const [moment, setMoment] = useState("");
  const [image, setImage] = useState(null); // Handle file upload
  const [currentImageUrl, setCurrentImageUrl] = useState(""); // Existing image URL
  const [isPublic, setIsPublic] = useState(true); // Toggle for public/private post
  const [errorMessage, setErrorMessage] = useState(""); // Error message state

  const navigate = useNavigate();

  // Load post data when modal is opened and postId is provided
  useEffect(() => {
    const fetchPostData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_USER}/posts/${postId}`,
          {
            withCredentials: true,
          }
        );
        const data = response.data;

        // Set state with post data
        setPost(data);
        setNickname(data.nickname || ""); // Fallback to empty string if null
        setTitle(data.title || "");
        setContent(data.content || "");
        setTags(data.tags || []);
        setLocation(data.location || "");
        setMoment(new Date(data.moment).toISOString().slice(0, 10)); // Set moment as 'YYYY-MM-DD'
        setIsPublic(data.isPublic); // Boolean flag
        setCurrentImageUrl(data.imageUrl || ""); // Handle current image URL
      } catch (error) {
        console.error("Error fetching post data:", error);
        setErrorMessage("포스트 데이터를 불러오는 중 오류가 발생했습니다.");
      }
    };

    if (postId && isOpen) {
      fetchPostData(); // Only fetch data when the modal is open and postId is available
    }
  }, [postId, isOpen]);

  // Trigger file input to select an image
  const triggerFileInput = () => {
    document.getElementById("file-input").click();
  };

  // Handle tag input, allows Enter key to add new tag
  const handleTagInput = (e) => {
    if (e.key === "Enter" && e.target.value.trim() !== "") {
      e.preventDefault();
      setTags([...tags, e.target.value.trim()]);
      e.target.value = ""; // Clear input after adding tag
    }
  };

  // Remove a tag by index
  const removeTag = (indexToRemove) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { id, value, type, files } = e.target;
    if (type === "file") {
      setImage(files[0]); // Handle image upload
    } else {
      // Update respective field state based on input id
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

  // Save post changes
  const handleSave = async () => {
    let imageUrl = currentImageUrl; // Keep existing image URL unless a new image is uploaded

    try {
      if (image) {
        const imageFormData = new FormData();
        imageFormData.append("image", image);

        const imageUploadResponse = await axios.post(
          `${process.env.REACT_APP_USER}/image`,
          imageFormData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          }
        );

        imageUrl = imageUploadResponse.data.imageUrl; // Use new image URL
      }

      // Prepare updated post data
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

      const response = await axios.put(
        `${process.env.REACT_APP_USER}/posts/${postId}`,
        updatedPost,
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        // Redirect to group detail page after successful update
        onSave(updatedPost);
        fetchPostData();
        onClose(); // Close modal
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 400) {
          setErrorMessage("잘못된 요청입니다.");
        } else if (error.response.status === 403) {
          setErrorMessage("비밀번호가 틀렸습니다.");
        } else if (error.response.status === 404) {
          setErrorMessage("존재하지 않습니다.");
        } else {
          setErrorMessage("포스트 데이터를 저장하는 중 오류가 발생했습니다.");
        }
      } else {
        setErrorMessage("서버 요청 중 오류가 발생했습니다.");
      }
    }
  };

  if (!isOpen) return null; // Don't render modal if it's not open

  return (
    <div className="editpost-modal-overlay" onClick={onClose}>
      <div
        className="editpost-modal-content"
        onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
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
                  style={{ display: "none" }} // Hide the actual file input
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
                  onClick={() => document.getElementById("moment").showPicker()} // Open date picker
                />
              </div>
            </div>

            <div className="editpost-form-group">
              <label>추억 공개 선택</label>
              <div className="editpost-toggle-container">
                <p>공개</p>
                <div
                  className={`toggle-switch ${isPublic ? "active" : ""}`}
                  onClick={() => setIsPublic(!isPublic)} // Toggle public/private
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
        {errorMessage && <p className="error-message">{errorMessage}</p>}
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
