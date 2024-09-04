import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ButtonGroup from "../components/ButtonGroup";
import CreateGroupButton from "../components/CreateGroupButton";
import FilterSelect from "../components/FilterSelect";
import GroupCard from "../components/GroupCard";
import LoadMoreButton from "../components/LoadMoreButton";
import NoGroup from "../components/NoGroup";
import SearchBar from "../components/SearchBar";
import "./PublicGroup.css";

function PublicGroup() {
  const navigate = useNavigate();
  const [activeButton, setActiveButton] = useState("public");
  // 상태 관리
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("공감순");
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    // 백엔드에서 그룹 데이터를 가져오는 로직을 여기에 추가
    const fetchGroups = async () => {
      try {
        // 필요한 최소한의 헤더만 설정합니다.
        const response = await axios.get("/api/groups");

        const fetchedGroups = Array.isArray(response.data.data)
          ? response.data.data
          : [];

        setGroups(fetchedGroups);
      } catch (error) {
        console.error("그룹 데이터를 불러오는 데 실패했습니다:", error.message);
        setGroups([]); // 오류 발생 시 빈 배열로 초기화
      }
    };
    fetchGroups();
  }, []);

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

  const handleCreateGroup = () => {
    navigate("/creategroup");
    // 그룹 만들기 로직을 여기에 추가
  };

  const handlePublicClick = () => {
    setActiveButton("public");
    console.log("공개 그룹 보기");
  };

  const handlePrivateClick = () => {
    setActiveButton("private");
    navigate("/PrivateGroup"); // 비공개 그룹 페이지로 이동
  };

  return (
    <div className="public-group-container">
      <div className="create-group-button-container">
        <CreateGroupButton onClick={handleCreateGroup} />
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
      {/* 그룹이 없을 때 NoGroup 컴포넌트 표시 */}
      {groups.length === 0 ? (
        <NoGroup onCreateGroup={handleCreateGroup} />
      ) : (
        <>
          <div className="group-list">
            {groups.map(
              (group) =>
                group.isPublic && ( // 공개 그룹만 렌더링
                  <GroupCard
                    key={group.id} // key 속성 추가
                    id={group.id}
                    name={group.name}
                    imageUrl={group.imageUrl}
                    isPublic={group.isPublic} // 올바른 값 전달
                    likeCount={group.likeCount}
                    badgeCount={group.badges}
                    postCount={group.postCount}
                    createdAt={group.createdAt}
                    introduction={group.introduction}
                  />
                )
            )}
          </div>
          <div className="load-more-container">
            <LoadMoreButton onClick={handleLoadMore} />
          </div>
        </>
      )}
    </div>
  );
}

export default PublicGroup;
