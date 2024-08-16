import React from "react";
import { Link, Route, Routes } from "react-router-dom";

import CreateGroup from "./pages/CreateGroup";
import Home from "./pages/Home";

function App() {
  return (
    <div className="App">
      <nav>
        <Link to="/">Home</Link> | <Link to="/creategroup">CreateGroup</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/creategroup" element={<CreateGroup />} />
      </Routes>
    </div>
  );
}

export default App;
