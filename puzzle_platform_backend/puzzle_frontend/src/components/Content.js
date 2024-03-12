import React, { useState, useEffect } from "react";
import LockIcon from "./Images/Vector.png";
import "./Content.css";

const Content = ({ selectedTask, puzzleData }) => {
  const [selectedPuzzle, setSelectedPuzzle] = useState(null);
  const [selectedPuzzleDetails, setSelectedPuzzleDetails] = useState(null);
  const [popupMessage, setPopupMessage] = useState(null);
  const [videoPath, setVideoPath] = useState(null); // State to hold video path
  const [key, setKey] = useState(0);
  const email = localStorage.getItem("email");
  const [startTime, setStartTime] = useState(null);
  const [nextPuzzleId, setNextPuzzleId] = useState(null); // State to hold the id of the next puzzle

  useEffect(() => {
    // Load puzzle details from local storage if available
    const storedPuzzleDetails = JSON.parse(localStorage.getItem("selectedPuzzleDetails"));
    if (storedPuzzleDetails && storedPuzzleDetails.puzzle_id === selectedPuzzle?.puzzle_id) {
      setSelectedPuzzleDetails(storedPuzzleDetails);
      const videoFileName = storedPuzzleDetails.data.video;
      const filePath = videoFileName;
      const filename = filePath.split('/').pop();
      const path = require('../videos/' + filename);
      setVideoPath(path);
    } else {
      setVideoPath(null); // Clear video path when new puzzle is selected
    }
  }, [selectedPuzzle]);

  const handleVideoMouseDown = (e) => {
    e.preventDefault();
  };

  const handleDifficultyBoxButtonClick = (puzzleId) => {
    const clickedPuzzle = puzzleData.find((puzzle) => puzzle.puzzle_id === puzzleId);
    setSelectedPuzzle(clickedPuzzle);
    fetch("http://127.0.0.1:8000/api/get_puzzle_access/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        task_id: selectedTask ? selectedTask.id : null,
        puzzle_id: puzzleId,
      }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Request failed");
        }
      })
      .then((data) => {
        console.log(data.data);
        if (data.data) {
          setSelectedPuzzle(clickedPuzzle);
          setSelectedPuzzleDetails(data);
          localStorage.setItem("selectedPuzzleDetails", JSON.stringify(data));
          const videoFileName = data.data.video;
          const filePath = videoFileName;
          const filename = filePath.split('/').pop();
          const path = require('../videos/' + filename);
          setVideoPath(path);
          setKey((prevKey) => prevKey + 1);
          setNextPuzzleId(data.next_puzzle_id); // Set the next puzzle id
        } else {
          setPopupMessage(data.message);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const handleVideoStart = () => {
    const currentDateTime = new Date();
    const startTime = currentDateTime.toLocaleDateString('en-US', {year: 'numeric', month: '2-digit', day: '2-digit'}) + ' ' + currentDateTime.toLocaleTimeString('en-US', {hour12: false}); 
    setStartTime(startTime);
  };
  const formatDuration = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
  
    return [hours, minutes, seconds]
      .map((val) => val < 10 ? `0${val}` : val)
      .join(":");
  };
  const handleVideoEnd = () => {
    const currentDateTime = new Date();
    const endTime = currentDateTime.toLocaleDateString('en-US', {year: 'numeric', month: '2-digit', day: '2-digit'}) + ' ' + currentDateTime.toLocaleTimeString('en-US', {hour12: false});
    const elapsedTimeInSeconds = (currentDateTime.getTime() - new Date(startTime).getTime()) / 1000;
    const duration = formatDuration(elapsedTimeInSeconds);
    const puzzleStatus = "completed";
    const questionViewStatus = true;
    const videoViewStatus = true;
    const taskStatus = "incomplete";
    const actionItem = "puzzle completed";

    // Fetch request to mark puzzle status
    fetch("http://127.0.0.1:8000/api/mark_puzzle_status/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        task_id: selectedTask ? selectedTask.id : null,
        puzzle_id: selectedPuzzle.puzzle_id,
        puzzle_status: puzzleStatus,
        time_spent: duration,
      }),
    })
    .then((response) => {
      if (response.ok) {
        console.log({email,selectedTask,selectedPuzzle,puzzleStatus,duration});
        return response.json();
      } else {
        throw new Error("Request failed");
      }
    })
    .then((data) => {
      console.log(data); // Log the response from the backend
    })
    .catch((error) => {
      console.error("Error:", error);
    });

    // Fetch request to log puzzle click
    fetch("http://127.0.0.1:8000/api/log_puzzle_click/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        task_id: selectedTask ? selectedTask.id : null,
        puzzle_id: selectedPuzzle.puzzle_id,
        question_view_status: questionViewStatus,
        video_view_status: videoViewStatus,
        puzzle_status: puzzleStatus,
        task_status: taskStatus,
        start_time: startTime,
        end_time: endTime,
        action_item: actionItem,
      }),
    })
    .then((response) => {
      console.log({email, selectedTask, selectedPuzzle, questionViewStatus, videoViewStatus, endTime, startTime});
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Request failed");
      }
    })
    .then((data) => {
      console.log(data); // Log the response from the backend
      // Move to the next puzzle if the nextPuzzleId is set
      if (nextPuzzleId) {
        handleDifficultyBoxButtonClick(nextPuzzleId);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
  };

  const renderDifficultyBoxButtons = () => {
    const easyPuzzles = puzzleData.filter(
      (puzzle) => puzzle.level.toLowerCase() === "easy"
    );
    const mediumPuzzles = puzzleData.filter(
      (puzzle) => puzzle.level.toLowerCase() === "medium"
    );
    const hardPuzzles = puzzleData.filter(
      (puzzle) => puzzle.level.toLowerCase() === "hard"
    );
    const renderButtons = (puzzles) => {
      const buttonRows = [];
      for (let i = 0; i < puzzles.length; i += 6) {
        const rowPuzzles = puzzles.slice(i, i + 6);
        const rowButtons = rowPuzzles.map((puzzle) => {
          let buttonClass = "difficulty-button";
          if (selectedPuzzle && selectedPuzzle.puzzle_id === puzzle.puzzle_id) {
            buttonClass += ` current-${puzzle.level && puzzle.level.toLowerCase()}`;
          } else {
            if (puzzle.user_status === "completed") {
              buttonClass += ` completed-${puzzle.level && puzzle.level.toLowerCase()}`;
            } else if (puzzle.user_status === "incompleted") {
              buttonClass += ` incompleted`;
            } else if (puzzle.user_status === "notstarted") {
              buttonClass += ` notstarted`;
            }
          }
          // If puzzle is locked, add lock icon below the button
          const lockIcon = puzzle.puzzle_locked ? <img src={LockIcon} className="lock-icon" alt="Locked" /> : null;
          return (
            <div key={puzzle.id} className="button-container" style={{ position: "relative" }}>
              <button
                onClick={() => handleDifficultyBoxButtonClick(puzzle.puzzle_id)}
                className={buttonClass}
                disabled={puzzle.puzzle_locked} // Disable button if puzzle is locked
              >
                {puzzle.id}
              </button>
              {lockIcon}
            </div>
          );
        });
        buttonRows.push(
          <div key={`row-${i / 6}`} className="button-row">
            {rowButtons}
          </div>
        );
      }
      return buttonRows;
    };
    return (
      <div className="difficulty-container">
        <div className="difficulty-box-container">
          <div className="difficulty-title">Easy Level</div>
          <div className="difficulty-box shadow p-3 mb-5 bg-white rounded">
            <div className="difficulty-buttons">
              {renderButtons(easyPuzzles)}
            </div>
          </div>
        </div>
        <div className="difficulty-box-container">
          <div className="difficulty-title">Medium Level</div>
          <div className="difficulty-box shadow p-3 mb-5 bg-white rounded">
            <div className="difficulty-buttons">
              {renderButtons(mediumPuzzles)}
            </div>
          </div>
        </div>
        <div className="difficulty-box-container">
          <div className="difficulty-title">Hard Level</div>
          <div className="difficulty-box shadow p-3 mb-5 bg-white rounded">
            <div className="difficulty-buttons">
              {renderButtons(hardPuzzles)}
            </div>
          </div>
        </div>
      </div>
    );
  };

   const renderPopup = () => {
    if (popupMessage) {
      return (
        <div className="popup-container">
          <div className="popup">
            <div className="popup-content">
              <p className="pop-text">{popupMessage}</p>
              <button className="close-button" onClick={() => setPopupMessage(null)}>Subscribe Now</button>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderPuzzleDetails = () => {
    if (!selectedPuzzleDetails || !selectedPuzzleDetails.data) {
      return null;
    }

    const { question } = selectedPuzzleDetails.data;

    if (!question || !videoPath) {
      return <p>No data found for this puzzle</p>;
    }

    return (
      <div className="puzzle-details">
        <div className="question-container">
          <h2 className="question-Name">
            Puzzle No: {selectedPuzzleDetails.puzzle_id}
          </h2>
          <div className="question-Box">
            <h2>{question}</h2>
          </div>
        </div>
        <div className="video-container" key={key}>
          <video
            controls
            controlsList="nodownload noremoteplayback"
            disableRemotePlayback
            onContextMenu={(e) => e.preventDefault()}
            onMouseDown={handleVideoMouseDown}
            onEnded={handleVideoEnd}
            onPlay={handleVideoStart}
            className="react-player"
          >
            <source src={videoPath} type="video/mp4" />
          </video>
        </div>
      </div>
    );
  };

  return (
    <div className="content">
      {renderPopup()}
      {selectedTask && renderDifficultyBoxButtons()}
      {renderPuzzleDetails()}
    </div>
  );
};

export default Content;
