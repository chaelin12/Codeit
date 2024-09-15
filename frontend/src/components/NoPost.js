import React from "react";
import NoPostImage from "../assets/pictures/nogroup.png";
import FormButton from "./FormButton";
import "./NoPost.css";

function NoGroup({ OnUploadPost }) {
  return (
    <div className="no-post-container">
      <img
        src={NoPostImage}
        alt="게시된 추억이 없습니다."
        className="no-post-image"
      />
      <p className="no-post-text">게시된 추억이 없습니다.</p>
      <p className="no-post-subtext">첫 번쨰 추억을 올려보세요!</p>
      <FormButton onClick={OnUploadPost}>추억 올리기</FormButton>
    </div>
  );
}

export default NoGroup;
