import axios from "axios";
import { React, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import flower from "../assets/pictures/flower.png";
import ButtonGroup from "../components/ButtonGroup";
import DeleteGroup from "../components/DeleteGroup";
import EditGroup from "../components/EditGroup";
import FilterSelect from "../components/FilterPostSelect";
import LoadMoreButton from "../components/LoadMoreButton";
import NoPost from "../components/NoPost"; // Import NoPost component
import PostCard from "../components/PostCard";
import SearchBar from "../components/SearchBar";
import "./GroupDetail.css";

function GroupDetail() {
  const { groupId } = useParams();
  const [groupDetail, setGroupDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeButton, setActiveButton] = useState("public");
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("공감순");
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const [page, setPage] = useState(1); // Add page state for pagination
  const [hasMorePosts, setHasMorePosts] = useState(true);

  const fetchGroups = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_USER}/groups/${groupId}`,
        { withCredentials: true }
      );
      setGroupDetail(response.data);

      const postsResponse = await axios.get(
        `${process.env.REACT_APP_USER}/groups/${groupId}/posts`,
        { withCredentials: true }
      );
      const fetchedPosts = postsResponse.data.data || [];
      setPosts(fetchedPosts);

      // Set only public posts by default
      const publicPosts = fetchedPosts.filter((post) => post.isPublic);
      setFilteredPosts(publicPosts);


      setLoading(false);
    } catch (error) {
      console.error("Error fetching group details:", error.message);
      if (error.response) {
        console.error("Server Response Error Data:", error.response.data);
      }
      setError(error.response?.data?.message || error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [groupId]);

  const handleDelete = async (password) => {
    try {
      await axios.delete(`${process.env.REACT_APP_USER}/groups/${groupId}`, {
        data: { password },
        withCredentials: true,
      });
      navigate("/groups");
    } catch (error) {
      console.error("Error deleting group:", error.message);
      if (error.response) {
        console.error("Server Response Error Data:", error.response.data);
      }
      setError(error.response?.data?.message || error.message);
    }
    closeDeleteModal();
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const openDeleteModal = () => setIsDeleteModalOpen(true);
  const closeDeleteModal = () => setIsDeleteModalOpen(false);

  const handleSave = (updatedDetails) => {
    setGroupDetail({ ...groupDetail, ...updatedDetails });
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (selectedFilter) => {
    setFilter(selectedFilter);
    filterAndSortPosts(posts, activeButton, selectedFilter);
  };
  const filterAndSortPosts = (posts, buttonState, selectedFilter) => {
    // 버튼 상태에 따라 공개/비공개 필터링
    let filtered =
      buttonState === "public"
        ? posts.filter((post) => post.isPublic)
        : posts.filter((post) => !post.isPublic);

    // 선택한 필터에 따라 정렬
    switch (selectedFilter) {
      case "최신순":
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "댓글순":
        filtered.sort((a, b) => b.commentCount - a.commentCount);
        break;
      case "공감순":
        filtered.sort((a, b) => b.likeCount - a.likeCount);
        break;
      default:
        break;
    }

    setFilteredPosts(filtered);
  };

  const handleLoadMore = async () => {
    try {
      const nextPage = page + 1; // Increment the page
      const postsResponse = await axios.get(
        `${process.env.REACT_APP_USER}/groups/${groupId}/posts?page=${nextPage}`,
        { withCredentials: true } // Include credentials if needed
      );

      const morePosts = postsResponse.data.data || [];

      if (morePosts.length > 0) {
        setPosts((prevPosts) => [...prevPosts, ...morePosts]); // Append new posts to existing ones
        setFilteredPosts((prevPosts) => [
          ...prevPosts,
          ...morePosts.filter((post) => post.isPublic),
        ]);
        setPage(nextPage); // Update the page number
      }

      setHasMorePosts(postsResponse.data.hasMore); // Update if there are more posts to load
    } catch (error) {
      console.error("Error loading more posts:", error.message);
    }
  };

  const handleUploadPostClick = () => {
    navigate(`/uploadPost/${groupId}`);
  };

  const handlePublicClick = () => {
    setActiveButton("public");
    filterAndSortPosts(posts, "public", filter);
  };

  const handlePrivateClick = () => {
    setActiveButton("private");
    filterAndSortPosts(posts, "private", filter);
  };

  const handleLikeClick = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_USER}/groups/${groupId}/like`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessage("그룹 공감하기 성공");

        // 공감 보내기 성공, 서버에서 반환된 likeCount로 업데이트
        setGroupDetail((prevDetail) => ({
          ...prevDetail,
          likeCount: data.likeCount, // 서버에서 받은 최신 likeCount
        }));
      } else if (response.status === 404) {
        setMessage("존재하지 않습니다");
      } else {
        setMessage("오류가 발생했습니다.");
        console.error("Error sending like:", response.statusText);
      }
    } catch (error) {
      console.error("Error sending like:", error.message);
    }
    fetchGroups();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!groupDetail) {
    return <div>No group details found</div>;
  }

  const daysPassed = Math.floor(
    (new Date() - new Date(groupDetail.createdAt)) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="group-detail-page">
      <div className="group-header">
        <div className="group-image">
          {groupDetail.imageUrl && (
            <img src={groupDetail.imageUrl} alt={groupDetail.name} />
          )}
        </div>
        <div className="group-info">
          <div className="group-date-actions">
            <div className="group-date">
              <span className="date">D+{daysPassed}</span>
              <span className="separator"> | </span>
              <span className="public">
                {groupDetail.isPublic ? "공개" : "비공개"}
              </span>
            </div>
            <div className="group-actions">
              <div className="groupedit" onClick={openModal}>
                그룹 정보 수정하기
              </div>
              <div className="groupdelete" onClick={openDeleteModal}>
                그룹 삭제하기
              </div>
            </div>
          </div>
          <div className="group-name-stats">
            <div className="group-name">{groupDetail.name}</div>
            <div className="group-stats-sum">
              <span>추억 {groupDetail.postCount}</span>
              <span className="group-separator"> | </span>
              <span>그룹 공감 {groupDetail.likeCount}</span>
            </div>
          </div>
          <div className="introduction">{groupDetail.introduction}</div>
          <div className="group-badges-actions">
            <div className="group-badges">
              {groupDetail?.badges?.includes("7 Day Post Streak") && (
                <span className="badge">👾 7일 연속 추억 등록</span>
              )}
              {groupDetail?.badges?.includes("10+ Group Likes") && (
                <span className="badge">🌼 그룹 공감 10회 이상 받기</span>
              )}
              {groupDetail?.badges?.includes("10+ Memory Likes") && (
                <span className="badge">💖 추억 공감 10회 이상 받기</span>
              )}
              {groupDetail?.badges?.includes("20+ Memories") && (
                <span className="badge">🍀 추억 20개 이상 등록</span>
              )}
              {groupDetail?.badges?.includes("1 Year Anniversary") && (
                <span className="badge">🌟 그룹 생성 1년 달성</span>
              )}
            </div>

            <div className="sendempathy">
              <button className="like-button" onClick={handleLikeClick}>
                <img
                  src={flower}
                  alt="like-post-icon"
                  className="flower-icon"
                />
                공감 보내기
              </button>
            </div>
          </div>
        </div>
      </div>
      <EditGroup
        isOpen={isModalOpen}
        closeModal={closeModal}
        groupDetail={groupDetail}
        onSave={handleSave}
        groupId={groupId}
      />
      {isDeleteModalOpen && (
        <DeleteGroup
          onClose={closeDeleteModal}
          onDelete={handleDelete}
          groupId={groupId}
        />
      )}
      <div className="section-divider"></div>
      <div className="memory-list-section">
        <div className="memory-title">
          <h1>추억 목록</h1>
          <div className="create-memory-button-container">
            <button
              className="create-group-button"
              onClick={handleUploadPostClick}
            >
              추억 올리기
            </button>
          </div>
        </div>
        <div className="top-bar">
          <ButtonGroup
            activeButton={activeButton}
            onPublicClick={handlePublicClick}
            onPrivateClick={handlePrivateClick}
          />
          <SearchBar
            onSearch={handleSearch}
            placeholder="태그 혹은 제목을 입력해 주세요"
          />
          <FilterSelect onFilterChange={handleFilterChange} />
        </div>
        {filteredPosts.length === 0 ? (
          <NoPost type="group" /> // Pass the "group" type prop here
        ) : (
          <div className="memory-cards">
            {filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                id={post.id}
                nickname={post.nickname}
                title={post.title}
                content={post.content}
                imageUrl={post.imageUrl}
                tags={post.tags}
                location={post.location}
                moment={post.moment}
                likeCount={post.likeCount}
                commentCount={post.commentCount}
                isPublic={post.isPublic}
              />
            ))}
          </div>
        )}
        <div className="load-more-container">
          {hasMorePosts ? (
            <LoadMoreButton onClick={handleLoadMore} />
          ) : (
            <p>더 이상 추억이 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default GroupDetail;
