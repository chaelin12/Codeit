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
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("공감순");
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]); // 필터링된 그룹 목록
  const [page, setPage] = useState(1); // 페이지 번호 상태 추가
  const [hasMore, setHasMore] = useState(true); // 더 불러올 데이터가 있는지 여부

  useEffect(() => {
    const fetchGroups = async (pageNum) => {
      try {
        const response = await axios.get(`/api/groups?page=${pageNum}`);

        const fetchedGroups = Array.isArray(response.data.data)
          ? response.data.data
          : [];

        setGroups((prevGroups) => {
          const existingGroupIds = new Set(prevGroups.map((group) => group.id));
          const newGroups = fetchedGroups.filter(
            (group) => !existingGroupIds.has(group.id)
          );
          return [...prevGroups, ...newGroups];
        });

        if (fetchedGroups.length === 0) {
          setHasMore(false);
        }
      } catch (error) {
        console.error("그룹 데이터를 불러오는 데 실패했습니다:", error.message);
      }
    };

    // 페이지가 변경될 때마다 새로운 그룹 데이터를 가져옵니다.
    fetchGroups(page);
  }, [page]);

  // 검색 쿼리에 따라 그룹 목록을 필터링
  useEffect(() => {
    const lowercasedQuery = searchQuery.toLowerCase(); // 검색어를 소문자로 변환
    const filtered = groups.filter((group) =>
      group.name.toLowerCase().includes(lowercasedQuery)
    );
    setFilteredGroups(filtered);
  }, [searchQuery, groups]);

  const handleSearch = (query) => {
    setSearchQuery(query); // 검색어를 상태로 설정
  };

  const handleFilterChange = (selectedFilter) => {
    setFilter(selectedFilter);
    // 필터에 따른 정렬 로직 추가 가능
  };

  const handleLoadMore = () => {
    if (hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handleCreateGroup = () => {
    navigate("/creategroup");
  };

  const handlePublicClick = () => {
    setActiveButton("public");
  };

  const handlePrivateClick = () => {
    setActiveButton("private");
    navigate("/PrivateGroup");
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
      {filteredGroups.length === 0 ? (
        <NoGroup onCreateGroup={handleCreateGroup} />
      ) : (
        <>
          <div className="group-list">
            {filteredGroups.map(
              (group) =>
                group.isPublic && (
                  <GroupCard
                    key={group.id} // 중복 방지를 위한 key 사용
                    id={group.id}
                    name={group.name}
                    imageUrl={group.imageUrl}
                    isPublic={group.isPublic}
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
            {hasMore ? (
              <LoadMoreButton onClick={handleLoadMore} />
            ) : (
              <p>더 이상 그룹이 없습니다.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default PublicGroup;
