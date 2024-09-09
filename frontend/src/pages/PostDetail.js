import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // postId를 라우트 파라미터로 받기 위해 사용
import bubble from "../assets/pictures/bubble.png";
import flower from "../assets/pictures/flower.png";
import "./PostDetail.css";

const PostDetail = () => {
  const { postId } = useParams(); // postId를 URL에서 가져옴
  const [post, setPost] = useState(null); // 포스트 데이터를 저장할 state
  const [loading, setLoading] = useState(true); // 로딩 상태 관리
  const [error, setError] = useState(null); // 에러 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // API로부터 포스트 데이터를 받아오는 함수
  useEffect(() => {
    const fetchPostData = async () => {
      try {
        const response = await fetch(`/api/posts/${postId}`);
        if (!response.ok) {
          throw new Error("데이터를 불러오는데 실패했습니다.");
        }
        const data = await response.json();
        setPost(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPostData();
  }, [postId]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const openDeleteModal = () => setIsDeleteModalOpen(true);
  const closeDeleteModal = () => setIsDeleteModalOpen(false);

  if (loading) {
    return <div>Loading...</div>; // 로딩 중일 때
  }

  if (error) {
    return <div>Error: {error}</div>; // 에러가 있을 때
  }

  if (!post) {
    return <div>No group details found</div>; // 포스트 데이터가 없을 때
  }

  return (
    <div className="post-detail-page">
      <div className="post-header">
        <div className="post-name-action">
          <div className="post-info">
            <span className="post-nickname">{post.nickname}</span>
            <span className="separator"> | </span>
            <span className="post-public">
              {PostDetail.isPublic ? "공개" : "비공개"}
            </span>
          </div>
          <div className="post-actions">
            <div className="postedit" onClick={openModal}>
              추억 수정하기
            </div>
            <div className="postdelete" onClick={openDeleteModal}>
              추억 삭제하기
            </div>
          </div>
        </div>
        <div className="post-title">{post.title}</div>
        <div className="post-tags">
          {post.tags.map((tag, index) => (
            <span key={index} className="post-tag">
              #{tag}
            </span>
          ))}
        </div>
        <div className="post-stats">
          <div className="post-num">
            <span className="post-lotation">{post.location}</span>{" "}
            <span> · </span>
            <span className="post-moment">
              {new Date(post.moment)
                .toISOString()
                .slice(2, 10)
                .replace(/-/g, ".")}
            </span>
          </div>
          <div className="post-icon">
            <img src={flower}></img>
            <span className="post-likeCount"> {post.likeCount}</span>
            <img src={bubble}></img>
            <span className="post-commentCount">{post.commentCount}</span>
          </div>
          <div className="post-sendempathy">
            <button
              className="post-like-button"
              onClick={() => console.log("공감 보내기")}
            >
              공감 보내기
            </button>
          </div>
        </div>
      </div>
      <div className="section-divider"></div>
      <div className="post-image-container">
        <img
          src={post.imageUrl} // 서버에서 가져온 이미지 경로
          alt={post.title}
          className="post-image"
        />
        <div className="post-content">{post.content}</div>
      </div>
    </div>
  );
};

export default PostDetail;
