import React, { useState, useEffect } from "react";
import SideNavbar from "./SideNavbar";
import Content from "./Content";
import { useNavigate } from "react-router-dom";
import WelcomImage from "./Images/WelcomImage.png";
import CloudImage from"./Images/CloudImage.png";
import "./PuzzlePage.css";

const PuzzlePage = () => {
  const tasks = [];
  for (let index = 0; index < 25; index++) {
    tasks.push({ id: index + 1 });
  }

  const [authenticated, setAuthenticated] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [puzzleData, setPuzzleData] = useState([null]);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(true); // State to control welcome message visibility
  const navigate = useNavigate();
  const email = localStorage.getItem('email');
  useEffect(() => {
    const isAuthenticated = !!email;
    setAuthenticated(isAuthenticated);

    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [email, navigate]);

  const welcomeMessage = "Welcome to the puzzle page. Let's begin!";

  const handleSidebarButtonClick = async (id) => {
    setShowWelcomeMessage(false); // Hide welcome message when a task is clicked
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

  return (
    authenticated && (
      <div className="container-fluid">
        <div className="row">
          <div className="sidebar">
            <SideNavbar
              tasks={tasks}
              handleSidebarButtonClick={handleSidebarButtonClick}
              selectedTaskId={selectedTask?.id}
            />
          </div>
          <div className="content-box">
            {showWelcomeMessage ? ( 
              <div className={`cloud-message-container ${showWelcomeMessage ? 'show-welcome-message' : ''}`}>
                <div className="welcome-message">{welcomeMessage}</div>
                <img src={WelcomImage} alt="Welcome Image" className="welcome-image"/>
              </div>
            ) : (
              <Content
                selectedTask={selectedTask}
                puzzleData={puzzleData}
              />
            )}
          </div>
        </div>
      </div>
    )
  );
};

export default PuzzlePage;
