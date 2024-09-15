import React from "react";
import searchIcon from "../assets/pictures/search.png";
import "./SearchBar.css";

function SearchBar({ onSearch, placeholder }) {
  return (
    <div className="search-container">
      <input
        type="text"
        id="search-input"
        placeholder={placeholder}
        onChange={(e) => onSearch(e.target.value)}
        style={{
          backgroundImage: `url(${searchIcon})`, // 아이콘 추가
          backgroundPosition: "10px center", // 아이콘 위치 설정
          backgroundRepeat: "no-repeat", // 아이콘 반복 방지
        }}
      />
    </div>
  );
}

export default SearchBar;
