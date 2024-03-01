import React, { useState } from "react";
import ReactPlayer from 'react-player/youtube';

const Content = ({ selectedTask, puzzleData }) => {
  const [selectedPuzzle, setSelectedPuzzle] = useState(null);

  const handleDifficultyBoxButtonClick = (puzzleId) => {
    const clickedPuzzle = puzzleData.find((puzzle) => puzzle.id === puzzleId);
    setSelectedPuzzle(clickedPuzzle);
  };

  const renderPuzzleButtons = (puzzles) => {
    return puzzles.map((puzzle, index) => (
      <button
        key={puzzle.id}
        onClick={() => handleDifficultyBoxButtonClick(puzzle.id)}
        className={
          selectedPuzzle?.id === puzzle.id
            ? "active active-difficulty-button"
            : ""
        }
      >
        {index + 1}
      </button>
    ));
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
        <h2>{selectedPuzzle.puzzle_question}</h2>
        <ReactPlayer url={selectedPuzzle.puzzle_video} />
      </div>
    );
  };

  const renderDifficultyBoxButtons = () => {
    const easyPuzzles = puzzleData.filter((puzzle) => puzzle.level.toLowerCase() === "easy");
    const mediumPuzzles = puzzleData.filter((puzzle) => puzzle.level.toLowerCase() === "medium");
    const hardPuzzles = puzzleData.filter((puzzle) => puzzle.level.toLowerCase() === "hard");


    return (
      <div className="difficulty-container">
        <div className="difficulty-box">
          <h3>Easy</h3>
          <div className="difficulty-buttons">
            {renderPuzzleButtons(easyPuzzles)}
          </div>
        </div>
        <div className="difficulty-box">
          <h3>Medium</h3>
          <div className="difficulty-buttons">
            {renderPuzzleButtons(mediumPuzzles)}
          </div>
        </div>
        <div className="difficulty-box">
          <h3>Hard</h3>
          <div className="difficulty-buttons">
            {renderPuzzleButtons(hardPuzzles)}
          </div>
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
