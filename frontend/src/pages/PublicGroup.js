import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/pictures/logo.png";
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

        // Fetch group details including isPublic
        const fetchedGroups = await Promise.all(
          response.data.data.map(async (group) => {
            const isPublicResponse = await axios.get(
              `/api/groups/${group.id}/is-public`
            );
            return { ...group, isPublic: isPublicResponse.data.isPublic };
          })
        );
        console.log(
          fetchedGroups.map((group) => ({
            name: group.name,
            postCount: group.postCount,
          }))
        );
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
    const filtered = groups.filter(
      (group) =>
        group.isPublic && // Only include public groups
        group.name.toLowerCase().includes(lowercasedQuery)
    );
    setFilteredGroups(filtered);
  }, [searchQuery, groups]);

  const handleSearch = (query) => {
    setSearchQuery(query); // 검색어를 상태로 설정
  };

  const handleFilterChange = (selectedFilter) => {
    setFilter(selectedFilter);

    // Filter only public groups before applying sorting
    let publicGroups = groups.filter((group) => group.isPublic); // Only include public groups

    let sortedGroups = [...publicGroups]; // Make a copy of the public groups array

    switch (selectedFilter) {
      case "공감순":
        sortedGroups.sort((a, b) => b.likeCount - a.likeCount); // Sort by most likes
        break;
      case "최신순":
        sortedGroups.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        ); // Sort by newest
        break;
      case "게시글 많은순":
        sortedGroups.sort((a, b) => b.postCount - a.postCount); // Sort by most posts
        break;
      case "획득 배지순":
        sortedGroups.sort((a, b) => b.badges.length - a.badges.length); // Sort by most badges
        break;
      default:
        break;
    }

    setFilteredGroups(sortedGroups); // Set the sorted public groups to the state
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
      <div className="logo-group-container">
        <img src={logo} alt="Logo" className="group-logo" />
        <div className="button-container">
          <CreateGroupButton onClick={handleCreateGroup} />
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
          placeholder="그룹명을 검색해 주세요"
        />
        <FilterSelect onFilterChange={handleFilterChange} />
      </div>
      {filteredGroups.length === 0 ? (
        <NoGroup type="public" onCreateGroup={handleCreateGroup} />
      ) : (
        <>
          <div className="group-list">
            {filteredGroups.map((group) => (
              <GroupCard
                key={group.id} // 중복 방지를 위한 key 사용
                id={group.id}
                name={group.name}
                imageUrl={group.imageUrl}
                isPublic={group.isPublic}
                likeCount={group.likeCount}
                badgeCount={group.badges.length}
                postCount={group.postCount}
                createdAt={group.createdAt}
                introduction={group.introduction}
              />
            ))}
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
