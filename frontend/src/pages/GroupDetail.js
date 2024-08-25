import axios from "axios";
import { React, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ButtonGroup from "../components/ButtonGroup";
import EditModal from "../components/EditModal";
import FilterSelect from "../components/FilterSelect";
import LoadMoreButton from "../components/LoadMoreButton";
import SearchBar from "../components/SearchBar";
import "./GroupDetail.css";

function GroupDetail() {
  const { groupId } = useParams(); // URL에서 그룹 ID를 가져옴
  const [groupDetail, setGroupDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [activeButton, setActiveButton] = useState("public");
  // 상태 관리
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("공감순");
  const [groups, setGroups] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    console.log("groupId:", groupId);
    const fetchGroups = async () => {
      try {
        // 템플릿 리터럴을 사용하여 올바른 경로로 API 요청을 보냅니다.
        const response = await axios.get(`/api/groups/${groupId}`);
        console.log("Group Detail Response:", response.data); // 응답 데이터 확인
        setGroupDetail(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching group details:", error.message);
        if (error.response) {
          console.error("Server Response Error Data:", error.response.data); // 서버 응답의 에러 내용 확인
        }
        setError(error.response?.data?.message || error.message);
        setLoading(false);
      }
    };
    fetchGroups();
  }, [groupId]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleSave = (updatedDetails) => {
    // 업데이트된 그룹 정보 저장 로직 추가
    console.log("Updated Group Details:", updatedDetails);
    // 실제 API 호출을 통해 서버에 업데이트된 데이터를 보낼 수 있습니다.
    setGroupDetail({ ...groupDetail, ...updatedDetails });
  };

  // 로딩 상태 처리
  if (loading) {
    return <div>Loading...</div>;
  }

  // 에러 처리
  if (error) {
    return <div>Error: {error}</div>;
  }

  // 데이터가 없을 경우 처리
  if (!groupDetail) {
    return <div>No group details found</div>;
  }

  // 그룹 생성일로부터의 날짜 계산
  const daysPassed = Math.floor(
    (new Date() - new Date(groupDetail.createdAt)) / (1000 * 60 * 60 * 24)
  );

  const handleSearch = (query) => {
    setSearchQuery(query);
    // 실제로는 여기에서 검색 쿼리를 통해 필터링 로직이 추가되어야 합니다.
  };

  const handleFilterChange = (selectedFilter) => {
    setFilter(selectedFilter);
    // 필터에 따라 그룹 목록을 정렬하는 로직을 여기에 추가
  };

  const handleLoadMore = () => {
    // "더보기" 버튼 클릭 시 더 많은 그룹 데이터를 불러오는 로직 추가
  };

  const handleUploadPostClick = () => {
    navigate("/UploadPost");
  };

  const handlePublicClick = () => {
    setActiveButton("public");
    console.log("공개 그룹 보기");
  };

  const handlePrivateClick = () => {
    setActiveButton("private");
    navigate("/GroupDetail"); // 비공개 그룹 페이지로 이동
  };

  return (
    <div className="group-detail-page">
      {/* 그룹 상세 정보 */}
      <div className="group-header">
        <div className="group-image">
          <img src={groupDetail.imageUrl} alt={groupDetail.name} />
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
                <EditModal
                  isOpen={isModalOpen}
                  closeModal={closeModal}
                  groupDetail={groupDetail}
                  onSave={handleSave}
                />
              </div>
              <div className="groupdelete">그룹 삭제하기</div>
            </div>
          </div>
          <div className="group-name-stats">
            <div className="group-name">{groupDetail.name}</div>
            <div className="group-stats">
              <span>추억 {groupDetail.postCount}</span>
              <span className="separator"> | </span>
              <span>그룹 공감 {groupDetail.likeCount}</span>
            </div>
          </div>
          <div className="introduction">{groupDetail.introduction}</div>
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
      <div className="section-divider"></div>
      <div className="memory-list-section">
        <div className="memory-title">
          <h1>추억 목록</h1>
        </div>
        <div className="create-memory-button-container">
          <button
            className="create-group-button"
            onClick={handleUploadPostClick}
          >
            추억 만들기
          </button>
        </div>
        <div className="top-bar">
          <ButtonGroup
            activeButton={activeButton}
            onPublicClick={handlePublicClick}
            onPrivateClick={handlePrivateClick}
          />
          <SearchBar onSearch={handleSearch} />
          <FilterSelect onFilterChange={handleFilterChange} />
        </div>
        <div className="memory-cards">
          {/* 추억 카드들이 이곳에 표시됩니다 */}
        </div>
        <LoadMoreButton onClick={handleLoadMore} />
      </div>
    </div>
  );
}

export default GroupDetail;
