import React, { useState, useEffect } from "react";
import SideNavbar from "./SideNavbar";
import Content from "../Content.js";
import { useNavigate } from "react-router-dom";
import WelcomImage from "../Images/WelcomImage.png";
import "../CSSFiles/PuzzlePage.css";

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
    } else {
      // Check if there's stored data for the current user in localStorage
      const storedTask = JSON.parse(localStorage.getItem("selectedTask"));
      const storedPuzzleData = JSON.parse(localStorage.getItem("puzzleData"));
      if (storedTask && storedPuzzleData) {
        setSelectedTask(storedTask);
        setPuzzleData(storedPuzzleData);
        setShowWelcomeMessage(false);
      } else {
        // Fetch data from the server and update localStorage
        fetchDataFromServer();
      }
    }
  }, [email, navigate]);

  const fetchDataFromServer = async (id) => {
    // Fetch data from the server
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

      // Update localStorage with fetched data
      localStorage.setItem("selectedTask", JSON.stringify({ id }));
      localStorage.setItem("puzzleData", JSON.stringify(data.full_ids));
    } catch (error) {
      console.error("Error fetching data from the server", error);
    }
  };

  const welcomeMessage = "Welcome to the puzzle page. Let's begin!";

  const handleSidebarButtonClick = async (id) => {
    setShowWelcomeMessage(false); // Hide welcome message when a task is clicked
    fetchDataFromServer(id);
  };

  return (
    authenticated && (
      <div className="container-fluid">
        <div className="row">
          <div className="sidebar">
            <SideNavbar
              tasks={tasks}
              handleSidebarButtonClick={handleSidebarButtonClick}
              selectedPuzzleId={selectedTask?.id}
            />
          </div>
          <div className="content-box">
            {showWelcomeMessage ? ( // Display welcome message conditionally
              <div className={`cloud-message-container ${showWelcomeMessage ? 'show-welcome-message' : ''}`}>
                <div className="welcome-message">{welcomeMessage}</div>
                {/* <img src={CloudImage} alt="cloud Image" /> */}
                <img src={WelcomImage} alt="Welcome" className="welcome-image"/>
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
