import "../components/createGroupForm.css"; // 폼 스타일
import { createGroupForm } from "../components/createGroupForm.js";
import "./createGroup.css"; // 페이지 스타일

window.onload = () => {
  const root = document.getElementById("root");
  root.appendChild(createGroupForm());
};
