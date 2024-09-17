import React from "react";
import "./FilterSelect.css";

function FilterPostSelect({ onFilterChange }) {
  return (
    <div className="filter-container">
      <select
        id="filter-select"
        onChange={(e) => onFilterChange(e.target.value)}
      >
        <option value="최신순">최신순</option>
        <option value="댓글순">댓글순</option>
        <option value="공감순">공감순</option>
      </select>
    </div>
  );
}

export default FilterPostSelect;
