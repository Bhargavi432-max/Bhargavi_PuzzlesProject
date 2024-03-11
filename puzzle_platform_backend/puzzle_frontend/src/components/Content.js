import React, { useState, useEffect } from "react";
import ReactPlayer from "react-player/youtube";
import "./Content.css";

const Content = ({ selectedTask, puzzleData }) => {
  const [selectedPuzzle, setSelectedPuzzle] = useState(null);
  const [selectedPuzzleDetails, setSelectedPuzzleDetails] = useState(null);
  const [popupMessage, setPopupMessage] = useState(null);
  const email = localStorage.getItem("email");

  useEffect(() => {
    // Load puzzle details from local storage if available
    const storedPuzzleDetails = JSON.parse(localStorage.getItem("selectedPuzzleDetails"));
    if (storedPuzzleDetails && storedPuzzleDetails.puzzle_id === selectedPuzzle?.puzzle_id) {
      setSelectedPuzzleDetails(storedPuzzleDetails);
    }
  }, [selectedPuzzle]);

  const handleDifficultyBoxButtonClick = (puzzleId) => {
    const clickedPuzzle = puzzleData.find((puzzle) => puzzle.id === puzzleId);
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
          setSelectedPuzzleDetails(data);
          localStorage.setItem("selectedPuzzleDetails", JSON.stringify(data));
          console.log("Selected puzzle details:", data.data);
        } else {
          setPopupMessage(data.message);
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
          if (selectedPuzzle && selectedPuzzle.id === puzzle.puzzle_id) {
            buttonClass += ` current-${
              puzzle.level && puzzle.level.toLowerCase()
            }`;
          } else {
            if (puzzle.user_status === "completed") {
              buttonClass += ` completed-${
                puzzle.level && puzzle.level.toLowerCase()
              }`;
            } else if (puzzle.user_status === "incompleted") {
              buttonClass += ` incompleted`;
            } else if (puzzle.user_status === "notstarted") {
              buttonClass += ` notstarted`;
            }
          }
          return (
            <button
              key={puzzle.id}
              onClick={() => handleDifficultyBoxButtonClick(puzzle.puzzle_id)}
              className={buttonClass}
            >
              {puzzle.id}
            </button>
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
  
    const { video, question } = selectedPuzzleDetails.data;
    
    if (!question || !video) {
      return <p>No data found for this puzzle</p>;
    }
  
    // Extracting the video file name from the path
    const videoFileName = video;
    // const saveFolderPath = videoFileName.split('/').filter(part => part !== '').shift();
    console.log("videoFileName",videoFileName);
  
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
        <div className="video-container">
          {/* <ReactPlayer
            className="react-player"
            url={videoFileName}
            controls={true}
          /> */}
          <video 
          controls 
          className="react-player">
          <source src={`../../../${videoFileName}`} type="video/mp4" />
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
