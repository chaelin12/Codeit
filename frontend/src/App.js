import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";

import AccessPrivate from "./pages/AccessPrivate";
import AccessPrivatePost from "./pages/AccessPrivatePost";
import CreateGroup from "./pages/CreateGroup";
import GroupDetail from "./pages/GroupDetail";
import PostDetail from "./pages/PostDetail";
import PrivateGroup from "./pages/PrivateGroup";
import PublicGroup from "./pages/PublicGroup";
import UploadPost from "./pages/UploadPost";

import "./App.css";
import logo from "./assets/pictures/logo.png";

function App() {
  const location = useLocation();
  return (
    <div className="App">
      {location.pathname !== "/" && location.pathname !== "/PrivateGroup" && (
        <div className="logo-container">
          <img src={logo} alt="Logo" className="logo" />
        </div>
      )}
      <Routes>
        <Route path="/" element={<PublicGroup />} />
        <Route path="/creategroup" element={<CreateGroup />} />
        <Route path="/privateGroup" element={<PrivateGroup />} />
        <Route path="/accessPrivate/:groupId" element={<AccessPrivate />} />
        <Route
          path="/accessPrivatepost/:postId"
          element={<AccessPrivatePost />}
        />
        <Route path="/groupdetail/:groupId" element={<GroupDetail />} />
        <Route path="/uploadPost/:groupId" element={<UploadPost />} />
        <Route path="/postdetail/:postId" element={<PostDetail />} />
      </Routes>
    </div>
  );
}

export default App;
