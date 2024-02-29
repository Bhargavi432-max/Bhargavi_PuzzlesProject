import React from "react";

const SideNavbar = ({ tasks, handleSidebarButtonClick, selectedPuzzleId }) => {
  const handleClick = (id) => {
    handleSidebarButtonClick(id);
  };

  return (
    <div className="sidenavbar">
      {tasks.map((task) => (
        <button
          key={task.id}
          onClick={() => handleClick(task.id)}
          className={selectedPuzzleId === task.id ? "active" : ""}
        >
          {task.id}
        </button>
      ))}
    </div>
  );
};

export default SideNavbar;