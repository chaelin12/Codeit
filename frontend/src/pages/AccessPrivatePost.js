import axios from "axios";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../components/FormButton";

function AccessPrivatePost() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [input, setInput] = useState({ password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { password } = input;

  const onChange = (e) => {
    const value = e.target.value;
    const id = e.target.id;

    setInput({ ...input, [id]: value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_USER}/posts/${postId}/verify-password`,
        { password },
        {
          withCredentials: true, // 자격 증명을 포함
        }
      );

      console.log("Server response:", response); // Debug log
      if (response.status === 200) {
        navigate(`/postdetail/${postId}`);
      }
    } catch (error) {
      console.error("Error during password verification:", error); // Debug log
      if (error.response && error.response.status === 401) {
        setError("비밀번호가 틀렸습니다");
      } else {
        setError("오류가 발생했습니다. 다시 시도해 주세요.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="access-privategroup-container">
      <div className="title2">
        <h1>비공개 추억</h1>
      </div>
      <div className="sub-title">
        <p>비공개 추억에 접근하기 위한 권한 확인이 필요합니다.</p>
      </div>
      <form onSubmit={onSubmit}>
        <div className="input-password">
          <label>비밀번호를 입력해 주세요</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={onChange}
            placeholder="비밀번호를 입력해 주세요"
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <Button type="submit" disabled={loading}>
          제출하기
        </Button>
      </form>
    </div>
  );
}

export default AccessPrivatePost;
