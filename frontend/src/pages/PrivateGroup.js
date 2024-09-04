import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ButtonGroup from "../components/ButtonGroup";
import CreateGroupButton from "../components/CreateGroupButton";
import FilterSelect from "../components/FilterSelect";
import GroupCard from "../components/GroupCard";
import LoadMoreButton from "../components/LoadMoreButton";
import SearchBar from "../components/SearchBar";
import "./PrivateGroup.css";

function PrivateGroup() {
  const navigate = useNavigate();
  const [activeButton, setActiveButton] = useState("private");
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
    // 검색 쿼리를 통해 필터링 로직 추가
  };

  const handleFilterChange = (selectedFilter) => {
    setFilter(selectedFilter);
    // 필터에 따라 그룹 목록을 정렬하는 로직 추가
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
    navigate("/"); // 공개 그룹 페이지로 이동
  };

  const handlePrivateClick = () => {
    setActiveButton("private");
    console.log("비공개 그룹 보기");
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
        {groups
          .filter((group) => !group.isPublic) // 비공개 그룹만 필터링
          .map((group) => (
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
