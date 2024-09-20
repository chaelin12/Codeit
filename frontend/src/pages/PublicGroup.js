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
          `${process.env.REACT_APP_USER}/api/groups?page=${pageNum}`,
          { withCredentials: true }
        );

        const fetchedGroups = await Promise.all(
          (response.data.data || []).map(async (group) => {
            // groupId로 저장
            const groupId = group.id;

            // groupId를 이용해 public 여부 확인하는 요청
            const isPublicResponse = await axios.get(
              `${process.env.REACT_APP_USER}/api/groups/${groupId}/is-public`, // groupId를 사용하여 경로 설정
              { withCredentials: true }
            );
            return { ...group, isPublic: isPublicResponse.data.isPublic };
          })
        );

        console.log("Group : ", response);
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

    fetchGroups(page);
  }, [page]);

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
