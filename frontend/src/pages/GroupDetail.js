import axios from "axios";
import { React, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./GroupDetail.css";

function GroupDetail() {
  const { groupId } = useParams(); // URL에서 그룹 ID를 가져옴
  const [groupDetail, setGroupDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("groupId:", groupId);
    const fetchGroups = async () => {
      try {
        // 템플릿 리터럴을 사용하여 올바른 경로로 API 요청을 보냅니다.
        const response = await axios.get(`/api/groups/${groupId}`);
        console.log("Group Detail Response:", response.data); // 응답 데이터 확인
        setGroupDetail(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching group details:", error.message);
        if (error.response) {
          console.error("Server Response Error Data:", error.response.data); // 서버 응답의 에러 내용 확인
        }
        setError(error.response?.data?.message || error.message);
        setLoading(false);
      }
    };

    fetchGroups();
  }, [groupId]);

  // 로딩 상태 처리
  if (loading) {
    return <div>Loading...</div>;
  }

  // 에러 처리
  if (error) {
    return <div>Error: {error}</div>;
  }

  // 데이터가 없을 경우 처리
  if (!groupDetail) {
    return <div>No group details found</div>;
  }

  // 그룹 생성일로부터의 날짜 계산
  const daysPassed = Math.floor(
    (new Date() - new Date(groupDetail.createdAt)) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="group-detail-page">
      {/* 그룹 상세 정보 */}
      <div className="group-header">
        <div className="group-image">
          <img src={groupDetail.imageUrl} alt={groupDetail.name} />
        </div>
        <div className="group-info">
          <h1>{groupDetail.name}</h1>
          <div className="group-date">
            <span className="date">D+{daysPassed}</span>
            <span className="separator"> | </span>
            <span className="public">공개</span>
          </div>
          <p>{groupDetail.introduction || groupDetail.description}</p>
          <div className="group-badges">
            {groupDetail.badges.length > 0 ? (
              groupDetail.badges.map((badge, index) => (
                <span key={index} className="badge">
                  {badge}
                </span>
              ))
            ) : (
              <span>획득한 배지가 없습니다.</span>
            )}
          </div>
          <div className="group-stats">
            <span>추억 {groupDetail.postCount}</span> |{" "}
            <span>그룹 공감 {groupDetail.likeCount}</span>
          </div>
          <div className="group-actions">
            <button onClick={() => console.log("그룹 정보 수정하기")}>
              그룹 정보 수정하기
            </button>
            <button onClick={() => console.log("그룹 삭제하기")}>
              그룹 삭제하기
            </button>
            <button
              className="like-button"
              onClick={() => console.log("공감 보내기")}
            >
              공감 보내기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GroupDetail;
