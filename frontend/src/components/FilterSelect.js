import React from "react";
import "./FilterSelect.css";

function FilterSelect({ onFilterChange }) {
  return (
    <div className="filter-container">
      <select
        id="filter-select"
        onChange={(e) => onFilterChange(e.target.value)}
      >
        <option value="공감순">공감순</option>
        <option value="최신순">최신순</option>
      </select>
    </div>
  );
}

export default FilterSelect;
