import axios from "axios";
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

  const fetchPostData = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_USER}/posts/${postId}`,
        { withCredentials: true }
      );
      setPost(response.data);
    } catch (error) {
      setError("Failed to fetch post data");
      console.error("Error fetching post data:", error);
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
      const response = await axios.get(
        `${process.env.REACT_APP_USER}/posts/${postId}/comments`,
        { withCredentials: true }
      );
      // 응답 데이터가 배열 형태인지 확인
      if (Array.isArray(response.data.data)) {
        setComments(response.data.data); // 'data'가 댓글 배열
        setTotalPages(response.data.totalPages || 1); // 'totalPages' 설정
        setPost((prevPost) => ({
          ...prevPost,
          totalCommentCount: response.data.data.length || 0, // 'totalCommentCount' 업데이트
        }));
      } else {
        console.error("Unexpected response data format:", response.data);
      }
    } catch (error) {
      console.error(
        "Error fetching comments:",
        error.response ? error.response.data : error.message
      );
      setError("Failed to fetch comments");
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

  const handlePostEditSave = (updatedPost) => {
    setPost(updatedPost);
    fetchPostData();
    fetchComments();
    closeEditModal();
  };

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
      const response = await axios.get(
        `${process.env.REACT_APP_USER}/posts/${postId}/comments`,
        {
          params: { page: currentPage + 1 },
          withCredentials: true,
        }
      );
      if (Array.isArray(response.data.data)) {
        setComments((prevComments) => [...prevComments, ...response.data.data]);
        setCurrentPage((prevPage) => prevPage + 1);
        setTotalPages(response.data.totalPages || 1);
      } else {
        console.error("Error: Comments data is not an array");
      }
    } catch (error) {
      console.error("Error loading more comments:", error);
    }
  };

  const handlePostLikeClick = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_USER}/posts/${postId}/like`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      setMessage("게시글 공감하기 성공");
      setPost((prevPost) => ({
        ...prevPost,
        likeCount: response.data.likeCount, // 서버에서 받은 최신 likeCount 반영
      }));
    } catch (error) {
      console.error("Error sending like:", error);
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
              <img src={flower} alt="like-post-icon" className="flower-icon" />
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
                    {new Date(
                      new Date(comment.createdAt).getTime() + 9 * 60 * 60 * 1000 // UTC에 +9시간
                    )
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
