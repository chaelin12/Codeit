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
import "./PrivateGroup.css";

function PrivateGroup() {
  const navigate = useNavigate();
  const [activeButton, setActiveButton] = useState("private");
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("공감순");
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchGroups = async (pageNum) => {
      try {
        const response = await axios.get(`/api/groups?page=${pageNum}`);
        const fetchedGroups = Array.isArray(response.data.data)
          ? response.data.data
          : [];
        console.log("Fetched groups:", fetchedGroups);

        const groupsWithPublicStatus = await Promise.all(
          fetchedGroups.map(async (group) => {
            try {
              const isPublicResponse = await axios.get(
                `/api/groups/${group.id}/is-public`
              );
              return { ...group, isPublic: isPublicResponse.data.isPublic };
            } catch (error) {
              console.error(
                `Error fetching isPublic for group ${group.id}:`,
                error.message
              );
              return { ...group, isPublic: false };
            }
          })
        );

        setGroups((prevGroups) => {
          const existingGroupIds = new Set(prevGroups.map((group) => group.id));
          const newGroups = groupsWithPublicStatus.filter(
            (group) => !existingGroupIds.has(group.id)
          );
          return [...prevGroups, ...newGroups];
        });

        if (fetchedGroups.length === 0) {
          setHasMore(false);
        }
      } catch (error) {
        console.error("그룹 데이터를 불러오는 데 실패했습니다:", error.message);
        setGroups([]);
      }
    };

    fetchGroups(page);
  }, [page]);

  useEffect(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = groups.filter(
      (group) =>
        !group.isPublic && group.name.toLowerCase().includes(lowercasedQuery)
    );
    setFilteredGroups(filtered);
  }, [searchQuery, groups]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (selectedFilter) => {
    setFilter(selectedFilter);
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
    navigate("/"); // 공개 그룹 페이지로 이동
  };

  const handlePrivateClick = () => {
    setActiveButton("private");
    console.log("비공개 그룹 보기");
  };

  return (
    <div className="private-group-container">
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
        <SearchBar onSearch={handleSearch} />
        <FilterSelect onFilterChange={handleFilterChange} />
      </div>
      {filteredGroups.length === 0 ? (
        <NoGroup type="private" onCreateGroup={handleCreateGroup} /> // Pass the "private" type prop here
      ) : (
        <>
          <div className="group-list">
            {filteredGroups.map((group) => (
              <GroupCard
                key={group.id}
                id={group.id}
                name={group.name}
                imageUrl={group.imageUrl}
                likeCount={group.likeCount}
                badgeCount={group.badgeCount}
                postCount={group.postCount}
                createdAt={group.createdAt}
                introduction={group.introduction}
                isPublic={group.isPublic}
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

export default PrivateGroup;
