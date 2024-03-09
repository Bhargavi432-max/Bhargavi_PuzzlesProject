import React, { useState, useEffect } from "react";
import SideNavbar from "./SideNavbar";
import Content from "./Content";
import { useNavigate } from "react-router-dom";
import WelcomImage from "./Images/WelcomImage.png";
import CloudImage from "./Images/CloudImage.png";
import "./PuzzlePage.css";

const PuzzlePage = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [tasks, setTasks] = useState([]); // Initialize tasks as an empty array
  const [selectedTask, setSelectedTask] = useState(null);
  const [puzzleData, setPuzzleData] = useState([null]);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(true);
  const navigate = useNavigate();
  const email = localStorage.getItem('email');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/get_task_statuses/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: email }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }

        const data = await response.json();
        setTasks(data.tasks); 
        console.log(data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchData();
  }, []); // Empty dependency array to ensure the effect runs only once when the component mounts

  useEffect(() => {
    const isAuthenticated = !!email;
    setAuthenticated(isAuthenticated);

    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [email, navigate]);

  const welcomeMessage = "Welcome to the puzzle page. Let's begin!";

  const handleSidebarButtonClick = async (id) => {
    setShowWelcomeMessage(false);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/get_ids/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ taskId: id, email: email }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
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
            {/* Pass tasks only if it's not null or undefined */}
            {tasks && tasks.length > 0 && (
              <SideNavbar
                tasks={tasks}
                handleSidebarButtonClick={handleSidebarButtonClick}
                selectedTaskId={selectedTask?.id}
              />
            )}
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
