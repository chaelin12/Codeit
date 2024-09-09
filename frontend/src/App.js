import React from "react";
import { Link, Route, Routes } from "react-router-dom";

import AccessPrivate from "./pages/AccessPrivate";
import CreateGroup from "./pages/CreateGroup";
import GroupDetail from "./pages/GroupDetail";
import PostDetail from "./pages/PostDetail";
import PrivateGroup from "./pages/PrivateGroup";
import PublicGroup from "./pages/PublicGroup";
import UploadPost from "./pages/UploadPost";

import "./App.css";
import logo from "./assets/pictures/logo.png";

function App() {
  return (
    <div className="App">
      <div className="logo-container">
        <img src={logo} alt="Logo" className="logo" />
      </div>

      <nav>
        <Link to="/">PublicGroup</Link> |{" "}
        <Link to="/privateGroup">PrivateGroup</Link> |{" "}
        <Link to="/accessPrivate">AccessPrivate</Link> |{" "}
        <Link to="/uploadPost">UploadPost</Link> |{" "}
      </nav>

      <Routes>
        <Route path="/" element={<PublicGroup />} />
        <Route path="/creategroup" element={<CreateGroup />} />
        <Route path="/privateGroup" element={<PrivateGroup />} />
        <Route path="/accessPrivate" element={<AccessPrivate />} />
        <Route path="/groupdetail/:groupId" element={<GroupDetail />} />
        <Route path="/uploadPost/:groupId" element={<UploadPost />} />
        <Route path="/postdetail/:postId" element={<PostDetail />} />
      </Routes>
    </div>
  );
}

export default App;
