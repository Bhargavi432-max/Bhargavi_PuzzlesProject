import React, { useState } from "react";
import ReactPlayer from 'react-player/youtube';
import "./Content.css";

const Content = ({ selectedTask, puzzleData }) => {
  const [selectedPuzzle, setSelectedPuzzle] = useState(null);
  const email = localStorage.getItem('email');

  const handleDifficultyBoxButtonClick = (puzzleId) => {
    const clickedPuzzle = puzzleData.find((puzzle) => puzzle.id === puzzleId);
    setSelectedPuzzle(clickedPuzzle); // Use localStorage email if selectedTask is not available
    
    fetch('http://127.0.0.1:8000/api/get_puzzle_access/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        task_id: selectedTask ? selectedTask.id : null, // Assuming selectedTask contains task ID
        puzzle_id: puzzleId,
      }),

    })
    
    .then(response => {
      if (response.ok) {
        console.log('Request successful');
      } else {
        console.error('Request failed');
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
  };

  const renderDifficultyBoxButtons = () => {
    const easyPuzzles = puzzleData.filter((puzzle) => puzzle.level.toLowerCase() === "easy");
    const mediumPuzzles = puzzleData.filter((puzzle) => puzzle.level.toLowerCase() === "medium");
    const hardPuzzles = puzzleData.filter((puzzle) => puzzle.level.toLowerCase() === "hard");

    const renderButtons = (puzzles) => {
      const buttonRows = [];
      for (let i = 0; i < puzzles.length; i += 6) {
        const rowPuzzles = puzzles.slice(i, i + 6);
        const rowButtons = rowPuzzles.map((puzzle) => {
          let buttonClass = "difficulty-button";
          if (selectedPuzzle?.id === puzzle.id) {
            buttonClass += ` current-${puzzle.level.toLowerCase()}`;
          } else {
            if (puzzle.user_status === 'completed') {
                buttonClass += ` completed-${puzzle.level.toLowerCase()}`;
            } else if (puzzle.user_status === 'incompleted') {
              buttonClass += ` incompleted`;
            } else if (puzzle.user_status === 'notstarted') {
              buttonClass += ` notstarted`;
            }
        }
          return (
            <button
              key={puzzle.id}
              onClick={() => handleDifficultyBoxButtonClick(puzzle.id)}
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

  const renderPuzzleDetails = () => {
    if (!selectedPuzzle) {
      return null;
    }

    if (!selectedPuzzle.puzzle_question || !selectedPuzzle.puzzle_video) {
      return <p>No data found for this puzzle</p>;
    }

    return (
      <div className="puzzle-details">
        <div className="question-container">
          <h2 className="question-Name">Puzzle No: {selectedPuzzle.puzzle_no}</h2>
          <div className="question-Box">
            <h2>{selectedPuzzle.puzzle_question}</h2>
          </div>
        </div>
        <div className="video-container">
          <ReactPlayer className="react-player" url={selectedPuzzle.puzzle_video} />
        </div>
      </div>
    );
  };

  return (
    <div className="content">
      {selectedTask && renderDifficultyBoxButtons()}
      {renderPuzzleDetails()}
    </div>
  );
};

export default Content;