import React, { useState } from "react";
import ReactPlayer from 'react-player/youtube';
import "./Content.css";

const Content = ({ selectedTask, puzzleData }) => {
  const [selectedPuzzle, setSelectedPuzzle] = useState(null);
  const [selectedPuzzleDetails, setSelectedPuzzleDetails] = useState(null);
  const email = localStorage.getItem('email');

  const handleDifficultyBoxButtonClick = async (puzzleId) => {
    const clickedPuzzle = puzzleData.find((puzzle) => puzzle.puzzle_id === puzzleId);
    setSelectedPuzzle(clickedPuzzle);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/get_puzzle_access/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          task_id: selectedTask ? selectedTask.id : null,
          puzzle_id: puzzleId,
        }),
      });
  
      if (response.ok) {
        const data = await response.json();
        setSelectedPuzzleDetails(data, () => {
          console.log(selectedPuzzleDetails); // Log the updated state here
        });
        console.log(data);
        console.log('Request successful');
      } else {
        console.error('Request failed');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const renderButtons = (puzzles) => {
    return puzzles.map((puzzle) => {
      let buttonClass = "difficulty-button";
      if (selectedPuzzle && selectedPuzzle.id === puzzle.id) {
        buttonClass += ` current-${puzzle.level.toLowerCase()}`;
      } else {
        buttonClass += ` ${puzzle.user_status?.toLowerCase() ?? 'unknown'}`;
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
  };

  const renderDifficultyBox = (puzzleLevel, puzzles) => {
    return (
      <div className="difficulty-box-container">
        <div className="difficulty-title">{puzzleLevel} Level</div>
        <div className="difficulty-box shadow p-3 mb-5 bg-white rounded">
          <div className="difficulty-buttons">
            {renderButtons(puzzles)}
          </div>
        </div>
      </div>
    );
  };

  const renderDifficultyBoxButtons = () => {
    const easyPuzzles = puzzleData.filter((puzzle) => puzzle.level.toLowerCase() === "easy");
    const mediumPuzzles = puzzleData.filter((puzzle) => puzzle.level.toLowerCase() === "medium");
    const hardPuzzles = puzzleData.filter((puzzle) => puzzle.level.toLowerCase() === "hard");

    return (
      <div className="difficulty-container">
        {renderDifficultyBox("Easy", easyPuzzles)}
        {renderDifficultyBox("Medium", mediumPuzzles)}
        {renderDifficultyBox("Hard", hardPuzzles)}
      </div>
    );
  };

  const renderPuzzleDetails = () => {
    if (!selectedPuzzleDetails || !selectedPuzzleDetails.data) {
      return <p>No data found for this puzzle</p>;
    }
  
    const { video, question } = selectedPuzzleDetails.data;
  
    if (!question || !video) {
      return <p>No data found for this puzzle</p>;
    }
  
    return (
      <div className="puzzle-details">
        <div className="question-container">
          <h2 className="question-Name">Puzzle No: {selectedPuzzleDetails.puzzle_id}</h2>
          <div className="question-Box">
            <h2>{question}</h2>
          </div>
        </div>
        <div className="video-container">
          <ReactPlayer className="react-player" url={video} />
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
