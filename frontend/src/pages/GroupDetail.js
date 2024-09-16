import axios from "axios";
import { React, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ButtonGroup from "../components/ButtonGroup";
import DeleteGroup from "../components/DeleteGroup";
import EditGroup from "../components/EditGroup";
import FilterSelect from "../components/FilterSelect";
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

  const fetchGroups = async () => {
    try {
      const response = await axios.get(`/api/groups/${groupId}`);
      console.log("Group Detail Response:", response.data);
      setGroupDetail(response.data);

      const postsResponse = await axios.get(`/api/groups/${groupId}/posts`);
      console.log("Posts Response:", postsResponse.data);
      const fetchedPosts = postsResponse.data.data || [];
      setPosts(fetchedPosts);

      // Set only public posts by default
      const publicPosts = fetchedPosts.filter((post) => post.isPublic);
      setFilteredPosts(publicPosts);

      // 클라이언트에서 postCount 설정
      setGroupDetail((prevDetail) => ({
        ...prevDetail,
        postCount: publicPosts.length,
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

  useEffect(() => {
    fetchGroups();
  }, [groupId]);

  const checkSevenDayStreak = (posts) => {
    const postDates = posts
      .map((post) => new Date(post.createdAt)) // 게시물 등록 날짜를 Date 객체로 변환
      .sort((a, b) => a - b); // 날짜 순으로 정렬

    let streak = 1;
    for (let i = 1; i < postDates.length; i++) {
      const diffInTime = postDates[i] - postDates[i - 1]; // 이전 게시물과의 시간 차이
      const diffInDays = diffInTime / (1000 * 60 * 60 * 24); // 일 단위로 변환

      if (diffInDays === 1) {
        // 두 게시물 간의 차이가 1일이면 연속 게시물로 간주
        streak++;
      } else if (diffInDays > 1) {
        // 차이가 1일 이상이면 연속성이 끊어짐
        streak = 1;
      }

      if (streak === 7) {
        // 7일 연속 게시물이 등록된 경우
        return true;
      }
    }

    return false; // 7일 연속 게시물이 등록되지 않은 경우
  };

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
    // Only show public posts when the "공개" button is clicked
    setFilteredPosts(posts.filter((post) => post.isPublic));
    console.log("공개 그룹 보기");
  };

  const handlePrivateClick = () => {
    setActiveButton("private");
    // Only show private posts when the "비공개" button is clicked
    setFilteredPosts(posts.filter((post) => !post.isPublic));
    console.log("비공개 그룹 보기");
  };

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPosts(posts.filter((post) => post.isPublic)); // Ensure it only searches public posts
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

  const handleLikeClick = async () => {
    try {
      const response = await fetch(`/api/groups/${groupId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

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

  const sevenDayPostStreak = checkSevenDayStreak(posts); // 7일 연속 게시물 확인
  const groupLikesBadge = groupDetail.likeCount >= 10000;
  const memoryLikesBadge =
    posts.reduce((acc, post) => acc + post.likeCount, 0) >= 10000;

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
              {sevenDayPostStreak && (
                <span className="badge">👾 7일 연속 게시물 등록</span>
              )}
              {groupLikesBadge && (
                <span className="badge">🌼 그룹 공감 1만 개 이상 받기</span>
              )}
              {memoryLikesBadge && (
                <span className="badge">💖 추억 공감 1만 개 이상 받기</span>
              )}
            </div>
            <div className="sendempathy">
              <button className="like-button" onClick={handleLikeClick}>
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
        <LoadMoreButton onLoadMore={handleLoadMore} />
      </div>
    </div>
  );
}

export default GroupDetail;
