import React from "react";
import "./FilterSelect.css";

function FilterSelect({ onFilterChange }) {
  return (
    <div className="filter-container">
      <select
        id="filter-select"
        onChange={(e) => onFilterChange(e.target.value)}
      >
        <option value="공감순">최신순</option>
        <option value="최신순">게시글 많은순</option>
        <option value="최신순">공감순</option>
        <option value="최신순">획득 배지순</option>
      </select>
    </div>
  );
}

export default FilterSelect;
