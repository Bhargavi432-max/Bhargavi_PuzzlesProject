import React from "react";
import "./SideNavBar.css";

const SideNavbar = ({
  tasks,
  handleSidebarButtonClick,
  selectedPuzzleId,
  taskStatus,
}) => {
  const email = localStorage.getItem('email');

  const handleClick = async (id) => {
    handleSidebarButtonClick(id);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/log_task_click/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          task_id: id,
          action_item: 'Clicked on task'
        })
      });
      console.log({email,id});
      if (!response.ok) {
        throw new Error('Failed to log task click');
      }
    } catch (error) {
      console.error('Error logging task click:', error);
    }
  };

  return (
    <div className="Sidebar-container">
      <div className="sidenavbar" id="Scrollbar">
        {tasks.map((task) => (
          <div key={task.id} className="button-container">
            <button
              onClick={() => handleClick(task.id)}
              className={`task-button ${
                selectedPuzzleId === task.id ? "active" : ""
              } ${
                taskStatus && taskStatus[task.id]
                  ? taskStatus[task.id]
                  : "notstarted"
              } ${taskStatus && taskStatus[task.id] === "completed" ? "completed" : ""}`}
            >
              {`Task ${task.id}`}
              <span className="arrow"></span>
            </button>
            <div className="tooltipside">{`Task ${task.id}`}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SideNavbar;
