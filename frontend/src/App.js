import React from "react";
import { Link, Route, Routes } from "react-router-dom";

import AccessPrivate from "./pages/AccessPrivate";
import CreateGroup from "./pages/CreateGroup";
import PrivateGroup from "./pages/PrivateGroup";
import PublicGroup from "./pages/PublicGroup";

function App() {
  return (
    <div className="App">
      <nav>
        <Link to="/">PublicGroup</Link> |{" "}
        <Link to="/creategroup">CreateGroup</Link> |{" "}
        <Link to="/privateGroup">PrivateGroup</Link> |{" "}
        <Link to="/accessPrivate">AccessPrivate</Link>
      </nav>
      <Routes>
        <Route path="/" element={<PublicGroup />} />
        <Route path="/creategroup" element={<CreateGroup />} />
        <Route path="/privateGroup" element={<PrivateGroup />} />
        <Route path="/accessPrivate" element={<AccessPrivate />} />
      </Routes>
    </div>
  );
}

export default App;
