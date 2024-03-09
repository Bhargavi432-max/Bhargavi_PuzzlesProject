import React from "react";
import "./SideNavBar.css";

const SideNavbar = ({
  tasks,
  handleSidebarButtonClick,
  selectedPuzzleId,
  taskStatus,
}) => {
  const handleClick = (id) => {
    handleSidebarButtonClick(id);
  };

  return (
    <div className="Sidebar-container">
      <div className="sidenavbar" id="Scrollbar">
        {tasks.map((task) => (
          <button
            key={task.id}
            onClick={() => handleClick(task.id)}
            className={`task-button ${selectedPuzzleId === task.id ? "active" : ""} ${taskStatus && taskStatus[task.id] ? taskStatus[task.id] : "notstarted"}`}
          >
            {`Task ${task.id}`}
            <span className="arrow"></span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SideNavbar;