import axios from "axios";
import { React, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ButtonGroup from "../components/ButtonGroup";
import DeleteGroup from "../components/DeleteGroup";
import EditGroup from "../components/EditGroup";
import FilterSelect from "../components/FilterSelect";
import LoadMoreButton from "../components/LoadMoreButton";
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
  const [groups, setGroups] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axios.get(`/api/groups/${groupId}`);
        console.log("Group Detail Response:", response.data);
        setGroupDetail(response.data);

        const postsResponse = await axios.get(`/api/groups/${groupId}/posts`);
        console.log("Posts Response:", postsResponse.data);
        setPosts(postsResponse.data.data || []);
        setFilteredPosts(postsResponse.data.data || []);

        // 클라이언트에서 postCount 설정
        setGroupDetail((prevDetail) => ({
          ...prevDetail,
          postCount: postsResponse.data.data.length,
        }));

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

    fetchGroups();
  }, [groupId]);

  const handleDelete = async (password) => {
    try {
      await axios.delete(`/api/groups/${groupId}`, {
        data: { password },
      });
      console.log("Group deleted successfully");
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
    console.log("Updated Group Details:", updatedDetails);
    setGroupDetail({ ...groupDetail, ...updatedDetails });
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (selectedFilter) => {
    setFilter(selectedFilter);
  };

  const handleLoadMore = () => {
    // 추가 로직 구현 필요
  };

  const handleUploadPostClick = () => {
    navigate(`/uploadPost/${groupId}`);
  };

  const handlePublicClick = () => {
    setActiveButton("public");
    const publicPosts = posts.filter((post) => post.isPublic); // Filter posts where isPublic is true
    setFilteredPosts(publicPosts);
    console.log("공개 그룹 보기");
  };

  const handlePrivateClick = () => {
    setActiveButton("private");
    const privatePosts = posts.filter((post) => !post.isPublic); // Filter posts where isPublic is false
    setFilteredPosts(privatePosts);
    console.log("비공개 그룹 보기");
  };

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPosts(posts);
    } else {
      const filtered = posts.filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
      setFilteredPosts(filtered);
    }
  }, [searchQuery, posts]);

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
              {groupDetail.badges.length > 0 ? (
                groupDetail.badges.map((badge, index) => (
                  <span key={index} className="badge">
                    {badge}
                  </span>
                ))
              ) : (
                <span>획득한 배지가 없습니다.</span>
              )}
            </div>
            <div className="sendempathy">
              <button
                className="like-button"
                onClick={() => console.log("공감 보내기")}
              >
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

        <div className="memory-cards">
          {Array.isArray(filteredPosts) && filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
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
                isPublic={post.isPublic}
              />
            ))
          ) : (
            <p>등록된 추억이 없습니다.</p>
          )}
        </div>

        <LoadMoreButton onLoadMore={handleLoadMore} />
      </div>
    </div>
  );
}

export default GroupDetail;
