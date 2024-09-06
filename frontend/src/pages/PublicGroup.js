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
  const [page, setPage] = useState(1); // 페이지 번호 상태 추가
  const [hasMore, setHasMore] = useState(true); // 더 불러올 데이터가 있는지 여부

  useEffect(() => {
    const fetchGroups = async (pageNum) => {
      try {
        const response = await axios.get(`/api/groups?page=${pageNum}`);

        const fetchedGroups = Array.isArray(response.data.data)
          ? response.data.data
          : [];

        // 중복 제거 로직 추가
        setGroups((prevGroups) => {
          // 그룹의 고유 ID를 기준으로 중복을 제거
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

  const handleSearch = (query) => {
    setSearchQuery(query);
    // 검색 쿼리를 기반으로 필터링된 그룹 데이터를 불러오는 로직 추가 가능
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
      {groups.length === 0 ? (
        <NoGroup onCreateGroup={handleCreateGroup} />
      ) : (
        <>
          <div className="group-list">
            {groups.map(
              (group) =>
                group.isPublic && ( // 공개 그룹만 렌더링
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
