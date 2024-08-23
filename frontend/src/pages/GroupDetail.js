import axios from "axios";
import { React, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./GroupDetail.css";

function GroupDetail() {
  const { id } = useParams(); // URL에서 그룹 ID를 가져옴
  const [groupDetail, setGroupDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [groups, setGroups] = useState([]);

  useEffect(() => {
    // 백엔드에서 그룹 데이터를 가져오는 로직을 여기에 추가
    const fetchGroups = async () => {
      try {
        // 필요한 최소한의 헤더만 설정합니다.
        const response = await axios.get("/api/groups/{groupId}");
        setGroupDetail(response.data); // 서버에서 가져온 그룹 정보를 상태에 저장
        setGroups(response.data.groups); // 그룹 리스트 설정
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchGroups();
  }, [id]);

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

  return (
    <div className="group-detail-page">
      {/* 그룹 상세 정보 */}
      <div className="group-header">
        <div className="group-image">
          <img src={groupDetail.imageUrl} alt={groupDetail.name} />
        </div>
        <div className="group-info">
          <h1>{groupDetail.name}</h1>
          <p className="group-status">
            D+{groupDetail.days} | {groupDetail.isPublic ? "공개" : "비공개"}
          </p>
          <p>{groupDetail.description}</p>
          <div className="group-badges">
            {groupDetail.badges.map((badge) => (
              <span key={badge.id} className="badge">
                {badge.name}
              </span>
            ))}
          </div>
          <div className="group-stats">
            <span>추억 {groupDetail.memoryCount}</span> |{" "}
            <span>그룹 공감 {groupDetail.likeCount}</span>
          </div>
          <div className="group-actions">
            <button onClick={() => console.log("그룹 정보 수정하기")}>
              그룹 정보 수정하기
            </button>
            <button onClick={() => console.log("그룹 삭제하기")}>
              그룹 삭제하기
            </button>
            <button className="like-button">공감 보내기</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GroupDetail;
