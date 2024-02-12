import React from "react";

const Sidebar = ({ puzzles, handleSidebarButtonClick, selectedPuzzleId }) => {
  const handleClick = (id) => {
    handleSidebarButtonClick(id);
  };

  return (
    <div className="sidenavbar">
      {puzzles.map((puzzle) => (
        <button
          key={puzzle.id}
          onClick={() => handleClick(puzzle.id)}
          className={selectedPuzzleId === puzzle.id ? "active" : ""}
        >
          {puzzle.id}
        </button>
      ))}
    </div>
  );
};

export default Sidebar;
