import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import bubble from "../assets/pictures/bubble.png";
import deleteIcon from "../assets/pictures/delete.png";
import editIcon from "../assets/pictures/edit.png";
import flower from "../assets/pictures/flower.png";
import DeleteComment from "../components/DeleteComment";
import DeletePost from "../components/DeletePost";
import EditComment from "../components/EditComment";
import EditPost from "../components/EditPost";
import Button from "../components/FormButton";
import PostComment from "../components/PostComment"; // Ensure you have PostComment modal component
import "./PostDetail.css";

const PostDetail = () => {
  const { postId } = useParams(); // get postId from URL
  const [post, setPost] = useState(null); // to store the post data
  const [loading, setLoading] = useState(true); // to manage loading state
  const [error, setError] = useState(null); // to manage error state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State for edit modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // State for delete modal
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false); // State for comment modal
  const [isCommentEditModalOpen, setIsCommentEditModalOpen] = useState(false);
  const [isCommentDeleteModalOpen, setIsCommentDeleteModalOpen] =
    useState(false);
  const [comments, setComments] = useState([]); // store comments
  const [currentPage, setCurrentPage] = useState(1); // track current page for pagination
  const [totalPages, setTotalPages] = useState(1); // Total pages for comments

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        const response = await fetch(`/api/posts/${postId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch data");
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

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(
          `/api/posts/${postId}/comments?page=${currentPage}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch comments");
        }
        const data = await response.json();

        // 기존 댓글 배열에 덧붙이지 않고 새로 덮어씀
        setComments(data.data);
      } catch (error) {
        setError(error.message);
      }
    };
    fetchComments();
  }, [postId, currentPage]);

  const openEditModal = () => setIsEditModalOpen(true); // Open edit modal
  const closeEditModal = () => setIsEditModalOpen(false); // Close edit modal
  const openDeleteModal = () => setIsDeleteModalOpen(true); // Open delete modal
  const closeDeleteModal = () => setIsDeleteModalOpen(false); // Close delete modal
  const openCommentModal = () => setIsCommentModalOpen(true); // Open comment modal
  const closeCommentModal = () => setIsCommentModalOpen(false); // Close comment modal
  const openCommentEditModal = () => setIsCommentEditModalOpen(true); // Open comment modal
  const closeCommentEditModal = () => setIsCommentEditModalOpen(false); // Close comment modal
  const openCommentDeleteModal = () => setIsCommentDeleteModalOpen(true); // Open comment modal
  const closeCommentDeleteModal = () => setIsCommentDeleteModalOpen(false); // Close comment modal

  const handleCommentSubmit = async (newComment) => {
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newComment),
      });

      if (!response.ok) {
        throw new Error("Failed to submit comment");
      }

      const savedComment = await response.json();
      setComments([...comments, savedComment]); // Update comments
      closeCommentModal(); // Close the modal after submission
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const loadMoreComments = () => {
    setCurrentPage((prevPage) => prevPage + 1); // Increment page to load more comments
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!post) {
    return <div>No post details found</div>;
  }

  return (
    <div className="post-detail-page">
      <div className="post-header">
        <div className="post-name-action">
          <div className="post-info">
            <span className="post-nickname">{post.nickname}</span>
            <span className="separator"> | </span>
            <span className="post-public">
              {post.isPublic ? "공개" : "비공개"}
            </span>
          </div>
          <div className="post-actions">
            <div className="postedit" onClick={openEditModal}>
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
            <span className="post-location">{post.location}</span>
            <span> · </span>
            <span className="post-moment">
              {new Date(post.moment)
                .toISOString()
                .slice(2, 10)
                .replace(/-/g, ".")}
            </span>
          </div>
          <div className="post-icon">
            <img src={flower} alt="like-icon" />
            <span className="post-likeCount"> {post.likeCount}</span>
            <img src={bubble} alt="comment-icon" />
            <span className="post-commentCount">{post.commentCount}</span>
          </div>
          <div className="post-sendempathy">
            <button
              className="post-like-button"
              onClick={() => console.log("Send Empathy")}
            >
              공감 보내기
            </button>
          </div>
        </div>
      </div>
      <div className="section-divider"></div>
      {/* 이미지가 있을 때만 렌더링 */}
      {post.imageUrl && (
        <img
          src={post.imageUrl} // image fetched from server
          alt={post.title}
          className="post-image"
        />
      )}
      <div className="post-content">{post.content}</div>

      <Button type="button" onClick={openCommentModal}>
        댓글 등록하기
      </Button>

      <div className="comments-section">
        <p>댓글 {post.totalCommentCount}</p> {/* 댓글 개수 표시 */}
        <div className="first-section-divider"></div>
        <ul className="comments-list">
          {comments.map((comment, index) => (
            <li key={index} className="comment-item">
              <div className="comment-header">
                <span className="comment-user">{comment.nickname}</span>
                <span className="comment-date">
                  {new Date(comment.createdAt)
                    .toISOString()
                    .slice(2, 16)
                    .replace("T", " ")}
                </span>
              </div>
              <div className="comment-actions">
                <p className="comment-text">{comment.content}</p>
                <div className="comment-Icon">
                  <img
                    src={editIcon}
                    alt="edit Icon"
                    className="comment-edit-icon"
                    onClick={openCommentEditModal}
                  />
                  <img
                    src={deleteIcon}
                    alt="delete Icon"
                    className="comment-delete-icon"
                    onClick={openCommentDeleteModal}
                  />
                </div>
              </div>
              <div className="comment-divider"></div> {/* Divider */}
            </li>
          ))}
        </ul>
        {currentPage < totalPages && (
          <Button onClick={loadMoreComments}>댓글 더보기</Button>
        )}
      </div>
      {/* 모달 컴포넌트들 */}
      {isEditModalOpen && (
        <EditPost
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          groupId={post.groupId}
        />
      )}
      {isDeleteModalOpen && (
        <DeletePost
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          groupId={post.groupId}
        />
      )}
      {isCommentModalOpen && (
        <PostComment
          isOpen={isCommentModalOpen}
          onClose={closeCommentModal}
          onSubmit={handleCommentSubmit}
          postId={postId}
        />
      )}
      {isCommentEditModalOpen && (
        <EditComment
          isOpen={isCommentEditModalOpen}
          onClose={closeCommentEditModal}
          postId={postId}
        />
      )}
      {isCommentDeleteModalOpen && (
        <DeleteComment
          isOpen={isCommentDeleteModalOpen}
          onClose={closeCommentDeleteModal}
          postId={postId}
        />
      )}
    </div>
  );
};

export default PostDetail;
