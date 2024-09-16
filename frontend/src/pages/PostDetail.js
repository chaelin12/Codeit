import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isCommentEditModalOpen, setIsCommentEditModalOpen] = useState(false);
  const [isCommentDeleteModalOpen, setIsCommentDeleteModalOpen] =
    useState(false);
  const [comments, setComments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCommentId, setSelectedCommentId] = useState(null);
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  // Move this function outside of useEffect so it can be reused
  const fetchPostData = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch post data");
      }
      const data = await response.json();
      setPost(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // useEffect to fetch post data on component mount
  useEffect(() => {
    fetchPostData();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}/comments`);
      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }
      const data = await response.json();
      setComments(data.data || []); // 'data'가 실제 댓글 배열
      setTotalPages(data.totalPages || 1); // 'totalPages' 설정
      setPost((prevPost) => ({
        ...prevPost,
        totalCommentCount: data.data.length || 0, // 'totalCommentCount' 업데이트 (댓글 배열의 길이로 계산)
      }));
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const openEditModal = () => setIsEditModalOpen(true);
  const closeEditModal = () => setIsEditModalOpen(false);
  const openDeleteModal = () => setIsDeleteModalOpen(true);
  const closeDeleteModal = () => setIsDeleteModalOpen(false);
  const openCommentModal = () => setIsCommentModalOpen(true);
  const closeCommentModal = () => setIsCommentModalOpen(false);
  const openCommentEditModal = (commentId) => {
    setSelectedCommentId(commentId);
    setIsCommentEditModalOpen(true);
  };
  const closeCommentEditModal = () => setIsCommentEditModalOpen(false);
  const openCommentDeleteModal = (commentId) => {
    setSelectedCommentId(commentId);
    setIsCommentDeleteModalOpen(true);
  };
  const closeCommentDeleteModal = () => setIsCommentDeleteModalOpen(false);

  const handleCommentSubmit = (newComment) => {
    setComments((prevComments) =>
      Array.isArray(prevComments) ? [...prevComments, newComment] : [newComment]
    );
    setPost((prevPost) => ({
      ...prevPost,
      totalCommentCount: prevPost.totalCommentCount + 1, // 댓글 등록 시 totalCommentCount 증가
    }));

    fetchComments();
    closeCommentModal();
  };

  const handlePostEditSave = (updatedPost) => {
    setPost(updatedPost);
    fetchPostData();
    fetchComments();
    closeEditModal();
    
  };

  const handleCommentEditSave = (updatedComment) => {
    setComments((prevComments) =>
      Array.isArray(prevComments)
        ? prevComments.map((comment) =>
            comment.id === updatedComment.id ? updatedComment : comment
          )
        : [updatedComment]
    );
    fetchComments();
    closeCommentEditModal();
  };

  const handleDeleteComment = (deletedCommentId) => {
    setComments((prevComments) =>
      Array.isArray(prevComments)
        ? prevComments.filter((comment) => comment.id !== deletedCommentId)
        : []
    );
    setPost((prevPost) => ({
      ...prevPost,
      totalCommentCount: prevPost.totalCommentCount - 1, // 댓글 삭제 시 totalCommentCount 감소
    }));
    fetchComments();
  };

  const loadMoreComments = async () => {
    try {
      const response = await fetch(
        `/api/posts/${postId}/comments?page=${currentPage + 1}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch more comments");
      }
      const data = await response.json();
      if (Array.isArray(data.data)) {
        setComments((prevComments) => [...prevComments, ...data.data]); // 'data.data'가 댓글 배열
      } else {
        console.error("Error: Comments data is not an array");
      }
      setCurrentPage((prevPage) => prevPage + 1);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Error loading more comments:", error);
    }
  };

  const handlePostLikeClick = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMessage("게시글 공감하기 성공");
        setPost((prevPost) => ({
          ...prevPost,
          likeCount: data.likeCount, // 서버에서 받은 최신 likeCount 반영
        }));
      } else if (response.status === 404) {
        console.error("Post not found");
      } else {
        console.error("Error sending like:", response.statusText);
      }
    } catch (error) {
      console.error("Error sending like:", error.message);
    }
    fetchPostData();
    fetchComments();
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
          <div className="post-stats-icon">
            <div className="location-moment">
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
              <span className="post-commentCount">
                {post.totalCommentCount}
              </span>
            </div>
          </div>
          <div className="post-sendempathy">
            <button className="post-like-button" onClick={handlePostLikeClick}>
              공감 보내기
            </button>
          </div>
        </div>
      </div>
      <div className="section-divider"></div>
      {post.imageUrl && (
        <img src={post.imageUrl} alt={post.title} className="post-image" />
      )}
      <div className="post-content">{post.content}</div>

      <Button type="button" onClick={openCommentModal}>
        댓글 등록하기
      </Button>

      <div className="comments-section">
        <p>댓글 {post.totalCommentCount}</p>
        <div className="first-section-divider"></div>
        {Array.isArray(comments) && comments.length > 0 ? (
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
                      onClick={() => openCommentEditModal(comment.id)}
                    />
                    <img
                      src={deleteIcon}
                      alt="delete Icon"
                      className="comment-delete-icon"
                      onClick={() => openCommentDeleteModal(comment.id)}
                    />
                  </div>
                </div>
                <div className="comment-divider"></div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No comments available.</p>
        )}
        {currentPage < totalPages && (
          <Button onClick={loadMoreComments}>댓글 더보기</Button>
        )}
      </div>

      {isEditModalOpen && (
        <EditPost
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          groupId={post.groupId}
          postId={postId}
          onSave={handlePostEditSave}
        />
      )}
      {isDeleteModalOpen && (
        <DeletePost
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          groupId={post.groupId}
          postId={postId}
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
          commentId={selectedCommentId}
          onSave={handleCommentEditSave}
        />
      )}
      {isCommentDeleteModalOpen && (
        <DeleteComment
          isOpen={isCommentDeleteModalOpen}
          onClose={closeCommentDeleteModal}
          postId={postId}
          commentId={selectedCommentId}
          onDelete={handleDeleteComment}
        />
      )}
    </div>
  );
};

export default PostDetail;
