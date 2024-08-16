import "../components/createGroup.css";
import { createGroupForm } from "../components/createGroupForm.js";
import "./createGroup.css";

// 페이지 로드 시 그룹 만들기 폼을 렌더링
window.onload = () => {
  const root = document.getElementById("root");
  root.appendChild(createGroupForm());
};
