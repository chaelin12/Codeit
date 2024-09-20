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
        // API 요청 시작 로그
        console.log(`Fetching groups for page ${pageNum}...`);

        const response = await axios.get(
          `${process.env.REACT_APP_USER}/api/groups?page=${pageNum}`,
          { withCredentials: true }
        );

        // 응답 데이터 전체를 확인하기 위한 로그
        console.log("Full Response: ", response);

        // 그룹 데이터를 확인하기 위한 로그
        const groupData = response.data.data;
        console.log("Groups Data: ", groupData);

        const fetchedGroups = await Promise.all(
          (groupData || []).map(async (group) => {
            // groupId로 저장
            const groupId = group.id;
            console.log(`Fetching isPublic for group ${groupId}`);

            try {
              const isPublicResponse = await axios.get(
                `${process.env.REACT_APP_USER}/api/groups/${groupId}/is-public`,
                { withCredentials: true }
              );
              console.log(
                `Group ${groupId} isPublic status: `,
                isPublicResponse.data.isPublic
              );
              return { ...group, isPublic: isPublicResponse.data.isPublic };
            } catch (error) {
              console.error(
                `Error fetching isPublic for group ${groupId}:`,
                error.message
              );
              return { ...group, isPublic: false }; // 오류가 있을 경우 기본값으로 처리
            }
          })
        );

        // 가져온 그룹 데이터를 확인하기 위한 로그
        console.log("Fetched Groups: ", fetchedGroups);

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
        // 오류에 대한 상세 로그 추가
        console.error("Error fetching group data:", error.message);
        console.error("Full Error:", error); // 전체 오류 객체 확인
        setGroups([]); // 오류 발생 시 빈 그룹 설정
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

    // Filter only private groups before applying sorting
    let privateGroups = groups.filter((group) => !group.isPublic); // Only include private groups (isPublic is false)

    let sortedGroups = [...privateGroups]; // Make a copy of the private groups array

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
        sortedGroups.sort(
          (a, b) => (b.badges?.length || 0) - (a.badges?.length || 0)
        ); // Sort by most badges, ensuring `badges` is an array
        break;
      default:
        break;
    }

    setFilteredGroups(sortedGroups); // Set the sorted private groups to the state
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
