import React from "react";

const SearchBar = ({ search, setSearch }) => {
  return (
    <input
      type="text"
      placeholder="Search FAQs..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="input"
    />
  );
};

export default SearchBar;