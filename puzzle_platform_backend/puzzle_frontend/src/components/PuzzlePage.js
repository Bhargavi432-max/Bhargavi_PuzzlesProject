import React, { useState, useEffect } from "react";
import SideNavbar from "./SideNavbar";
import Content from "./Content";
//import { useEmail } from "./EmailContext";

const PuzzlePage = () => {
  const tasks = [];
  for (let index = 0; index < 25; index++) {
    tasks.push({ id: index + 1 });
  }

  const [selectedTask, setSelectedTask] = useState(null);
  const [puzzleData, setPuzzleData] = useState([null]);
  const email = localStorage.getItem('email');

  const handleSidebarButtonClick = async (id) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/get_ids/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ taskId: id, email: email }), // Using email here
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log(data);
      setSelectedTask({ id });
      setPuzzleData(data.full_ids);
    } catch (error) {
      console.error("Error sending task ID and email to backend", error);
    }
  };

  useEffect(() => {
    handleSidebarButtonClick(); 
  }, [email]);

  return (
    <div className="puzzlepage">
      <SideNavbar
        tasks={tasks}
        handleSidebarButtonClick={handleSidebarButtonClick}
        selectedPuzzleId={selectedTask?.id}
      />
      <Content
        selectedTask={selectedTask}
        puzzleData={puzzleData} 
      />
    </div>
  );
};

export default PuzzlePage;
