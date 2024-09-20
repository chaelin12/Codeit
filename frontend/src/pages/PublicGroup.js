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
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchGroups = async (pageNum) => {
      try {
     

        const response = await axios.get(
          `${process.env.REACT_APP_USER}/groups?page=${pageNum}`,
          { withCredentials: true }
        );
    

        const groupData = response.data.data;
        if (!groupData) {
          console.error("No group data received"); // 로그 추가: 그룹 데이터가 없을 때
          return;
        }

    

        const fetchedGroups = await Promise.all(
          (groupData || []).map(async (group) => {
            const groupId = group.id;
     

            try {
              const isPublicResponse = await axios.get(
                `${process.env.REACT_APP_USER}/groups/${groupId}/is-public`,
                { withCredentials: true }
              );
              return { ...group, isPublic: isPublicResponse.data.isPublic };
            } catch (error) {
              console.error(
                `Error fetching isPublic for group ${groupId}:`,
                error.message
              ); // 로그 추가: isPublic 요청 실패 시
              return { ...group, isPublic: false }; // 실패하면 기본값을 false로 설정
            }
          })
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
        console.error("Failed to fetch group data:", error.message); // 로그 추가: 전체 fetch 오류 처리
      }
    };

    fetchGroups(page); // page 값을 이용해 그룹 가져오기
  }, [page]); // page가 변경될 때마다 실행

  useEffect(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = groups.filter(
      (group) =>
        group.isPublic && group.name.toLowerCase().includes(lowercasedQuery)
    );
    setFilteredGroups(filtered);
  }, [searchQuery, groups]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (selectedFilter) => {
    setFilter(selectedFilter);

    let publicGroups = groups.filter((group) => group.isPublic);
    let sortedGroups = [...publicGroups];

    switch (selectedFilter) {
      case "공감순":
        sortedGroups.sort((a, b) => b.likeCount - a.likeCount);
        break;
      case "최신순":
        sortedGroups.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        break;
      case "게시글 많은순":
        sortedGroups.sort((a, b) => b.postCount - a.postCount);
        break;
      case "획득 배지순":
        sortedGroups.sort((a, b) => {
          const badgeCountA = Number(a.badgeCount ?? 0);
          const badgeCountB = Number(b.badgeCount ?? 0);

          if (badgeCountB !== badgeCountA) {
            return badgeCountB - badgeCountA;
          }

          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        break;

      default:
        break;
    }

    setFilteredGroups(sortedGroups);
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
                key={group.id}
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
