import React from "react";

const Content = ({
  selectedPuzzle,
  puzzleData,
  handleDifficultyBoxButtonClick,
}) => {
  const renderPuzzleButtons = (puzzles) => {
    return puzzles.map((puzzle, index) => (
      <button
        key={puzzle.id}
        onClick={() => handleDifficultyBoxButtonClick(puzzle.id)}
        className={selectedPuzzle?.id === puzzle.id ? "active active-difficulty-button" : ""}
      >
        {index + 1}
      </button>
    ));
  };

  const renderDifficultyBoxButtons = () => {
    
    const easyPuzzles = puzzleData.filter(puzzle => puzzle.level === 'easy');
    const mediumPuzzles = puzzleData.filter(puzzle => puzzle.level === 'medium');
    const hardPuzzles = puzzleData.filter(puzzle => puzzle.level === 'hard');

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
      {selectedPuzzle && renderDifficultyBoxButtons()}
    </div>
  );
};

export default Content;
