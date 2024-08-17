import React, { useState } from "react";
import Button from "../components/Button";
import "./AccessPrivate.css";

function AccessPrivate() {
  const [input, setInput] = useState({
    password: "",
  });

  const { password } = input;

  const onChange = (e) => {
    const value = e.target.value;
    const id = e.target.id;

    setInput({
      ...input,
      [id]: value,
    });
  };

  return (
    <div className="access-privategroup-container">
      <div className="title2">
        <h1>비공개 그룹</h1>
      </div>
      <div className="sub-title">
        <p>비공개 그룹에 접근하기 위한 권한 확인이 필요합니다.</p>
      </div>
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
      <Button type="submit">제출하기</Button>
    </div>
  );
}

export default AccessPrivate;
