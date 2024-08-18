import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ButtonGroup from "../components/ButtonGroup";
import CreateGroupButton from "../components/CreateGroupButton";
import FilterSelect from "../components/FilterSelect";
import GroupCard from "../components/GroupCard";
import LoadMoreButton from "../components/LoadMoreButton";
import SearchBar from "../components/SearchBar";
import "./PublicGroup.css";

function PrivateGroup() {
  const navigate = useNavigate();
  const [activeButton, setActiveButton] = useState("public");
  // 상태 관리
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("공감순");
  const [groups, setGroups] = useState([
    // 예시 그룹 데이터
    {
      id: 1,
      date: "D+265",
      isPrivate: true,
      title: "달봉이네 가족",
      memories: 8,
      likes: "1.5K",
    },
    {
      id: 2,
      date: "D+265",
      isPrivate: true,
      title: "해봉이네 가족",
      memories: 10,
      likes: "2K",
    },
    // 추가 그룹 데이터
  ]);

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
    navigate("/privateGroup"); // 비공개 그룹 페이지로 이동
  };
  return (
    <div className="private-group-container">
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
      {/* 그룹 목록 */}
      <div className="group-list">
        {groups.map((group) => (
          <GroupCard
            key={group.id}
            date={group.date}
            isPrivate={group.isPrivate}
            title={group.title}
            memories={group.memories}
            likes={group.likes}
          />
        ))}
      </div>

      {/* 더보기 버튼 */}
      <LoadMoreButton onClick={handleLoadMore} />
    </div>
  );
}

export default PrivateGroup;
