import React, { useState, useEffect } from "react";
import LockIcon from "./Images/Vector.png";
import "./Content.css";
import Wallet from "./SubscriptionPage";
import { useNavigate } from "react-router-dom";

const Content = ({ selectedTask, puzzleData }) => {
  const [Isvideocomplete, setIsvideocomplete] = useState(false);
  const [selectedPuzzle, setSelectedPuzzle] = useState(null);
  const navigate = useNavigate();
  const [selectedPuzzleDetails, setSelectedPuzzleDetails] = useState(null);
  const [popupMessage, setPopupMessage] = useState(null);
  const [videoPath, setVideoPath] = useState(null); // State to hold video path
  const [key, setKey] = useState(0);
  const email = localStorage.getItem("email");
  const [startTime, setStartTime] = useState(null);
  const [nextPuzzleId, setNextPuzzleId] = useState(null);
  const [completedPuzzles, setCompletedPuzzles] = useState([]); // State to hold the id of the next puzzle

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

  useEffect(() => {
    if (nextPuzzleId) {
      fetch("http://127.0.0.1:8000/api/check_puzzle_locked/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        task_id: selectedTask ? selectedTask.id : null,
        puzzle_id: nextPuzzleId,
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
        console.log(data);
        if (data.status) {
          if(!data.puzzle_locked){
            console.log('safdas')
            const clickedPuzzle = puzzleData.find((puzzle) => puzzle.puzzle_id === nextPuzzleId);
            clickedPuzzle.puzzle_locked = false;
            console.log(clickedPuzzle)
            console.log(nextPuzzleId);
            handleDifficultyBoxButtonClick(nextPuzzleId);
          }else{
            setPopupMessage("Puzzle is Locked.Please Upgrade your plan to access it");
          }
        } else {
          setPopupMessage(data.message);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
    }
  }, [nextPuzzleId]);

  const handleVideoMouseDown = (e) => {
    e.preventDefault();
  };

  const handleDifficultyBoxButtonClick = (puzzleId) => {
    const clickedPuzzle = puzzleData.find((puzzle) => puzzle.puzzle_id === puzzleId);
    console.log("click:",clickedPuzzle.puzzle_locked);
    
    if(!clickedPuzzle.puzzle_locked){
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
          // setNextPuzzleId(data.next_puzzle_id); // Set the next puzzle id
        } else {
          setPopupMessage(data.message);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
    }else{
      setPopupMessage("Puzzle is Locked.Please Upgrade your plan to access it");
    }
  };

  const handleVideoStart = () => {
    setIsvideocomplete(false);
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
    setCompletedPuzzles([...completedPuzzles, selectedPuzzle.puzzle_id]);
    setIsvideocomplete(true);

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
      setNextPuzzleId(data.next_puzzle_id)
      if (nextPuzzleId) {



        handleDifficultyBoxButtonClick(nextPuzzleId);
      }
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
        const rowButtons = rowPuzzles.map((puzzle, index) => {
          let buttonClass = "difficulty-button";
          if (selectedPuzzle && selectedPuzzle.puzzle_id === puzzle.puzzle_id) {
            buttonClass += ` current-${puzzle.level && puzzle.level.toLowerCase()}`;
          } else {
            if (puzzle.user_status === "completed" || completedPuzzles.includes(puzzle.puzzle_id)) {
              buttonClass += ` completed-${puzzle.level && puzzle.level.toLowerCase()}`;
            } else if (puzzle.user_status === "incompleted") {
              buttonClass += ` incompleted`;
            } else if (puzzle.user_status === "notstarted") {
              buttonClass += ` notstarted`;
            }
          }
          // If puzzle is locked, add lock icon below the button
          return (
            <div key={puzzle.id} className="button-container" style={{ position: "relative" }}>
              <button
                onClick={() => handleButtonClick(puzzle, i + index)} // Modified onClick handler
                className={buttonClass}
                // disabled={puzzle.puzzle_locked} // Disable button if puzzle is locked
              >
                {i + index + 1}
              </button>
              {puzzle.puzzle_locked && <img src={LockIcon} className="lock-icon" alt="Locked" />}
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
    
    
    const handleButtonClick = (puzzle, buttonIndex) => {
      if (puzzle.puzzle_locked) {
        setPopupMessage("This puzzle is locked!.please upgrade your plan.");
      } else {
        handleDifficultyBoxButtonClick(puzzle.puzzle_id, buttonIndex);
      }
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
  const handleClosePopup = () => {
    setPopupMessage(null);
    navigate('/home');
    
  };
  

   const renderPopup = () => {
    if (popupMessage) {
      return (
        <div className="popup-container">
          <div className="popup">
            <div className="popup-content">
              <p className="pop-text">{popupMessage}</p>
              <button className="close-button" onClick={handleClosePopup}>Subscribe</button>
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